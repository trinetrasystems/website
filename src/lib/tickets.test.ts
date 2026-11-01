import { describe, expect, it } from "vitest";
import { Timestamp } from "firebase/firestore";
import { hasUnread, mergeThread, messageFromDoc, normalizeTicketStatus } from "./tickets";

const at = (iso: string) => Timestamp.fromDate(new Date(iso));

describe("normalizeTicketStatus", () => {
  it("maps website and mobile-app words to one set", () => {
    expect(normalizeTicketStatus("Active")).toBe("Active");
    expect(normalizeTicketStatus("open")).toBe("Active");
    expect(normalizeTicketStatus(undefined)).toBe("Active");
    expect(normalizeTicketStatus("In Progress")).toBe("In Progress");
    expect(normalizeTicketStatus("in_progress")).toBe("In Progress");
    expect(normalizeTicketStatus("done")).toBe("Solved");
    expect(normalizeTicketStatus("Solved")).toBe("Solved");
    expect(normalizeTicketStatus("Escalated")).toBe("Escalated");
  });
});

describe("mergeThread", () => {
  it("merges legacy replies and subcollection messages in time order", () => {
    const thread = mergeThread(
      [{ message: "Legacy admin reply", role: "admin", timestamp: at("2026-10-02T10:00:00Z") }],
      [
        messageFromDoc("m2", { from: "user", text: "Customer follow-up", createdAt: at("2026-10-03T10:00:00Z") }),
        messageFromDoc("m1", { from: "support", text: "App auto reply", type: "text", createdAt: at("2026-10-01T10:00:00Z") }),
        messageFromDoc("m3", { from: "support", text: "Pending", createdAt: null }),
      ]
    );
    expect(thread.map((m) => [m.id, m.from, m.text])).toEqual([
      ["m1", "support", "App auto reply"],
      ["legacy-0", "support", "Legacy admin reply"],
      ["m2", "user", "Customer follow-up"],
      ["m3", "support", "Pending"], // pending server timestamp sorts last
    ]);
  });

  it("tolerates missing replies and odd message docs", () => {
    expect(mergeThread(undefined, [])).toEqual([]);
    expect(messageFromDoc("x", { from: "bot", type: "image" })).toMatchObject({ from: "user", text: "[image]" });
  });
});

describe("hasUnread", () => {
  const base = { lastMessageAt: at("2026-10-05T10:00:00Z") };
  it("flags messages from the other side newer than the last read", () => {
    expect(hasUnread({ ...base, lastMessageFrom: "support" }, "user")).toBe(true);
    expect(hasUnread({ ...base, lastMessageFrom: "support", userReadAt: at("2026-10-05T11:00:00Z") }, "user")).toBe(false);
    expect(hasUnread({ ...base, lastMessageFrom: "support", userReadAt: at("2026-10-05T09:00:00Z") }, "user")).toBe(true);
    expect(hasUnread({ ...base, lastMessageFrom: "user" }, "support")).toBe(true);
  });
  it("never flags your own messages or tickets without chat activity", () => {
    expect(hasUnread({ ...base, lastMessageFrom: "user" }, "user")).toBe(false);
    expect(hasUnread({ status: "open" }, "support")).toBe(false);
  });
});
