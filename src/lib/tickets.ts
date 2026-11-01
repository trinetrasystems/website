// Support-ticket helpers shared by the customer view (UserTickets) and the
// admin console (AdminTickets).
//
// Conversation storage: tickets/{id}/messages/{messageId}
//   { from: "user" | "support", text, type: "text", createdAt, authorUid?, authorName? }
// This is the same subcollection and shape the mobile app already uses, so a
// conversation is the same everywhere. Older website tickets kept admin replies
// in a `replies` array on the ticket; those are still shown, merged by time.

import { useEffect, useRef } from "react";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const TICKET_STATUSES = ["Active", "In Progress", "Solved"] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

/** Website and mobile-app tickets use different words ("open"/"done"); show one set. */
export const normalizeTicketStatus = (status: unknown): string => {
  const s = String(status ?? "").trim().toLowerCase().replace(/[_-]+/g, " ");
  if (!s || s === "open" || s === "active" || s === "new") return "Active";
  if (s === "in progress" || s === "progress" || s === "working") return "In Progress";
  if (s === "done" || s === "solved" || s === "resolved" || s === "closed") return "Solved";
  return String(status);
};

/** Website tickets store `ticketNumber`; mobile-app tickets keep it in an `id` field. */
export const ticketNumberOf = (data: any, docId: string): string =>
  String(data?.ticketNumber || (typeof data?.id === "string" && data.id ? data.id : "") || docId.slice(0, 8));

export const MAX_MESSAGE_LENGTH = 2000;

export type Sender = "user" | "support";

export type ThreadMessage = {
  id: string;
  from: Sender;
  text: string;
  at: Date | null;
  authorName?: string;
};

export type LegacyReply = { message?: string; role?: string; timestamp?: any };

const toDate = (value: any): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === "function") return value.toDate();
  if (typeof value.seconds === "number") return new Date(value.seconds * 1000);
  return null;
};

export const messageFromDoc = (id: string, data: any): ThreadMessage => ({
  id,
  from: data?.from === "support" ? "support" : "user",
  text: typeof data?.text === "string" && data.text ? data.text : data?.type && data.type !== "text" ? `[${data.type}]` : "",
  at: toDate(data?.createdAt),
  authorName: typeof data?.authorName === "string" ? data.authorName : undefined,
});

/** One conversation in time order: legacy `replies` + the messages subcollection. */
export const mergeThread = (replies: LegacyReply[] | undefined, messages: ThreadMessage[]): ThreadMessage[] => {
  const legacy: ThreadMessage[] = (Array.isArray(replies) ? replies : []).map((r, i) => ({
    id: `legacy-${i}`,
    from: r.role === "admin" || r.role === "support" ? "support" : "user",
    text: String(r.message ?? ""),
    at: toDate(r.timestamp),
  }));
  // Pending server timestamps have no date yet — they are the newest.
  const time = (m: ThreadMessage) => (m.at ? m.at.getTime() : Number.MAX_SAFE_INTEGER);
  return [...legacy, ...messages].sort((a, b) => time(a) - time(b));
};

/**
 * Has the other side written since this side last opened the ticket?
 * `viewer` is who is looking: the customer ("user") or the support team.
 */
export const hasUnread = (ticket: any, viewer: Sender): boolean => {
  if (!ticket?.lastMessageFrom || ticket.lastMessageFrom === viewer) return false;
  const last = toDate(ticket.lastMessageAt);
  const read = toDate(viewer === "user" ? ticket.userReadAt : ticket.supportReadAt);
  if (!last) return false;
  return !read || read.getTime() < last.getTime();
};

export const markTicketRead = (ticketId: string, viewer: Sender) =>
  updateDoc(doc(db, "tickets", ticketId), { [viewer === "user" ? "userReadAt" : "supportReadAt"]: serverTimestamp() });

/**
 * Marks the open ticket as read when it is opened or a new message arrives
 * while it is open. Writes once per new message: a pending server timestamp
 * reads as null until the server confirms it, so without the guard every
 * snapshot would look unread again and re-trigger the write.
 */
export const useMarkOpenTicketRead = (tickets: any[], openTicketId: string | null, viewer: Sender) => {
  const marked = useRef("");
  useEffect(() => {
    const open = tickets.find((t) => t.id === openTicketId);
    if (!open || !hasUnread(open, viewer)) return;
    const key = `${open.id}:${toDate(open.lastMessageAt)?.getTime() ?? ""}`;
    if (marked.current === key) return;
    marked.current = key;
    markTicketRead(open.id, viewer).catch(() => {
      marked.current = "";
    });
  }, [tickets, openTicketId, viewer]);
};

/** Saves a chat message and bumps the ticket so both sides see it is new. Returns the message id. */
export const sendTicketMessage = async (
  ticketId: string,
  from: Sender,
  text: string,
  author: { uid: string; name: string }
): Promise<string> => {
  const clean = text.trim();
  if (!clean) throw new Error("Message is empty.");
  if (clean.length > MAX_MESSAGE_LENGTH) throw new Error(`Message is too long (max ${MAX_MESSAGE_LENGTH} characters).`);
  const ref = await addDoc(collection(db, "tickets", ticketId, "messages"), {
    from,
    text: clean,
    type: "text",
    createdAt: serverTimestamp(),
    authorUid: author.uid,
    authorName: author.name,
  });
  await updateDoc(doc(db, "tickets", ticketId), {
    updatedAt: serverTimestamp(),
    lastMessageAt: serverTimestamp(),
    lastMessageFrom: from,
    [from === "user" ? "userReadAt" : "supportReadAt"]: serverTimestamp(),
  });
  return ref.id;
};
