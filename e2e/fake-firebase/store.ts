// In-browser stand-in for Firebase, used ONLY by `vite --mode e2e` (see
// vite.config.ts). State is kept in localStorage so it survives reloads and
// Playwright can seed / inspect it via window.__fakeFirebase.
//
// It also enforces a small, hand-written subset of firestore.rules (the parts
// these features rely on: billing is staff-only, feedback is create-once) so the
// UI's handling of permission errors is exercised. It is NOT a rules engine —
// the real rules still need the Firebase emulator / console to verify.

export class Timestamp {
  constructor(public seconds: number, public nanoseconds: number) {}
  static fromDate(date: Date) {
    const ms = date.getTime();
    return new Timestamp(Math.floor(ms / 1000), (ms % 1000) * 1e6);
  }
  static fromMillis(ms: number) {
    return Timestamp.fromDate(new Date(ms));
  }
  static now() {
    return Timestamp.fromDate(new Date());
  }
  toDate() {
    return new Date(this.toMillis());
  }
  toMillis() {
    return this.seconds * 1000 + Math.floor(this.nanoseconds / 1e6);
  }
}

export const SERVER_TS = { __sentinel: "serverTimestamp" };
export const arrayUnionSentinel = (values: unknown[]) => ({ __sentinel: "arrayUnion", values });

type Docs = Record<string, Record<string, any>>; // "col/id" -> data
export type Account = { uid: string; email: string; password: string };
type State = { docs: Docs; accounts: Account[]; session: string | null };

const KEY = "__fakeFirebaseState";

const encode = (v: any): any => {
  if (v instanceof Timestamp) return { __ts: v.toMillis() };
  if (Array.isArray(v)) return v.map(encode);
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, encode(x)]));
  return v;
};
const decode = (v: any): any => {
  if (v && typeof v === "object" && "__ts" in v) return Timestamp.fromMillis(v.__ts);
  if (Array.isArray(v)) return v.map(decode);
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, decode(x)]));
  return v;
};

const load = (): State => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { docs: decode(parsed.docs || {}), accounts: parsed.accounts || [], session: parsed.session ?? null };
    }
  } catch {
    /* fresh state */
  }
  return { docs: {}, accounts: [], session: null };
};

export const state: State = load();
const save = () => localStorage.setItem(KEY, JSON.stringify({ ...state, docs: encode(state.docs) }));

// ---------------- change listeners ----------------
const listeners = new Set<() => void>();
export const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
const emit = () => {
  save();
  // async like the real SDK
  setTimeout(() => listeners.forEach((fn) => fn()), 0);
};

// ---------------- auth state (set by auth.ts) ----------------
export const authState: { uidByApp: Record<string, string | null> } = { uidByApp: {} };
const currentUid = () => authState.uidByApp["[DEFAULT]"] ?? null;

// ---------------- rules subset ----------------
export class FirebaseError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}
const deny = (path: string) => {
  throw new FirebaseError("permission-denied", `Missing or insufficient permissions. (${path})`);
};
const profile = (uid: string | null) => (uid ? state.docs[`users/${uid}`] : undefined);
const isStaff = (uid: string | null) => profile(uid)?.role === "admin";

export const checkRead = (path: string) => {
  const [col, id] = path.split("/");
  const uid = currentUid();
  if (col === "userBilling" && !isStaff(uid)) deny(path);
  if (col === "feedback" && id && id !== uid && !isStaff(uid)) deny(path);
  if (col === "feedback" && !id && !isStaff(uid)) deny(path);
  if (col === "users" && id && id !== uid && !isStaff(uid)) deny(path);
  if (col === "userPasswords" && !isStaff(uid)) deny(path);
};

export const checkWrite = (path: string, exists: boolean, next: Record<string, any> | null) => {
  const [col, id] = path.split("/");
  const uid = currentUid();
  if (col === "userBilling" && !isStaff(uid)) deny(path);
  if (col === "users" && !isStaff(uid)) deny(path);
  if (col === "feedback") {
    if (exists || id !== uid || !next) deny(path); // create-only, own doc
    const ok = Number.isInteger(next.rating) && next.rating >= 1 && next.rating <= 5 && typeof next.message === "string";
    if (!ok) deny(path);
  }
};

// ---------------- doc ops ----------------
const resolve = (data: Record<string, any>, prev: Record<string, any> | undefined) => {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v && typeof v === "object" && v.__sentinel === "serverTimestamp") out[k] = Timestamp.now();
    else if (v && typeof v === "object" && v.__sentinel === "arrayUnion") {
      const existing = Array.isArray(prev?.[k]) ? prev![k] : [];
      out[k] = [...existing, ...v.values.map((x: any) => resolve({ x }, undefined).x)];
    } else if (v && typeof v === "object" && !(v instanceof Timestamp) && !Array.isArray(v)) out[k] = resolve(v, prev?.[k]);
    else out[k] = v;
  }
  return out;
};

const isPlain = (v: unknown) => !!v && typeof v === "object" && !(v instanceof Timestamp) && !Array.isArray(v);
const deepMerge = (a: Record<string, any>, b: Record<string, any>) => {
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = isPlain(v) && isPlain(a[k]) ? deepMerge(a[k], v) : v;
  return out;
};

export const getDocData = (path: string) => state.docs[path];

export const writeDoc = (path: string, data: Record<string, any>, mode: "set" | "merge" | "update") => {
  const prev = state.docs[path];
  if (mode === "update" && !prev) throw new FirebaseError("not-found", `No document to update: ${path}`);
  const resolved = resolve(data, prev);
  const next = mode === "set" ? resolved : deepMerge(prev || {}, resolved);
  checkWrite(path, !!prev, next);
  state.docs[path] = next;
  writeLog.push({ path, mode, data: resolved });
  emit();
};

export const removeDoc = (path: string) => {
  delete state.docs[path];
  emit();
};

export const listCollection = (col: string) =>
  Object.entries(state.docs)
    .filter(([k]) => k.startsWith(`${col}/`) && !k.slice(col.length + 1).includes("/"))
    .map(([k, data]) => ({ id: k.slice(col.length + 1), data }));

export const writeLog: { path: string; mode: string; data: any }[] = [];

export const newId = () => Math.random().toString(36).slice(2, 12) + Date.now().toString(36);

// ---------------- test hooks ----------------
declare global {
  interface Window {
    __fakeFirebase: any;
  }
}
window.__fakeFirebase = {
  dump: () => JSON.parse(JSON.stringify(encode(state.docs))),
  accounts: () => state.accounts.map(({ uid, email }) => ({ uid, email })),
  writes: () => JSON.parse(JSON.stringify(encode(writeLog))),
  setDoc: (path: string, data: Record<string, any>) => {
    state.docs[path] = decode(data);
    emit();
  },
};
export { save };
