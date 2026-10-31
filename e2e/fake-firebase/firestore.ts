// Fake "firebase/firestore" for e2e mode — the subset of the modular API the app uses.
import {
  arrayUnionSentinel,
  checkRead,
  getDocData,
  listCollection,
  newId,
  removeDoc,
  SERVER_TS,
  subscribe,
  Timestamp,
  writeDoc,
} from "./store";

export { Timestamp };

type DB = { kind: "db" };
type DocRef = { kind: "doc"; path: string; id: string };
type ColRef = { kind: "col"; path: string };
type Constraint =
  | { kind: "where"; field: string; op: string; value: unknown }
  | { kind: "orderBy"; field: string; dir: "asc" | "desc" }
  | { kind: "limit"; n: number };
type Query = { kind: "query"; col: ColRef; constraints: Constraint[] };

const db: DB = { kind: "db" };
export const getFirestore = () => db;

export const collection = (_parent: DB, ...segments: string[]): ColRef => ({ kind: "col", path: segments.join("/") });

export function doc(parent: DB | ColRef, ...segments: string[]): DocRef {
  if ((parent as ColRef).kind === "col") {
    const id = segments[0] ?? newId();
    return { kind: "doc", path: `${(parent as ColRef).path}/${id}`, id };
  }
  const path = segments.join("/");
  return { kind: "doc", path, id: segments[segments.length - 1] };
}

export const where = (field: string, op: string, value: unknown): Constraint => ({ kind: "where", field, op, value });
export const orderBy = (field: string, dir: "asc" | "desc" = "asc"): Constraint => ({ kind: "orderBy", field, dir });
export const limit = (n: number): Constraint => ({ kind: "limit", n });
export const query = (col: ColRef, ...constraints: Constraint[]): Query => ({ kind: "query", col, constraints });
export const serverTimestamp = () => SERVER_TS;
export const arrayUnion = (...values: unknown[]) => arrayUnionSentinel(values);

const clone = <T,>(v: T): T => {
  if (v instanceof Timestamp) return v;
  if (Array.isArray(v)) return v.map(clone) as T;
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, clone(x)])) as T;
  return v;
};

const docSnap = (path: string, id: string) => {
  const data = getDocData(path);
  return { id, ref: { kind: "doc", path, id }, exists: () => !!data, data: () => (data ? clone(data) : undefined) };
};

const comparable = (v: any) => (v instanceof Timestamp ? v.toMillis() : v);

const runQuery = (target: ColRef | Query) => {
  const col = target.kind === "col" ? target : target.col;
  const constraints = target.kind === "query" ? target.constraints : [];
  checkRead(col.path);
  let rows = listCollection(col.path);
  for (const c of constraints) {
    if (c.kind === "where") {
      rows = rows.filter((r) => {
        const v = comparable(r.data[c.field]);
        const x = comparable(c.value);
        if (c.op === "==") return v === x;
        if (c.op === "!=") return v !== x;
        if (c.op === "<") return v < x;
        if (c.op === ">") return v > x;
        return true;
      });
    }
  }
  for (const c of constraints) {
    if (c.kind === "orderBy") {
      rows.sort((a, b) => {
        const av = comparable(a.data[c.field]) ?? 0;
        const bv = comparable(b.data[c.field]) ?? 0;
        return (av < bv ? -1 : av > bv ? 1 : 0) * (c.dir === "desc" ? -1 : 1);
      });
    }
  }
  const lim = constraints.find((c) => c.kind === "limit") as { n: number } | undefined;
  if (lim) rows = rows.slice(0, lim.n);
  const docs = rows.map((r) => docSnap(`${col.path}/${r.id}`, r.id));
  return { docs, size: docs.length, empty: docs.length === 0, forEach: (fn: (d: any) => void) => docs.forEach(fn) };
};

export const getDoc = async (ref: DocRef) => {
  checkRead(ref.path);
  return docSnap(ref.path, ref.id);
};
export const getDocs = async (target: ColRef | Query) => runQuery(target);
export const setDoc = async (ref: DocRef, data: Record<string, any>, opts?: { merge?: boolean }) =>
  writeDoc(ref.path, data, opts?.merge ? "merge" : "set");
export const updateDoc = async (ref: DocRef, data: Record<string, any>) => writeDoc(ref.path, data, "update");
export const addDoc = async (col: ColRef, data: Record<string, any>) => {
  const ref = doc(col);
  writeDoc(ref.path, data, "set");
  return ref;
};
export const deleteDoc = async (ref: DocRef) => removeDoc(ref.path);

export function onSnapshot(target: DocRef | ColRef | Query, next: (snap: any) => void, onError?: (e: any) => void) {
  const fire = () => {
    try {
      next(target.kind === "doc" ? (checkRead(target.path), docSnap(target.path, target.id)) : runQuery(target));
    } catch (error) {
      onError?.(error);
    }
  };
  setTimeout(fire, 0);
  return subscribe(fire);
}
