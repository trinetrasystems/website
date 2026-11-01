import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { format } from "date-fns";
import { Loader2, MessageSquare, SendHorizontal } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { notifyTicketMessage } from "@/lib/notify";
import {
  MAX_MESSAGE_LENGTH,
  mergeThread,
  messageFromDoc,
  sendTicketMessage,
  type LegacyReply,
  type Sender,
  type ThreadMessage,
} from "@/lib/tickets";

type TicketChatProps = {
  ticketId: string;
  /** Older website replies stored on the ticket itself. */
  replies?: LegacyReply[];
  /** Who is looking: the customer ("user") or the support team. */
  viewer: Sender;
  author: { uid: string; name: string };
  /** How the customer is labelled in the admin view. */
  customerLabel?: string;
};

const when = (date: Date | null) => (date ? format(date, "d MMM yyyy, h:mm a") : "Sending…");

/**
 * Live conversation for one ticket — same component on both sides.
 * New messages are emailed: customer → support@, support → customer (copy to support@).
 */
export default function TicketChat({ ticketId, replies, viewer, author, customerLabel = "Customer" }: TicketChatProps) {
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, "tickets", ticketId, "messages"),
      (snapshot) => {
        setMessages(snapshot.docs.map((d) => messageFromDoc(d.id, d.data({ serverTimestamps: "estimate" }))));
        setLoadError(null);
        setLoading(false);
      },
      (error) => {
        console.error("Could not load the conversation", error);
        setLoadError("Could not load the conversation. Please refresh the page.");
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [ticketId]);

  const thread = useMemo(() => mergeThread(replies, messages), [replies, messages]);

  // Keep the newest message in view.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [thread.length, loading]);

  const send = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    let messageId: string;
    try {
      messageId = await sendTicketMessage(ticketId, viewer, text, author);
      setDraft("");
    } catch (error: any) {
      toast.error(`Message not sent: ${error?.message || "Unknown error"}`);
      setSending(false);
      return;
    }
    setSending(false);

    // Email in the background — the message is already saved and visible.
    const mail = await notifyTicketMessage(ticketId, messageId);
    if (viewer === "support") {
      if (mail.ok && !mail.skipped) toast.success(`Reply sent and emailed to ${mail.to || "the customer"}`);
      else if (mail.ok && mail.reason === "no-email") toast.warning("Reply sent. This customer has no registered email, so no email was sent.");
      else if (!mail.ok) toast.warning(`Reply sent, but the email to the customer failed: ${mail.error}`);
      else toast.success("Reply sent");
    } else {
      if (!mail.ok) console.warn("Message saved, but the support email failed:", mail.error);
      toast.success("Message sent to Trinetra Support");
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void send();
    }
  };

  const labelFor = (m: ThreadMessage) => {
    if (m.from === "support") return viewer === "support" ? (m.authorName ? `Support · ${m.authorName}` : "Support") : "Trinetra Support";
    return viewer === "user" ? "You" : customerLabel;
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background" data-testid="ticket-chat">
      <div
        ref={listRef}
        className="max-h-[420px] min-h-[140px] space-y-3 overflow-y-auto p-3 sm:p-4"
        data-testid="ticket-thread"
        aria-live="polite"
        aria-label="Conversation"
      >
        {loading ? (
          <div className="flex h-[108px] items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading conversation…
          </div>
        ) : loadError ? (
          <p className="py-8 text-center text-sm text-destructive">{loadError}</p>
        ) : thread.length === 0 ? (
          <div className="flex h-[108px] flex-col items-center justify-center text-center text-sm text-muted-foreground">
            <MessageSquare className="mb-2 h-5 w-5 opacity-50" />
            {viewer === "user" ? "No messages yet. Send a message to Trinetra Support below." : "No messages yet. Reply to the customer below."}
          </div>
        ) : (
          thread.map((m) => {
            const mine = m.from === viewer;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`} data-testid="ticket-message" data-from={m.from}>
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm sm:max-w-[75%] ${
                    mine ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md border border-border/60 bg-secondary/60 text-foreground"
                  }`}
                >
                  <div className={`mb-1 flex flex-wrap items-center gap-x-2 text-[11px] font-semibold ${mine ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    <span>{labelFor(m)}</span>
                    <span aria-hidden>·</span>
                    <time className="font-normal">{when(m.at)}</time>
                  </div>
                  <p className="whitespace-pre-wrap break-words leading-relaxed">{m.text}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={onSubmit} className="flex items-end gap-2 border-t border-border bg-card/60 p-2 sm:p-3">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          rows={2}
          maxLength={MAX_MESSAGE_LENGTH}
          placeholder={viewer === "user" ? "Write a message to Trinetra Support…" : "Write a reply to the customer…"}
          aria-label={viewer === "user" ? "Message to support" : "Reply to customer"}
          className="min-h-[44px] flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/30"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          aria-label="Send message"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
        </button>
      </form>
      <p className="px-3 pb-2 text-[11px] text-muted-foreground sm:px-4">
        {viewer === "user"
          ? "Our team is notified by email. Press Enter to send, Shift + Enter for a new line."
          : "The customer gets this reply by email. Press Enter to send, Shift + Enter for a new line."}
      </p>
    </div>
  );
}
