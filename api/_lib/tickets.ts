import type { Firestore } from "firebase-admin/firestore";

// Ticket helpers shared by the ticket email endpoints.
//
// Tickets come from two places and both must keep working:
//   * the website: status "Active" | "In Progress" | "Solved", userId set
//   * the mobile app: status "open" | "done", sometimes only `createdBy` (username)

/** Display status, so emails read the same for website and mobile-app tickets. */
export const normalizeTicketStatus = (status: unknown): string => {
  const s = String(status ?? "").trim().toLowerCase().replace(/[_-]+/g, " ");
  if (!s || s === "open" || s === "active" || s === "new") return "Active";
  if (s === "in progress" || s === "progress" || s === "working") return "In Progress";
  if (s === "done" || s === "solved" || s === "resolved" || s === "closed") return "Solved";
  return String(status);
};

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
/** Real mailbox only: login addresses (…@trinetra.local) are not deliverable. */
export const deliverableEmail = (value: unknown): string | null => {
  const email = typeof value === "string" ? value.trim() : "";
  if (!EMAIL.test(email) || /@trinetra\.local$/i.test(email)) return null;
  return email;
};

/**
 * The customer behind a ticket: by userId, or — for mobile-app tickets that
 * only carry the username — through loginIndex/{username}.
 */
export const findTicketCustomer = async (db: Firestore, ticket: any): Promise<{ uid: string | null; user: any | null }> => {
  let uid: string | null = typeof ticket.userId === "string" && ticket.userId ? ticket.userId : null;
  if (!uid && typeof ticket.createdBy === "string" && ticket.createdBy.trim()) {
    const key = ticket.createdBy.trim().toLowerCase();
    if (!key.includes("/")) {
      const index = await db.collection("loginIndex").doc(key).get();
      const indexed = index.exists ? (index.data() as any) : null;
      if (indexed && typeof indexed.userId === "string") uid = indexed.userId;
    }
  }
  if (!uid) return { uid: null, user: null };
  const snap = await db.collection("users").doc(uid).get();
  return { uid, user: snap.exists ? snap.data() : null };
};

/** Registered email: the profile's contact email (kept up to date by admins), else the one stored on the ticket. */
export const customerEmail = (ticket: any, user: any | null): string | null =>
  deliverableEmail(user?.contactEmail) || deliverableEmail(ticket.userEmail);

export const ticketLabel = (ticketId: string, ticket: any): string =>
  String(ticket.ticketNumber || (typeof ticket.id === "string" ? ticket.id : "") || ticketId);
