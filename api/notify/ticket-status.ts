import { adminDb, verifyIdToken } from "../_lib/firebaseAdmin.js";
import { requireStaffPermission } from "../_lib/access.js";
import { bearerToken, handle, HttpError, isNonEmptyId, readJson, sendJson } from "../_lib/http.js";
import { mailConfig, sendMail } from "../_lib/mailer.js";
import { ticketStatusEmail } from "../_lib/templates.js";
import { customerEmail, findTicketCustomer, normalizeTicketStatus, ticketLabel } from "../_lib/tickets.js";

// POST /api/notify/ticket-status  { ticketId }   Authorization: Bearer <staff ID token>
// Emails the customer (registered email, from support@, hidden copy to support@)
// the ticket's CURRENT status after an admin changed it. Each status is emailed
// once in a row (statusEmailed), so double clicks or retries don't spam.
export default handle(["POST"], async (req, res) => {
  const uid = await verifyIdToken(bearerToken(req));
  const body = await readJson(req);
  if (!isNonEmptyId(body.ticketId)) throw new HttpError(400, "Missing ticket id.");

  const db = adminDb();
  await requireStaffPermission(db, uid, ["tickets"]);

  const ref = db.collection("tickets").doc(body.ticketId);
  const claim = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpError(404, "Ticket not found.");
    const ticket = snap.data() as any;
    const status = normalizeTicketStatus(ticket.status);
    if (ticket.statusEmailed === status) return null;
    tx.set(ref, { statusEmailed: status, statusEmailedAt: new Date() }, { merge: true });
    return { ticket, status, previous: (ticket.statusEmailed as string | undefined) ?? null };
  });
  if (!claim) return sendJson(res, 200, { ok: true, skipped: true, reason: "already-notified" });

  const { ticket, status, previous } = claim;
  const { user } = await findTicketCustomer(db, ticket);
  const to = customerEmail(ticket, user);
  if (!to) return sendJson(res, 200, { ok: true, skipped: true, reason: "no-email" });

  const { supportEmail, portalUrl } = mailConfig();
  try {
    await sendMail({
      to,
      bcc: supportEmail,
      replyTo: supportEmail,
      ...ticketStatusEmail({ label: ticketLabel(body.ticketId, ticket), ticket, user, status, portalUrl, supportEmail }),
    });
  } catch (error) {
    // Release the claim so the admin can retry.
    await ref.set({ statusEmailed: previous, statusEmailedAt: null }, { merge: true });
    throw error;
  }
  sendJson(res, 200, { ok: true, to });
});
