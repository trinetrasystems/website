import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import FundEntryDialog, { type FundEntryDraft } from "./FundEntryDialog";
import type { FundEntry } from "@/lib/partnerFund";

const setup = (props: Partial<React.ComponentProps<typeof FundEntryDialog>> = {}) => {
  const onSave = vi.fn();
  const onClose = vi.fn();
  render(<FundEntryDialog open editing={null} saving={false} onSave={onSave} onClose={onClose} {...props} />);
  return { onSave, onClose, user: userEvent.setup() };
};

const savedDraft = (onSave: ReturnType<typeof vi.fn>): FundEntryDraft => onSave.mock.calls[0][0];

const fill = async (user: ReturnType<typeof userEvent.setup>, { amount, date }: { amount?: string; date?: string }) => {
  if (amount !== undefined) await user.type(screen.getByLabelText("Amount (₹)"), amount);
  if (date !== undefined) {
    const field = screen.getByLabelText("Date");
    await user.clear(field);
    await user.type(field, date);
  }
};

describe("FundEntryDialog", () => {
  it("is not rendered while closed", () => {
    render(<FundEntryDialog open={false} editing={null} saving={false} onSave={vi.fn()} onClose={vi.fn()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("saves an expense paid from a partner's pocket", async () => {
    const { onSave, user } = setup();
    await fill(user, { amount: "30000", date: "2026-09-14" });
    await user.selectOptions(screen.getByLabelText("Paid by"), "yash");
    await user.type(screen.getByLabelText("Category"), "Hardware");
    await user.type(screen.getByLabelText("Note"), "Jetson board");
    await user.click(screen.getByRole("button", { name: "Add entry" }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    const draft = savedDraft(onSave);
    expect(draft.type).toBe("expense");
    expect(draft.amount).toBe(3000000); // paise
    expect(draft.partnerId).toBe("yash");
    expect(draft.category).toBe("Hardware");
    expect(draft.note).toBe("Jetson board");
    expect(draft.date.getFullYear()).toBe(2026);
    expect(draft.date.getMonth()).toBe(8); // September
    expect(draft.date.getDate()).toBe(14);
  });

  it("saves an expense paid from company funds with no partner attached", async () => {
    const { onSave, user } = setup();
    await fill(user, { amount: "4500" });
    await user.selectOptions(screen.getByLabelText("Paid by"), "__company__");
    await user.click(screen.getByRole("button", { name: "Add entry" }));

    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(savedDraft(onSave).partnerId).toBeNull();
  });

  it("keeps client income in the company account, with no partner field", async () => {
    const { onSave, user } = setup();
    await user.selectOptions(screen.getByLabelText("Type"), "income");
    expect(screen.queryByLabelText(/Paid by|Money from|Paid to/)).not.toBeInTheDocument();

    await fill(user, { amount: "90000" });
    await user.click(screen.getByRole("button", { name: "Add entry" }));

    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(savedDraft(onSave)).toMatchObject({ type: "income", partnerId: null, amount: 9000000 });
  });

  it("always attaches a partner to a payout, even after switching from company funds", async () => {
    const { onSave, user } = setup();
    // Pick "company funds" on an expense first, then switch to a payout.
    await user.selectOptions(screen.getByLabelText("Paid by"), "__company__");
    await user.selectOptions(screen.getByLabelText("Type"), "payout");

    const paidTo = screen.getByLabelText("Paid to");
    expect((paidTo as HTMLSelectElement).value).toBe("yash");
    // A payout cannot come out of nobody's name, so the option is not offered.
    expect(screen.queryByRole("option", { name: /Company funds \(not a partner\)/ })).not.toBeInTheDocument();

    await user.selectOptions(paidTo, "bhagya");
    await fill(user, { amount: "12000" });
    await user.click(screen.getByRole("button", { name: "Add entry" }));

    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(savedDraft(onSave)).toMatchObject({ type: "payout", partnerId: "bhagya" });
  });

  it("drops the category when the type is not an expense", async () => {
    const { onSave, user } = setup();
    await user.type(screen.getByLabelText("Category"), "Hardware");
    await user.selectOptions(screen.getByLabelText("Type"), "contribution");
    expect(screen.queryByLabelText("Category")).not.toBeInTheDocument();

    await fill(user, { amount: "50000" });
    await user.click(screen.getByRole("button", { name: "Add entry" }));

    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(savedDraft(onSave).category).toBe("");
  });

  it("converts rupees and paise without floating point drift", async () => {
    const { onSave, user } = setup();
    await fill(user, { amount: "1250.55" });
    await user.click(screen.getByRole("button", { name: "Add entry" }));

    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(savedDraft(onSave).amount).toBe(125055);
  });

  it.each([
    ["an empty amount", ""],
    ["zero", "0"],
    ["a negative amount", "-500"],
    ["text", "abcd"],
  ])("refuses to save %s", async (_label, amount) => {
    const { onSave, user } = setup();
    if (amount) await fill(user, { amount });
    await user.click(screen.getByRole("button", { name: "Add entry" }));

    expect(await screen.findByText(/Enter an amount greater than zero/i)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("refuses an absurd amount, matching the database rule", async () => {
    const { onSave, user } = setup();
    await fill(user, { amount: "1000000001" }); // over Rs 100 crore
    await user.click(screen.getByRole("button", { name: "Add entry" }));

    expect(await screen.findByText(/over ₹100 crore/i)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("shows the typed amount formatted, as a cross-check against typos", async () => {
    const { user } = setup();
    await fill(user, { amount: "150000" });
    expect(screen.getByText(/₹1,50,000/)).toBeInTheDocument();
  });

  it("pre-fills every field when editing, and keeps the entry's own date", async () => {
    const editing: FundEntry = {
      id: "e1",
      type: "payout",
      amount: 1200000,
      date: new Date(2026, 9, 15),
      partnerId: "bhagya",
      category: "",
      note: "Part repayment",
      voided: false,
    };
    const { onSave, user } = setup({ editing });

    expect(screen.getByRole("heading", { name: "Edit entry" })).toBeInTheDocument();
    expect((screen.getByLabelText("Amount (₹)") as HTMLInputElement).value).toBe("12000");
    expect((screen.getByLabelText("Date") as HTMLInputElement).value).toBe("2026-10-15");
    expect((screen.getByLabelText("Paid to") as HTMLSelectElement).value).toBe("bhagya");
    expect((screen.getByLabelText("Note") as HTMLTextAreaElement).value).toBe("Part repayment");

    await user.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(savedDraft(onSave).amount).toBe(1200000);
  });

  it("closes without saving on Cancel", async () => {
    const { onSave, onClose, user } = setup();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("disables the save button while a save is in flight", () => {
    setup({ saving: true });
    expect(screen.getByRole("button", { name: /Saving/ })).toBeDisabled();
  });
});
