import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

// Regression: with real Firestore a just-written serverTimestamp() reads as
// null until the server confirms it, so the ticket keeps looking "unread".
// The hook must still write the read marker only once per new message —
// an earlier version looped and starved the admin's reply write.
const updateDoc = vi.fn(async () => undefined);
vi.mock("firebase/firestore", async (orig) => ({
  ...(await orig<typeof import("firebase/firestore")>()),
  updateDoc: (...args: unknown[]) => updateDoc(...(args as [])),
  doc: (_db: unknown, ...path: string[]) => ({ path: path.join("/") }),
  serverTimestamp: () => "SERVER_TS",
}));
vi.mock("@/lib/firebase", () => ({ db: {}, auth: {} }));

import { Timestamp } from "firebase/firestore";
import { useMarkOpenTicketRead } from "./tickets";

const ticket = (lastMs: number, readAt: unknown = null) => ({
  id: "t1",
  lastMessageFrom: "user",
  lastMessageAt: Timestamp.fromMillis(lastMs),
  supportReadAt: readAt, // pending write → null
});

describe("useMarkOpenTicketRead", () => {
  beforeEach(() => updateDoc.mockClear());

  it("writes once per new message even while the read marker is still pending", () => {
    const { rerender } = renderHook(({ tickets, open }) => useMarkOpenTicketRead(tickets, open, "support"), {
      initialProps: { tickets: [ticket(1000)], open: "t1" as string | null },
    });
    for (let i = 0; i < 5; i++) rerender({ tickets: [ticket(1000)], open: "t1" }); // snapshots with pending marker
    expect(updateDoc).toHaveBeenCalledTimes(1);
    expect(updateDoc).toHaveBeenCalledWith({ path: "tickets/t1" }, { supportReadAt: "SERVER_TS" });

    rerender({ tickets: [ticket(2000)], open: "t1" }); // a newer customer message arrives while open
    expect(updateDoc).toHaveBeenCalledTimes(2);
  });

  it("does nothing for closed tickets, already-read tickets or your own messages", () => {
    const { rerender } = renderHook(({ tickets, open }) => useMarkOpenTicketRead(tickets, open, "support"), {
      initialProps: { tickets: [ticket(1000)], open: null as string | null },
    });
    rerender({ tickets: [ticket(1000, Timestamp.fromMillis(5000))], open: "t1" });
    rerender({ tickets: [{ ...ticket(3000), lastMessageFrom: "support" }], open: "t1" });
    expect(updateDoc).not.toHaveBeenCalled();
  });
});
