import { adminDb, verifyIdToken } from "../_lib/firebaseAdmin.js";
import { bearerToken, handle, HttpError, sendJson } from "../_lib/http.js";
import { mailConfig, sendMail } from "../_lib/mailer.js";
import { feedbackEmail } from "../_lib/templates.js";

// POST /api/notify/feedback   Authorization: Bearer <user ID token>
// Forwards the caller's one-time feedback (feedback/{uid}) to support@.
export default handle(["POST"], async (req, res) => {
  const uid = await verifyIdToken(bearerToken(req));
  const db = adminDb();
  const feedbackRef = db.collection("feedback").doc(uid);
  const snap = await feedbackRef.get();
  if (!snap.exists) throw new HttpError(404, "No feedback found for this account.");
  const feedback = snap.data() as any;
  if (feedback.notifiedAt) return sendJson(res, 200, { ok: true, skipped: true });

  const userSnap = await db.collection("users").doc(uid).get();
  const user = userSnap.exists ? (userSnap.data() as any) : null;

  const { supportEmail } = mailConfig();
  const replyTo = user?.contactEmail;
  await sendMail({
    to: supportEmail,
    ...(replyTo && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(replyTo) ? { replyTo } : {}),
    ...feedbackEmail({ feedback, user }),
  });
  await feedbackRef.set({ notifiedAt: new Date() }, { merge: true });
  sendJson(res, 200, { ok: true });
});
