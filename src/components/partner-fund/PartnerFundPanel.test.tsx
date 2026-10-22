import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

const { addDoc, updateDoc, serverTimestamp } = await import("firebase/firestore");
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
    vi.mocked(addDoc).mockReset().mockResolvedValue({ id: "new" } as never);
    vi.mocked(updateDoc).mockReset().mockResolvedValue(undefined as never);
    vi.mocked(serverTimestamp).mockReturnValue("SERVER_TIME" as never);
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

  it("writes a new entry to the database, in paise, stamped with the admin's id", async () => {
    const user = userEvent.setup();
    render(<PartnerFundPanel />);
    push([]);

    await user.click(screen.getByRole("button", { name: /Add entry/ }));
    await user.type(screen.getByLabelText("Amount (₹)"), "30000");
    await user.selectOptions(screen.getByLabelText("Paid by"), "yash");
    await user.type(screen.getByLabelText("Category"), "Hardware");
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Add entry" }));

    await waitFor(() => expect(addDoc).toHaveBeenCalledTimes(1));
    const payload = vi.mocked(addDoc).mock.calls[0][1] as Record<string, unknown>;
    expect(payload).toMatchObject({
      type: "expense",
      amount: 3000000,
      partnerId: "yash",
      category: "Hardware",
      voided: false,
      createdByUid: "admin-1",
      createdAt: "SERVER_TIME",
    });
    expect(payload.date).toBeInstanceOf(FakeTimestamp);
    // The dialog closes once the write succeeds.
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("updates an existing entry rather than creating a second one", async () => {
    const user = userEvent.setup();
    render(<PartnerFundPanel />);
    push([entryDoc("e1", "expense", 30000, "yash")]);

    await user.click(within(screen.getByRole("table")).getByLabelText("Edit entry"));
    const amount = screen.getByLabelText("Amount (₹)");
    await user.clear(amount);
    await user.type(amount, "31000");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => expect(updateDoc).toHaveBeenCalledTimes(1));
    expect(addDoc).not.toHaveBeenCalled();
    const payload = vi.mocked(updateDoc).mock.calls[0][1] as unknown as Record<string, unknown>;
    expect(payload).toMatchObject({ amount: 3100000, voided: false, updatedByUid: "admin-1", updatedAt: "SERVER_TIME" });
    // The original author and creation time are never rewritten from here.
    expect(payload).not.toHaveProperty("createdAt");
    expect(payload).not.toHaveProperty("createdByUid");
  });

  it("asks before cancelling an entry, and does nothing if you decline", async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<PartnerFundPanel />);
    push([entryDoc("e1", "expense", 30000, "yash")]);

    await user.click(within(screen.getByRole("table")).getByLabelText("Cancel entry"));
    expect(confirm).toHaveBeenCalledWith(expect.stringContaining("₹30,000"));
    expect(updateDoc).not.toHaveBeenCalled();

    confirm.mockReturnValue(true);
    await user.click(within(screen.getByRole("table")).getByLabelText("Cancel entry"));
    await waitFor(() => expect(updateDoc).toHaveBeenCalledTimes(1));
    expect(vi.mocked(updateDoc).mock.calls[0][1]).toMatchObject({ voided: true, updatedByUid: "admin-1" });
    confirm.mockRestore();
  });

  it("restores a cancelled entry without asking", async () => {
    const user = userEvent.setup();
    render(<PartnerFundPanel />);
    push([entryDoc("e1", "expense", 30000, "yash", { voided: true })]);

    await user.click(screen.getByLabelText(/Show cancelled/i));
    await user.click(within(screen.getByRole("table")).getByLabelText("Restore entry"));

    await waitFor(() => expect(updateDoc).toHaveBeenCalledTimes(1));
    expect(vi.mocked(updateDoc).mock.calls[0][1]).toMatchObject({ voided: false });
  });

  it("surfaces a failed save instead of silently losing the entry", async () => {
    const user = userEvent.setup();
    vi.mocked(addDoc).mockRejectedValueOnce(new Error("Missing or insufficient permissions."));
    render(<PartnerFundPanel />);
    push([]);

    await user.click(screen.getByRole("button", { name: /Add entry/ }));
    await user.type(screen.getByLabelText("Amount (₹)"), "500");
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Add entry" }));

    expect(await screen.findByText(/Missing or insufficient permissions/)).toBeInTheDocument();
    // The dialog stays open so the typed entry is not lost.
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("recalculates as soon as new data arrives", () => {
    render(<PartnerFundPanel />);
    push([entryDoc("e1", "expense", 30000, "yash")]);
    expect(money(netOf("Yash"))).toContain("₹20,000");

    push([entryDoc("e1", "expense", 30000, "yash"), entryDoc("e2", "payout", 20000, "yash")]);
    expect(within(cardFor("Yash")).getByText("Settled")).toBeInTheDocument();
  });

  it("ignores malformed documents rather than crashing", () => {
    render(<PartnerFundPanel />);
    push([
      entryDoc("ok", "expense", 30000, "yash"),
      { id: "bad-type", data: () => ({ type: "nonsense", amount: 100, date: FakeTimestamp.fromDate(new Date()), voided: false }) },
      { id: "no-amount", data: () => ({ type: "expense", date: FakeTimestamp.fromDate(new Date()), voided: false }) },
      { id: "no-date", data: () => ({ type: "expense", amount: 100, voided: false }) },
      { id: "bad-partner", data: () => ({ type: "expense", amount: 100000, date: FakeTimestamp.fromDate(new Date()), partnerId: "someone-else", voided: false }) },
    ]);

    // Only the good entry and the unknown-partner one (treated as company-paid) count.
    expect(money(summaryTile("Total spent"))).toContain("₹31,000");
    expect(money(netOf("Yash"))).toContain("₹19,666.66"); // the spare paisa lands on his share of costs
  });
});
