import { adminDb, verifyIdToken } from "../_lib/firebaseAdmin.js";
import { requireStaffPermission } from "../_lib/access.js";
import { bearerToken, handle, HttpError, isNonEmptyId, readJson, sendJson } from "../_lib/http.js";
import { mailConfig, sendMail } from "../_lib/mailer.js";
import { ticketCustomerMessageEmail, ticketReplyEmail } from "../_lib/templates.js";
import { customerEmail, findTicketCustomer, normalizeTicketStatus, ticketLabel } from "../_lib/tickets.js";

// POST /api/notify/ticket-message  { ticketId, messageId }   Authorization: Bearer <ID token>
// Emails one chat message from tickets/{ticketId}/messages/{messageId}:
//   * from "support" (caller must be staff with the tickets permission)
//       → the customer's registered email, hidden copy to support@
//   * from "user" (caller must be the ticket's customer)
//       → support@, Reply-To the customer
// Content comes only from Firestore, each message is emailed once (notifiedAt)
// and only within 24h of being written.
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export default handle(["POST"], async (req, res) => {
  const uid = await verifyIdToken(bearerToken(req));
  const body = await readJson(req);
  if (!isNonEmptyId(body.ticketId) || !isNonEmptyId(body.messageId)) throw new HttpError(400, "Missing ticket or message id.");

  const db = adminDb();
  const ticketRef = db.collection("tickets").doc(body.ticketId);
  const messageRef = ticketRef.collection("messages").doc(body.messageId);
  const [ticketSnap, messageSnap] = await Promise.all([ticketRef.get(), messageRef.get()]);
  if (!ticketSnap.exists) throw new HttpError(404, "Ticket not found.");
  if (!messageSnap.exists) throw new HttpError(404, "Message not found.");
  const ticket = ticketSnap.data() as any;
  const message = messageSnap.data() as any;

  const from = message.from;
  if (from !== "support" && from !== "user") throw new HttpError(400, "Unknown message sender.");
  if (typeof message.text !== "string" || !message.text.trim()) throw new HttpError(400, "Message is empty.");

  const customer = await findTicketCustomer(db, ticket);
  if (from === "support") {
    await requireStaffPermission(db, uid, ["tickets"]);
  } else if (customer.uid !== uid || (message.authorUid && message.authorUid !== uid)) {
    throw new HttpError(403, "You can only send messages on your own tickets.");
  }

  if (message.notifiedAt) return sendJson(res, 200, { ok: true, skipped: true, reason: "already-notified" });
  const createdAt: Date | null = message.createdAt?.toDate ? message.createdAt.toDate() : null;
  if (!createdAt || Date.now() - createdAt.getTime() > MAX_AGE_MS) {
    return sendJson(res, 200, { ok: true, skipped: true, reason: "stale" });
  }

  const to = from === "support" ? customerEmail(ticket, customer.user) : null;
  if (from === "support" && !to) return sendJson(res, 200, { ok: true, skipped: true, reason: "no-email" });

  // Claim the message so concurrent calls can't email it twice.
  const claimed = await db.runTransaction(async (tx) => {
    const fresh = await tx.get(messageRef);
    if ((fresh.data() as any)?.notifiedAt) return false;
    tx.set(messageRef, { notifiedAt: new Date() }, { merge: true });
    return true;
  });
  if (!claimed) return sendJson(res, 200, { ok: true, skipped: true, reason: "already-notified" });

  const { supportEmail, portalUrl } = mailConfig();
  const label = ticketLabel(body.ticketId, ticket);
  const status = normalizeTicketStatus(ticket.status);
  try {
    if (from === "support") {
      await sendMail({
        to: to!,
        bcc: supportEmail,
        replyTo: supportEmail,
        ...ticketReplyEmail({ label, ticket, user: customer.user, message, status, portalUrl }),
      });
    } else {
      const replyTo = customerEmail(ticket, customer.user);
      await sendMail({
        to: supportEmail,
        ...(replyTo ? { replyTo } : {}),
        ...ticketCustomerMessageEmail({ label, ticket, user: customer.user, message, status, email: replyTo }),
      });
    }
  } catch (error) {
    await messageRef.set({ notifiedAt: null }, { merge: true });
    throw error;
  }
  sendJson(res, 200, { ok: true, ...(to ? { to } : {}) });
});
