// Client side of the email notifications. The actual emails are sent by the
// serverless functions in /api (SMTP credentials never reach the browser).
// Every call is best-effort: it resolves to { ok:false, error } instead of
// throwing, so a mail outage never breaks user creation, tickets or feedback.

import { auth } from "@/lib/firebase";

export type NotifyResult = {
  ok: boolean;
  skipped?: boolean;
  /** Why nothing was sent, e.g. "no-email" (customer has no registered email) or "already-notified". */
  reason?: string;
  /** Who was emailed (customer-facing notifications). */
  to?: string;
  error?: string;
};

const post = async (path: string, body: unknown, withAuth: boolean): Promise<NotifyResult> => {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (withAuth) {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return { ok: false, error: "Not signed in." };
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await fetch(path, { method: "POST", headers, body: JSON.stringify(body) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return { ok: false, error: data?.error || `Email service returned ${response.status}.` };
    return {
      ok: true,
      skipped: data?.skipped === true,
      ...(typeof data?.reason === "string" ? { reason: data.reason } : {}),
      ...(typeof data?.to === "string" ? { to: data.to } : {}),
    };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Email service unreachable." };
  }
};

/** Welcome mail (portal link + credentials) to a newly created customer. Admin only. */
export const sendWelcomeEmail = (uid: string, resend = false) => post("/api/notify/welcome", { uid, resend }, true);

/** Alert support@ that a ticket was raised. Works without auth (the mobile app can call it too). */
export const notifyNewTicket = (ticketId: string) => post("/api/notify/ticket", { ticketId }, false);

/** Forward the signed-in user's one-time feedback to support@. */
export const notifyFeedback = () => post("/api/notify/feedback", {}, true);

/** Email the customer the ticket's new status (from support@, copy to support@). Staff only. */
export const notifyTicketStatus = (ticketId: string) => post("/api/notify/ticket-status", { ticketId }, true);

/**
 * Email one chat message: a support reply goes to the customer (copy to support@),
 * a customer message goes to support@.
 */
export const notifyTicketMessage = (ticketId: string, messageId: string) =>
  post("/api/notify/ticket-message", { ticketId, messageId }, true);
