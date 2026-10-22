import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { PARTNERS, formatINR, toPaise, toRupees, type FundEntry, type FundEntryType, type PartnerId } from "@/lib/partnerFund";

export type FundEntryDraft = {
  type: FundEntryType;
  amount: number;
  date: Date;
  partnerId: PartnerId | null;
  category: string;
  note: string;
};

const TYPE_OPTIONS: { value: FundEntryType; label: string; hint: string }[] = [
  { value: "expense", label: "Expense", hint: "A company cost. Say who paid it." },
  { value: "payout", label: "Paid to partner", hint: "Company pays a partner back. Reduces what they are owed." },
  { value: "contribution", label: "Money in", hint: "Money added to the company account." },
  { value: "income", label: "Client income", hint: "Money received from a client, into the company account." },
];

const COMMON_CATEGORIES = [
  "Hardware",
  "Software & subscriptions",
  "Salary",
  "Travel",
  "Marketing",
  "Office & utilities",
  "Professional fees",
  "Other",
];

const COMPANY_OPTION = "__company__";

const asDateInput = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

const labelClass = "text-xs font-semibold uppercase tracking-wide text-muted-foreground";
const fieldClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/40";

type FundEntryDialogProps = {
  open: boolean;
  editing: FundEntry | null;
  saving: boolean;
  onClose: () => void;
  onSave: (draft: FundEntryDraft) => Promise<void> | void;
};

const FundEntryDialog = ({ open, editing, saving, onClose, onSave }: FundEntryDialogProps) => {
  const [type, setType] = useState<FundEntryType>("expense");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => asDateInput(new Date()));
  const [paidBy, setPaidBy] = useState<string>(PARTNERS[0].id);
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Reload the form whenever it opens, so an edit never shows a stale draft.
  useEffect(() => {
    if (!open) return;
    setError(null);
    if (editing) {
      setType(editing.type);
      setAmount(String(toRupees(editing.amount)));
      setDate(asDateInput(editing.date));
      setPaidBy(editing.partnerId ?? COMPANY_OPTION);
      setCategory(editing.category);
      setNote(editing.note);
    } else {
      setType("expense");
      setAmount("");
      setDate(asDateInput(new Date()));
      setPaidBy(PARTNERS[0].id);
      setCategory("");
      setNote("");
    }
  }, [open, editing]);

  if (!open) return null;

  // Income always lands in the company account; a payout always goes to a partner.
  const needsPartner = type === "payout";
  const allowsCompany = type === "expense" || type === "contribution";
  const showsPartnerField = needsPartner || allowsCompany;

  const partnerLabel =
    type === "payout" ? "Paid to" : type === "contribution" ? "Money from" : "Paid by";

  const paise = toPaise(amount);
  const amountIsValid = Number.isFinite(paise) && paise > 0;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!amountIsValid) {
      setError("Enter an amount greater than zero.");
      return;
    }
    if (paise > 10000000000) {
      setError("That is over ₹100 crore — check the amount.");
      return;
    }
    const parsedDate = new Date(`${date}T00:00:00`);
    if (Number.isNaN(parsedDate.getTime())) {
      setError("Pick a valid date.");
      return;
    }

    const partnerId = !showsPartnerField || paidBy === COMPANY_OPTION ? null : (paidBy as PartnerId);
    if (needsPartner && partnerId === null) {
      setError("Choose which partner was paid.");
      return;
    }

    await onSave({
      type,
      amount: paise,
      date: parsedDate,
      partnerId,
      category: type === "expense" ? category.trim() : "",
      note: note.trim(),
    });
  };

  const activeType = TYPE_OPTIONS.find((option) => option.value === type)!;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={editing ? "Edit entry" : "Add entry"}
      onClick={onClose}
    >
      <div
        className="my-auto w-full max-w-lg rounded-2xl border border-border bg-card p-5 shadow-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold">{editing ? "Edit entry" : "Add entry"}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{activeType.hint}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg border border-border p-2 transition hover:bg-secondary/40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="fund-type">Type</label>
            <select
              id="fund-type"
              className={fieldClass}
              value={type}
              onChange={(event) => {
                const next = event.target.value as FundEntryType;
                setType(next);
                // A payout must name a partner, so never leave "company" selected.
                if (next === "payout" && paidBy === COMPANY_OPTION) setPaidBy(PARTNERS[0].id);
              }}
            >
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className={labelClass} htmlFor="fund-amount">Amount (₹)</label>
              <input
                id="fund-amount"
                className={fieldClass}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                inputMode="decimal"
                placeholder="30000"
                autoFocus
              />
              {amountIsValid && (
                <p className="text-xs text-muted-foreground">{formatINR(paise)}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className={labelClass} htmlFor="fund-date">Date</label>
              <input
                id="fund-date"
                type="date"
                className={fieldClass}
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>
          </div>

          {showsPartnerField && (
            <div className="space-y-1.5">
              <label className={labelClass} htmlFor="fund-partner">{partnerLabel}</label>
              <select
                id="fund-partner"
                className={fieldClass}
                value={paidBy}
                onChange={(event) => setPaidBy(event.target.value)}
              >
                {PARTNERS.map((partner) => (
                  <option key={partner.id} value={partner.id}>{partner.name}</option>
                ))}
                {allowsCompany && <option value={COMPANY_OPTION}>Company funds (not a partner)</option>}
              </select>
              {type === "expense" && (
                <p className="text-xs text-muted-foreground">
                  {paidBy === COMPANY_OPTION
                    ? "Comes out of the company account."
                    : "Paid from their own pocket — the company owes them this back."}
                </p>
              )}
            </div>
          )}

          {type === "expense" && (
            <div className="space-y-1.5">
              <label className={labelClass} htmlFor="fund-category">Category</label>
              <input
                id="fund-category"
                className={fieldClass}
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                list="fund-categories"
                placeholder="Hardware"
                maxLength={40}
              />
              <datalist id="fund-categories">
                {COMMON_CATEGORIES.map((item) => <option key={item} value={item} />)}
              </datalist>
            </div>
          )}

          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="fund-note">Note</label>
            <textarea
              id="fund-note"
              className={`${fieldClass} min-h-[72px] resize-none`}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Jetson board for the Ahmedabad site"
              maxLength={500}
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition hover:bg-secondary/40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving…" : editing ? "Save changes" : "Add entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FundEntryDialog;
