// @vitest-environment node
import { describe, expect, it } from "vitest";
import { findDueReminders } from "./reminders";

const DAY = 86_400_000;
const NOW = new Date("2026-11-01T03:30:00Z"); // 09:00 IST, when the cron runs
const at = (ms: number) => ({ toDate: () => new Date(NOW.getTime() + ms) });
const sub = (until: number, extra: Record<string, unknown> = {}) => ({ role: "user", planType: "subscription", softwareValidUntil: at(until), ...extra });
const due = (data: Record<string, unknown>) => findDueReminders([{ id: "u", data }], NOW);

describe("findDueReminders — never miss, never duplicate", () => {
  it("is due at exactly 7 days, not one minute before the window", () => {
    expect(due(sub(7 * DAY))).toHaveLength(1);
    expect(due(sub(7 * DAY + 60_000))).toHaveLength(0);
  });

  it("is due on every day inside the window until reminded (so a failed run is retried next day)", () => {
    for (const d of [6, 5, 3, 1]) expect(due(sub(d * DAY))).toHaveLength(1);
    expect(due(sub(60_000))[0]).toMatchObject({ daysLeft: 1, overdue: false }); // expires within the day
  });

  it("an end date at 23:59 IST reminded at 09:00 IST seven days earlier", () => {
    const endOfDayIst = new Date("2026-11-08T23:59:59.999+05:30"); // 7 days + ~15h after NOW
    expect(findDueReminders([{ id: "u", data: { role: "user", softwareValidUntil: { toDate: () => endOfDayIst } } }], NOW)).toHaveLength(0);
    const nextDay = new Date(NOW.getTime() + DAY);
    expect(findDueReminders([{ id: "u", data: { role: "user", softwareValidUntil: { toDate: () => endOfDayIst } } }], nextDay)).toHaveLength(1);
  });

  it("catches up on lapses within 30 days, ignores older ones", () => {
    expect(due(sub(-1))[0]).toMatchObject({ overdue: true });
    expect(due(sub(-29 * DAY))).toHaveLength(1);
    expect(due(sub(-31 * DAY))).toHaveLength(0);
  });

  it("never repeats the same expiry, but re-arms after renewal", () => {
    const until = new Date(NOW.getTime() + 3 * DAY);
    const reminded = { expiryReminders: { subscription: until.toISOString() } };
    expect(due(sub(3 * DAY, reminded))).toHaveLength(0);
    expect(due(sub(5 * DAY, reminded))).toHaveLength(1); // new end date
  });

  it("tracks maintenance for lifetime plans and ignores staff accounts", () => {
    expect(due({ role: "user", planType: "lifetime", softwareLifetime: true, maintenanceValidUntil: at(2 * DAY) })[0].kind).toBe("maintenance");
    expect(due({ role: "user", planType: "lifetime", softwareLifetime: true })).toHaveLength(0);
    expect(due({ role: "admin", softwareValidUntil: at(DAY) })).toHaveLength(0);
    expect(due({ role: "admin", isMember: true, softwareValidUntil: at(DAY) })).toHaveLength(0);
  });

  it("reads legacy docs (validUntil, no planType)", () => {
    expect(due({ role: "user", validUntil: at(4 * DAY) })).toHaveLength(1);
  });
});
