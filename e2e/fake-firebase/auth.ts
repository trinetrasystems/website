// Fake "firebase/auth" for e2e mode. Two app instances exist (default +
// "admin-management"), exactly like src/lib/firebase.ts sets up.
import { authState, FirebaseError, newId, save, state } from "./store";

export type User = { uid: string; email: string; getIdToken: () => Promise<string> };

type Auth = { appName: string; currentUser: User | null; listeners: Set<(u: User | null) => void> };
const auths: Record<string, Auth> = {};

const makeUser = (uid: string, email: string): User => ({ uid, email, getIdToken: async () => `fake-id-token-${uid}` });

export const getAuth = (app: { name: string }) => {
  if (!auths[app.name]) {
    const auth: Auth = { appName: app.name, currentUser: null, listeners: new Set() };
    if (app.name === "[DEFAULT]" && state.session) {
      const acct = state.accounts.find((a) => a.uid === state.session);
      if (acct) auth.currentUser = makeUser(acct.uid, acct.email);
    }
    authState.uidByApp[app.name] = auth.currentUser?.uid ?? null;
    auths[app.name] = auth;
  }
  return auths[app.name];
};

const setCurrent = (auth: Auth, user: User | null) => {
  auth.currentUser = user;
  authState.uidByApp[auth.appName] = user?.uid ?? null;
  if (auth.appName === "[DEFAULT]") {
    state.session = user?.uid ?? null;
    save();
  }
  auth.listeners.forEach((fn) => setTimeout(() => fn(user), 0));
};

export const onAuthStateChanged = (auth: Auth, cb: (u: User | null) => void) => {
  auth.listeners.add(cb);
  setTimeout(() => cb(auth.currentUser), 0);
  return () => auth.listeners.delete(cb);
};

export const signInWithEmailAndPassword = async (auth: Auth, email: string, password: string) => {
  const acct = state.accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
  if (!acct || acct.password !== password) throw new FirebaseError("auth/invalid-credential", "Firebase: Error (auth/invalid-credential).");
  const user = makeUser(acct.uid, acct.email);
  setCurrent(auth, user);
  return { user };
};

export const createUserWithEmailAndPassword = async (auth: Auth, email: string, password: string) => {
  if (state.accounts.some((a) => a.email.toLowerCase() === email.toLowerCase())) {
    throw new FirebaseError("auth/email-already-in-use", "Firebase: Error (auth/email-already-in-use).");
  }
  const uid = "uid_" + newId();
  state.accounts.push({ uid, email, password });
  save();
  const user = makeUser(uid, email);
  setCurrent(auth, user);
  return { user };
};

export const signOut = async (auth: Auth) => setCurrent(auth, null);

export const deleteUser = async (user: User) => {
  state.accounts = state.accounts.filter((a) => a.uid !== user.uid);
  save();
};

export const updatePassword = async (user: User, password: string) => {
  const acct = state.accounts.find((a) => a.uid === user.uid);
  if (acct) acct.password = password;
  save();
};
