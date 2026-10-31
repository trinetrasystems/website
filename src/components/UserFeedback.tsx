import { FormEvent, useEffect, useState } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { type User } from "firebase/auth";
import { CheckCircle2, MessageSquareHeart, Star } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { notifyFeedback } from "@/lib/notify";

type Props = { user: User; username: string; companyName: string };

type StoredFeedback = { rating: number; message: string; createdAt: Date | null };

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];
export const FEEDBACK_MIN_LENGTH = 5;
export const FEEDBACK_MAX_LENGTH = 2000;

/**
 * One-time feedback. Stored at feedback/{uid}; the security rules only allow
 * creating that doc, never updating it, so each account can submit once.
 * After saving, /api/notify/feedback emails it to support@.
 */
const UserFeedback = ({ user, username, companyName }: Props) => {
  const [loading, setLoading] = useState(true);
  const [existing, setExisting] = useState<StoredFeedback | null>(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getDoc(doc(db, "feedback", user.uid))
      .then((snap) => {
        if (cancelled || !snap.exists()) return;
        const data = snap.data();
        setExisting({
          rating: Number(data.rating) || 0,
          message: data.message || "",
          createdAt: data.createdAt?.toDate?.() ?? null,
        });
      })
      .catch((error) => console.error("Could not load feedback", error))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [user.uid]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const text = message.trim();
    if (rating < 1) {
      toast.error("Please choose a rating.");
      return;
    }
    if (text.length < FEEDBACK_MIN_LENGTH) {
      toast.error("Please write a few words about your experience.");
      return;
    }
    setSubmitting(true);
    try {
      await setDoc(doc(db, "feedback", user.uid), {
        rating,
        message: text.slice(0, FEEDBACK_MAX_LENGTH),
        username: username || "",
        companyName: companyName || "",
        createdAt: serverTimestamp(),
      });
      setExisting({ rating, message: text, createdAt: new Date() });
      toast.success("Thank you! Your feedback has been sent to our team.");
      const mail = await notifyFeedback();
      if (!mail.ok) console.warn("Feedback saved, but the email notification failed:", mail.error);
    } catch (error) {
      const code = (error as { code?: string })?.code;
      toast.error(
        code === "permission-denied"
          ? "Feedback has already been submitted for this account."
          : `Could not submit feedback: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-lg animate-pulse">
        Loading…
      </div>
    );
  }

  if (existing) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.06] p-8 shadow-lg" data-testid="feedback-thanks">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          <div>
            <h3 className="text-xl font-bold">Thank you for your feedback!</h3>
            <p className="text-sm text-muted-foreground">
              Submitted{existing.createdAt ? ` on ${existing.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}` : ""}. Feedback can be given once per account.
            </p>
          </div>
        </div>
        <div className="mt-5 flex items-center gap-1" aria-label={`Rated ${existing.rating} out of 5`}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Star key={n} className={`h-5 w-5 ${n <= existing.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`} />
          ))}
        </div>
        <p className="mt-3 whitespace-pre-wrap rounded-xl border border-border bg-background/60 p-4 text-sm">{existing.message}</p>
      </div>
    );
  }

  const shown = hover || rating;
  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 shadow-lg md:p-8" data-testid="feedback-form">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <MessageSquareHeart className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Share your feedback</h3>
          <p className="text-sm text-muted-foreground">Tell us how Trinetra is working for you. You can submit feedback once.</p>
        </div>
      </div>

      <fieldset className="mt-6">
        <legend className="text-sm font-medium">Your rating</legend>
        <div className="mt-2 flex items-center gap-1" role="radiogroup" aria-label="Rating" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              className="rounded-md p-1 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <Star className={`h-8 w-8 ${n <= shown ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`} />
            </button>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">{RATING_LABELS[shown]}</span>
        </div>
      </fieldset>

      <div className="mt-5 space-y-2">
        <label htmlFor="feedback-message" className="text-sm font-medium">
          Your feedback
        </label>
        <textarea
          id="feedback-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          maxLength={FEEDBACK_MAX_LENGTH}
          placeholder="What do you like? What could we improve?"
          className="w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/40"
        />
        <p className="text-right text-xs text-muted-foreground">
          {message.length}/{FEEDBACK_MAX_LENGTH}
        </p>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-60 md:w-auto md:px-8"
      >
        {submitting ? "Submitting…" : "Submit Feedback"}
      </button>
    </form>
  );
};

export default UserFeedback;
