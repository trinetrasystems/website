import { adminDb } from "../_lib/firebaseAdmin.js";
import { ConfigError, handle, HttpError, sendJson } from "../_lib/http.js";
import { mailConfig, sendMail } from "../_lib/mailer.js";
import { findDueReminders } from "../_lib/reminders.js";
import { expiryReminderEmail } from "../_lib/templates.js";

// GET /api/cron/expiry-reminders — run daily by Vercel Cron (see vercel.json).
// Emails contact@ and support@ when a customer's subscription (or, for a
// lifetime solution, its maintenance) expires within 7 days. Each expiry date
// is reminded once; renewing to a new end date arms the reminder again.
//
// Vercel sends "Authorization: Bearer $CRON_SECRET" on cron calls, so the
// endpoint refuses anything else.
//
// Manual checks (same secret required):
//   ?dryRun=1     list what would be sent, send nothing, change nothing
//   ?only=<uid>   process a single customer (used for live testing)
export default handle(["GET", "POST"], async (req, res) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) throw new ConfigError("CRON_SECRET is not set.");
  if (req.headers.authorization !== `Bearer ${secret}`) throw new HttpError(401, "Unauthorized.");

  const params = new URL(req.url || "/", "http://localhost").searchParams;
  const dryRun = params.get("dryRun") === "1";
  const only = params.get("only");

  const db = adminDb();
  const snapshot = await db.collection("users").get();
  const due = findDueReminders(
    snapshot.docs.filter((d) => !only || d.id === only).map((d) => ({ id: d.id, data: d.data() })),
    new Date()
  );

  if (dryRun) {
    return sendJson(res, 200, {
      ok: true,
      dryRun: true,
      checked: only ? 1 : snapshot.size,
      due: due.map((r) => {
        const u = snapshot.docs.find((d) => d.id === r.uid)!.data();
        return { uid: r.uid, company: u.companyName || "", username: u.username || "", kind: r.kind, expiresAt: r.expiresAt.toISOString(), daysLeft: r.daysLeft, overdue: r.overdue };
      }),
    });
  }

  const { contactEmail, supportEmail } = mailConfig();
  const sent: string[] = [];
  const failed: { uid: string; error: string }[] = [];

  for (const reminder of due) {
    try {
      const user = snapshot.docs.find((d) => d.id === reminder.uid)!.data();
      const billingSnap = await db.collection("userBilling").doc(reminder.uid).get();
      const billing = billingSnap.exists ? billingSnap.data() : null;
      await sendMail({
        to: [contactEmail, supportEmail],
        ...expiryReminderEmail({ user, billing, kind: reminder.kind, expiresAt: reminder.expiresAt, daysLeft: reminder.daysLeft }),
      });
      await db
        .collection("users")
        .doc(reminder.uid)
        .set({ expiryReminders: { [reminder.kind]: reminder.key }, expiryReminderSentAt: new Date() }, { merge: true });
      sent.push(`${reminder.uid}:${reminder.kind}`);
    } catch (error) {
      // Not marked as sent, so tomorrow's run retries it.
      failed.push({ uid: reminder.uid, error: error instanceof Error ? error.message : String(error) });
    }
  }

  if (failed.length) console.error("[cron] expiry reminders failed", failed);
  sendJson(res, failed.length ? 207 : 200, { ok: failed.length === 0, checked: only ? 1 : snapshot.size, sent, failed });
});
