import { adminDb } from "../_lib/firebaseAdmin.js";
import { handle, HttpError, isNonEmptyId, readJson, sendJson } from "../_lib/http.js";
import { mailConfig, sendMail } from "../_lib/mailer.js";
import { ticketEmail } from "../_lib/templates.js";

// POST /api/notify/ticket  { ticketId }
// Emails support@ about a newly raised ticket. No sign-in needed (the mobile
// app raises tickets without Firebase Auth), so it is locked down instead by:
//   * content comes only from the stored ticket, never the request
//   * each ticket is emailed once (notifiedAt), and only within 24h of creation
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export default handle(["POST"], async (req, res) => {
  const body = await readJson(req);
  if (!isNonEmptyId(body.ticketId)) throw new HttpError(400, "Missing ticket id.");

  const db = adminDb();
  const ticketRef = db.collection("tickets").doc(body.ticketId);
  const snap = await ticketRef.get();
  if (!snap.exists) throw new HttpError(404, "Ticket not found.");
  const ticket = snap.data() as any;
  if (ticket.notifiedAt) return sendJson(res, 200, { ok: true, skipped: true });

  const createdAt: Date | null = ticket.createdAt?.toDate ? ticket.createdAt.toDate() : null;
  if (createdAt && Date.now() - createdAt.getTime() > MAX_AGE_MS) {
    return sendJson(res, 200, { ok: true, skipped: true });
  }

  let user: any = null;
  if (isNonEmptyId(ticket.userId)) {
    const userSnap = await db.collection("users").doc(ticket.userId).get();
    if (userSnap.exists) user = userSnap.data();
  }

  const { supportEmail } = mailConfig();
  const replyTo = ticket.userEmail || user?.contactEmail;
  await sendMail({
    to: supportEmail,
    ...(replyTo && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(replyTo) ? { replyTo } : {}),
    ...ticketEmail({ ticketId: body.ticketId, ticket, user }),
  });
  await ticketRef.set({ notifiedAt: new Date() }, { merge: true });
  sendJson(res, 200, { ok: true });
});
