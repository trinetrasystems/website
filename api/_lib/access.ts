import type { Firestore } from "firebase-admin/firestore";
import { HttpError } from "./http.js";

/** Same role model as firestore.rules: role "admin" + isMember=false is a full admin; members need the permission. */
export const requireStaffPermission = async (db: Firestore, uid: string, permissions: string[]) => {
  const snap = await db.collection("users").doc(uid).get();
  const profile = snap.exists ? (snap.data() as any) : null;
  if (!profile || profile.role !== "admin") throw new HttpError(403, "Only admins can do this.");
  const isMember = profile.isMember === true;
  if (isMember && !permissions.some((p) => (profile.permissions || []).includes(p))) {
    throw new HttpError(403, "You do not have permission to do this.");
  }
  return { isMember };
};
