import { adminDb, verifyIdToken } from "../_lib/firebaseAdmin.js";
import { requireStaffPermission } from "../_lib/access.js";
import { bearerToken, handle, HttpError, isNonEmptyId, readJson, sendJson } from "../_lib/http.js";
import { mailConfig, sendMail } from "../_lib/mailer.js";
import { welcomeEmail } from "../_lib/templates.js";

// POST /api/notify/welcome  { uid, resend? }   Authorization: Bearer <admin ID token>
// Emails a newly registered customer their portal link and login credentials.
// The recipient and password are read from Firestore, never from the request,
// so the endpoint cannot be used to send arbitrary mail.
export default handle(["POST"], async (req, res) => {
  const callerUid = await verifyIdToken(bearerToken(req));
  const body = await readJson(req);
  if (!isNonEmptyId(body.uid)) throw new HttpError(400, "Missing user id.");
  const resend = body.resend === true;

  const db = adminDb();
  const { isMember } = await requireStaffPermission(db, callerUid, resend ? ["edit", "create"] : ["create"]);

  const userRef = db.collection("users").doc(body.uid);
  const userSnap = await userRef.get();
  if (!userSnap.exists) throw new HttpError(404, "User not found.");
  const user = userSnap.data() as any;
  if (isMember && (user.role !== "user" || user.isMember === true)) {
    throw new HttpError(403, "Members can only email customer accounts.");
  }
  const to = String(user.contactEmail || "").trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) throw new HttpError(422, "This user has no valid contact email.");
  if (user.welcomeEmailSentAt && !resend) return sendJson(res, 200, { ok: true, skipped: true });

  const passwordSnap = await db.collection("userPasswords").doc(body.uid).get();
  const password = passwordSnap.exists ? String((passwordSnap.data() as any).password || "") : "";

  const { portalUrl, supportEmail } = mailConfig();
  const mail = welcomeEmail({ user, password, portalUrl, supportEmail });
  await sendMail({ to, replyTo: supportEmail, ...mail });
  await userRef.set({ welcomeEmailSentAt: new Date(), welcomeEmailTo: to }, { merge: true });
  sendJson(res, 200, { ok: true });
});
