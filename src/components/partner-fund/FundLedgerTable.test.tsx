import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FundLedgerTable from "./FundLedgerTable";
import type { FundEntry } from "@/lib/partnerFund";

const entry = (over: Partial<FundEntry> & Pick<FundEntry, "id" | "type">): FundEntry => ({
  amount: 100000,
  date: new Date(2026, 8, 14),
  partnerId: null,
  category: "",
  note: "",
  voided: false,
  ...over,
});

const ENTRIES: FundEntry[] = [
  entry({ id: "a", type: "expense", amount: 3000000, partnerId: "yash", category: "Hardware", note: "Jetson board", date: new Date(2026, 8, 14) }),
  entry({ id: "b", type: "expense", amount: 1500000, partnerId: "bhagya", category: "Software", note: "Licences", date: new Date(2026, 8, 21) }),
  entry({ id: "c", type: "contribution", amount: 5000000, partnerId: "pratik", note: "Into the account", date: new Date(2026, 9, 1) }),
  entry({ id: "d", type: "income", amount: 9000000, note: "Retail deployment", date: new Date(2026, 9, 8) }),
  entry({ id: "e", type: "payout", amount: 1200000, partnerId: "yash", note: "Part repayment", date: new Date(2026, 9, 15) }),
  entry({ id: "f", type: "expense", amount: 450000, category: "Travel", note: "Site visit", voided: true, date: new Date(2026, 9, 18) }),
];

const setup = (entries: FundEntry[] = ENTRIES) => {
  const onEdit = vi.fn();
  const onVoid = vi.fn();
  const onRestore = vi.fn();
  render(<FundLedgerTable entries={entries} onEdit={onEdit} onVoid={onVoid} onRestore={onRestore} />);
  return { onEdit, onVoid, onRestore, user: userEvent.setup() };
};

/** Rows of the desktop table (the phone card list renders the same entries). */
const rows = () => within(screen.getByRole("table")).getAllByRole("row").slice(1);
const rowText = () => rows().map((row) => row.textContent ?? "");

describe("FundLedgerTable", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("lists live entries newest first and hides cancelled ones", () => {
    setup();
    const text = rowText();
    expect(text).toHaveLength(5); // the voided entry is out
    expect(text[0]).toContain("Part repayment"); // 15 Oct
    expect(text[4]).toContain("Jetson board"); // 14 Sept
    expect(text.join(" ")).not.toContain("Site visit");
  });

  it("shows cancelled entries when asked, marked as such", async () => {
    const { user } = setup();
    await user.click(screen.getByLabelText(/Show cancelled/i));

    expect(rows()).toHaveLength(6);
    expect(rowText().join(" ")).toContain("Site visit");
    expect(within(screen.getByRole("table")).getByText("Cancelled")).toBeInTheDocument();
  });

  it("filters by type", async () => {
    const { user } = setup();
    await user.selectOptions(screen.getByLabelText("Filter by type"), "expense");

    const text = rowText();
    expect(text).toHaveLength(2);
    expect(text.join(" ")).toContain("Jetson board");
    expect(text.join(" ")).not.toContain("Retail deployment");
  });

  it("filters by partner", async () => {
    const { user } = setup();
    await user.selectOptions(screen.getByLabelText("Filter by partner"), "yash");

    const text = rowText();
    expect(text).toHaveLength(2); // his expense and his payout
    expect(text.join(" ")).toContain("Part repayment");
    expect(text.join(" ")).not.toContain("Licences");
  });

  it("filters down to entries with no partner attached", async () => {
    const { user } = setup();
    await user.selectOptions(screen.getByLabelText("Filter by partner"), "company");

    const text = rowText();
    expect(text).toHaveLength(1);
    expect(text[0]).toContain("Retail deployment");
  });

  it("searches notes, categories, partner names and types", async () => {
    const { user } = setup();
    const search = screen.getByLabelText("Search entries");

    await user.type(search, "jetson");
    expect(rowText()).toHaveLength(1);

    await user.clear(search);
    await user.type(search, "Software");
    expect(rowText()).toHaveLength(1);

    await user.clear(search);
    await user.type(search, "pratik");
    expect(rowText()).toHaveLength(1);

    await user.clear(search);
    await user.type(search, "zzz-nothing");
    expect(screen.getAllByText(/Nothing matches these filters/).length).toBeGreaterThan(0);
  });

  it("combines filters with search", async () => {
    const { user } = setup();
    await user.selectOptions(screen.getByLabelText("Filter by type"), "expense");
    await user.type(screen.getByLabelText("Search entries"), "licences");

    expect(rowText()).toHaveLength(1);
    expect(rowText()[0]).toContain("Licences");
  });

  it("shows how an entry moves the company account", () => {
    setup();
    const table = screen.getByRole("table");
    const paidOut = within(table).getAllByRole("row").find((row) => row.textContent?.includes("Part repayment"))!;
    const pocketExpense = within(table).getAllByRole("row").find((row) => row.textContent?.includes("Jetson board"))!;

    expect(paidOut.textContent).toContain("-₹12,000"); // left the account
    expect(pocketExpense.textContent).toContain("—"); // pocket money: the account did not move
  });

  it("offers edit and cancel on live entries, and restore on cancelled ones", async () => {
    const { onEdit, onVoid, onRestore, user } = setup();

    await user.click(within(rows()[0]).getByLabelText("Edit entry"));
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: "e" }));

    await user.click(within(rows()[0]).getByLabelText("Cancel entry"));
    expect(onVoid).toHaveBeenCalledWith(expect.objectContaining({ id: "e" }));

    await user.click(screen.getByLabelText(/Show cancelled/i));
    const cancelledRow = rows().find((row) => row.textContent?.includes("Site visit"))!;
    expect(within(cancelledRow).queryByLabelText("Edit entry")).not.toBeInTheDocument();
    await user.click(within(cancelledRow).getByLabelText("Restore entry"));
    expect(onRestore).toHaveBeenCalledWith(expect.objectContaining({ id: "f" }));
  });

  it("exports exactly what is on screen as CSV", async () => {
    const url = "blob:fake";
    const createObjectURL = vi.fn((_blob: Blob) => url);
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL });
    const clicks: string[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      clicks.push(this.download);
    });

    const { user } = setup();
    await user.selectOptions(screen.getByLabelText("Filter by type"), "expense");
    await user.click(screen.getByRole("button", { name: "CSV" }));

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const blob = createObjectURL.mock.calls[0][0];
    const csv = await blob.text();

    expect(csv.split("\n")).toHaveLength(3); // header + the two live expenses
    expect(csv).toContain('"Date","Type","Partner","Category","Note","Amount (₹)","Company funds","Voided"');
    expect(csv).toContain('"Jetson board"');
    expect(csv).toContain('"30000.00"');
    expect(csv).not.toContain("Retail deployment");
    expect(clicks[0]).toMatch(/^trinetra-partner-fund-\d{4}-\d{2}-\d{2}\.csv$/);
    expect(revokeObjectURL).toHaveBeenCalledWith(url);
  });

  it("quotes CSV fields that contain commas or quotes", async () => {
    const createObjectURL = vi.fn((_blob: Blob) => "blob:fake");
    vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL: vi.fn() });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    const { user } = setup([
      entry({ id: "x", type: "expense", partnerId: "yash", note: 'Cable, 10m and a "spare"' }),
    ]);
    await user.click(screen.getByRole("button", { name: "CSV" }));

    const csv = await createObjectURL.mock.calls[0][0].text();
    expect(csv).toContain('"Cable, 10m and a ""spare"""');
    expect(csv.split("\n")).toHaveLength(2);
  });

  it("tells you when there is nothing at all, and disables the export", () => {
    setup([]);
    expect(screen.getAllByText(/No entries yet/).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "CSV" })).toBeDisabled();
  });

  it("renders the same entries as cards for phones", () => {
    setup();
    // The card list sits outside the table, so look for a second copy of the note.
    expect(screen.getAllByText("Part repayment")).toHaveLength(2);
  });
});
