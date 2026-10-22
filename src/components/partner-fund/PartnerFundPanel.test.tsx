import { act, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Stand-in for the Firestore Timestamp class so `instanceof` still works.
class FakeTimestamp {
  constructor(private readonly value: Date) {}
  toDate() {
    return this.value;
  }
  static fromDate(value: Date) {
    return new FakeTimestamp(value);
  }
}

type Snapshot = { docs: { id: string; data: () => Record<string, unknown> }[] };
let emit: (snapshot: Snapshot) => void = () => {};
let fail: (error: { code: string; message: string }) => void = () => {};

vi.mock("@/lib/firebase", () => ({ db: {}, auth: { currentUser: { uid: "admin-1" } } }));

vi.mock("firebase/firestore", () => ({
  Timestamp: FakeTimestamp,
  collection: vi.fn(),
  doc: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  serverTimestamp: vi.fn(),
  onSnapshot: (_q: unknown, onNext: (s: Snapshot) => void, onError: (e: { code: string; message: string }) => void) => {
    emit = onNext;
    fail = onError;
    return () => {};
  },
}));

const { default: PartnerFundPanel } = await import("./PartnerFundPanel");

const entryDoc = (
  id: string,
  type: string,
  amountInRupees: number,
  partnerId: string | null,
  extra: Record<string, unknown> = {},
) => ({
  id,
  data: () => ({
    type,
    amount: amountInRupees * 100,
    date: FakeTimestamp.fromDate(new Date("2026-02-01")),
    partnerId,
    category: "Hardware",
    note: `${type} note`,
    voided: false,
    ...extra,
  }),
});

/** Pushes a snapshot through the mocked listener and lets React re-render. */
const push = (docs: Snapshot["docs"]) => act(() => emit({ docs }));

/** The card for one partner, so assertions cannot pick up another partner's figures. */
const cardFor = (name: string) => screen.getByRole("heading", { name, level: 3 }).closest("div")!.parentElement!;

/** A summary tile at the top, found by its small uppercase label. */
const summaryTile = (label: string) =>
  screen.getAllByText(label).find((el) => el.tagName === "P" && el.className.includes("uppercase"))!.parentElement!
    .textContent ?? "";

/** The headline figure on a partner's card (not the per-line breakdown below it). */
const netOf = (name: string) => cardFor(name).querySelector('[data-testid="partner-net"]')!.textContent ?? "";

const money = (text: string) => text.replace(/ /g, " ");

describe("PartnerFundPanel", () => {
  beforeEach(() => {
    emit = () => {};
    fail = () => {};
  });

  it("shows who the company owes after partners pay from their own pockets", () => {
    render(<PartnerFundPanel />);
    push([
        entryDoc("1", "expense", 30000, "yash"),
        entryDoc("2", "expense", 15000, "bhagya"),
      ]);

    // Yash paid 30,000 of the 45,000 spent, so he is owed 30,000 - 15,000.
    expect(money(netOf("Yash"))).toContain("₹15,000");
    expect(within(cardFor("Yash")).getByText("Company owes")).toBeInTheDocument();
    expect(within(cardFor("Bhagya")).getByText("Settled")).toBeInTheDocument();
    expect(within(cardFor("Pratik")).getByText("Owes company")).toBeInTheDocument();

    // Nothing has gone through the company account yet.
    expect(money(summaryTile("Company funds"))).toContain("₹0");
    expect(money(summaryTile("Total spent"))).toContain("₹45,000");
  });

  it("clears a partner's balance once the company pays them back", () => {
    render(<PartnerFundPanel />);
    push([
        entryDoc("1", "expense", 30000, "yash"),
        entryDoc("2", "expense", 15000, "bhagya"),
        entryDoc("3", "contribution", 15000, "pratik"),
        entryDoc("4", "payout", 15000, "yash"),
      ]);

    expect(within(cardFor("Yash")).getByText("Settled")).toBeInTheDocument();
    expect(within(cardFor("Pratik")).getByText("Settled")).toBeInTheDocument();
  });

  it("leaves cancelled entries out of the totals", () => {
    render(<PartnerFundPanel />);
    push([
        entryDoc("1", "expense", 30000, "yash"),
        entryDoc("2", "expense", 900000, "yash", { voided: true }),
      ]);

    expect(money(summaryTile("Total spent"))).toContain("₹30,000");
  });

  it("explains what to do when the database refuses the read", () => {
    render(<PartnerFundPanel />);
    act(() => fail({ code: "permission-denied", message: "Missing or insufficient permissions." }));

    expect(screen.getByText(/database is refusing to open the partner fund/i)).toBeInTheDocument();
    expect(screen.getByText("firestore.rules")).toBeInTheDocument();
    expect(screen.queryByText("Add entry")).not.toBeInTheDocument();
  });

  it("lists the entries in the ledger", () => {
    render(<PartnerFundPanel />);
    push([entryDoc("1", "expense", 30000, "yash")]);

    const table = screen.getByRole("table");
    expect(within(table).getByText("Expense")).toBeInTheDocument();
    expect(within(table).getByText("Yash")).toBeInTheDocument();
    expect(money(within(table).getByText(/₹30,000/).textContent!)).toContain("₹30,000");
  });
});
