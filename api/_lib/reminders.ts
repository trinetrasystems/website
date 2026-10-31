// Which customers need a "plan expires in 7 days" email today.
// Pure function so it can be unit-tested without Firestore.

export const REMINDER_WINDOW_DAYS = 7;
/**
 * Safety net: an expiry that was never reminded (plan saved with a past end
 * date, or the cron failed for days) still gets an "expired" email if it
 * lapsed within this many days. Older lapses are ignored to avoid spamming
 * about long-gone legacy accounts.
 */
export const OVERDUE_CATCHUP_DAYS = 30;
const DAY = 86_400_000;

export type DueReminder = {
  uid: string;
  kind: "subscription" | "maintenance";
  expiresAt: Date;
  daysLeft: number;
  /** True when the date has already passed (catch-up email). */
  overdue: boolean;
  /** Stored on the user doc once sent, so the same expiry is never reminded twice. */
  key: string;
};

const toDate = (value: any): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === "function") return value.toDate();
  return null;
};

const isCustomer = (data: any) =>
  (data.role ?? "user") === "user" && data.isMember !== true && data.role !== "member";

export const findDueReminders = (users: { id: string; data: any }[], now: Date): DueReminder[] => {
  const due: DueReminder[] = [];
  for (const { id, data } of users) {
    if (!data || !isCustomer(data)) continue;
    const lifetime = data.planType ? data.planType === "lifetime" : data.softwareLifetime === true;
    const candidates: { kind: DueReminder["kind"]; date: Date | null }[] = [];
    if (!lifetime) candidates.push({ kind: "subscription", date: toDate(data.softwareValidUntil ?? data.validUntil) });
    if (data.maintenanceLifetime !== true) candidates.push({ kind: "maintenance", date: toDate(data.maintenanceValidUntil) });

    for (const { kind, date } of candidates) {
      if (!date) continue;
      const remaining = date.getTime() - now.getTime();
      if (remaining > REMINDER_WINDOW_DAYS * DAY) continue; // not yet in the 7-day window
      if (remaining <= -OVERDUE_CATCHUP_DAYS * DAY) continue; // lapsed long ago
      const key = date.toISOString();
      if (data.expiryReminders?.[kind] === key) continue; // already reminded for this expiry
      due.push({ uid: id, kind, expiresAt: date, daysLeft: Math.ceil(remaining / DAY), overdue: remaining <= 0, key });
    }
  }
  return due;
};
