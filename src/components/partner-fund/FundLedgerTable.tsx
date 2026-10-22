import { useMemo, useState } from "react";
import { Download, Pencil, RotateCcw, Search, Trash2 } from "lucide-react";
import {
  PARTNERS,
  describeEntry,
  formatDelta,
  formatINR,
  partnerName,
  type FundEntry,
  type FundEntryType,
} from "@/lib/partnerFund";

const TYPE_LABELS: Record<FundEntryType, string> = {
  expense: "Expense",
  payout: "Paid to partner",
  contribution: "Money in",
  income: "Client income",
};

const TYPE_BADGE: Record<FundEntryType, string> = {
  expense: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  payout: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  contribution: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  income: "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
};

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const fieldClass =
  "rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/40";

type FundLedgerTableProps = {
  entries: FundEntry[];
  onEdit: (entry: FundEntry) => void;
  onVoid: (entry: FundEntry) => void;
  onRestore: (entry: FundEntry) => void;
};

const FundLedgerTable = ({ entries, onEdit, onVoid, onRestore }: FundLedgerTableProps) => {
  const [typeFilter, setTypeFilter] = useState<FundEntryType | "all">("all");
  const [partnerFilter, setPartnerFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showVoided, setShowVoided] = useState(false);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return entries
      .filter((entry) => (showVoided ? true : !entry.voided))
      .filter((entry) => (typeFilter === "all" ? true : entry.type === typeFilter))
      .filter((entry) => {
        if (partnerFilter === "all") return true;
        if (partnerFilter === "company") return entry.partnerId === null;
        return entry.partnerId === partnerFilter;
      })
      .filter((entry) =>
        term
          ? `${entry.note} ${entry.category} ${partnerName(entry.partnerId)} ${TYPE_LABELS[entry.type]}`
              .toLowerCase()
              .includes(term)
          : true,
      )
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [entries, typeFilter, partnerFilter, search, showVoided]);

  const exportCsv = () => {
    const rows = [
      ["Date", "Type", "Partner", "Category", "Note", "Amount (₹)", "Company funds", "Voided"],
      ...visible.map((entry) => {
        const effect = describeEntry(entry);
        return [
          formatDate(entry.date),
          TYPE_LABELS[entry.type],
          entry.partnerId ? partnerName(entry.partnerId) : "Company funds",
          entry.category,
          entry.note,
          (entry.amount / 100).toFixed(2),
          (effect.companyDelta / 100).toFixed(2),
          entry.voided ? "yes" : "no",
        ];
      }),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `trinetra-partner-fund-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        <div className="relative w-full sm:min-w-[200px] sm:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className={`${fieldClass} w-full pl-9`}
            placeholder="Search notes, categories…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search entries"
          />
        </div>

        <select
          className={`${fieldClass} flex-1 sm:flex-none`}
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value as FundEntryType | "all")}
          aria-label="Filter by type"
        >
          <option value="all">All types</option>
          {(Object.keys(TYPE_LABELS) as FundEntryType[]).map((type) => (
            <option key={type} value={type}>{TYPE_LABELS[type]}</option>
          ))}
        </select>

        <select
          className={`${fieldClass} flex-1 sm:flex-none`}
          value={partnerFilter}
          onChange={(event) => setPartnerFilter(event.target.value)}
          aria-label="Filter by partner"
        >
          <option value="all">Everyone</option>
          {PARTNERS.map((partner) => (
            <option key={partner.id} value={partner.id}>{partner.name}</option>
          ))}
          <option value="company">Company funds</option>
        </select>

        <label className="inline-flex cursor-pointer items-center gap-2 py-1 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={showVoided}
            onChange={(event) => setShowVoided(event.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          Show cancelled
        </label>

        <button
          type="button"
          onClick={exportCsv}
          disabled={visible.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-medium transition hover:bg-secondary/40 disabled:opacity-50 sm:py-2"
        >
          <Download className="h-4 w-4" />
          CSV
        </button>
      </div>

      <div className="mt-4 hidden overflow-x-auto rounded-xl border border-border md:block">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-secondary/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Partner</th>
              <th className="px-4 py-3 font-semibold">Details</th>
              <th className="px-4 py-3 text-right font-semibold">Amount</th>
              <th className="px-4 py-3 text-right font-semibold">Company funds</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visible.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  {entries.length === 0 ? "No entries yet. Add the first one above." : "Nothing matches these filters."}
                </td>
              </tr>
            ) : (
              visible.map((entry) => {
                const effect = describeEntry(entry);
                return (
                  <tr key={entry.id} className={entry.voided ? "opacity-50" : undefined}>
                    <td className="whitespace-nowrap px-4 py-3">{formatDate(entry.date)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${TYPE_BADGE[entry.type]}`}>
                        {TYPE_LABELS[entry.type]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">{effect.paidBy}</td>
                    <td className="px-4 py-3">
                      <span className={entry.voided ? "line-through" : undefined}>
                        {entry.category && <span className="font-medium">{entry.category}</span>}
                        {entry.category && entry.note && " — "}
                        {entry.note}
                        {!entry.category && !entry.note && <span className="text-muted-foreground">—</span>}
                      </span>
                      {entry.voided && (
                        <span className="ml-2 rounded-full border border-border px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                          Cancelled
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums">
                      {formatINR(entry.amount)}
                    </td>
                    <td
                      className={`whitespace-nowrap px-4 py-3 text-right tabular-nums ${
                        effect.companyDelta > 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : effect.companyDelta < 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-muted-foreground"
                      }`}
                    >
                      {formatDelta(effect.companyDelta)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        {entry.voided ? (
                          <button
                            type="button"
                            onClick={() => onRestore(entry)}
                            aria-label="Restore entry"
                            title="Restore"
                            className="rounded-lg border border-border p-2 transition hover:bg-secondary/40"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => onEdit(entry)}
                              aria-label="Edit entry"
                              title="Edit"
                              className="rounded-lg border border-border p-2 transition hover:bg-secondary/40"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onVoid(entry)}
                              aria-label="Cancel entry"
                              title="Cancel this entry"
                              className="rounded-lg border border-border p-2 text-red-600 transition hover:bg-red-500/10 dark:text-red-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Phones: one card per entry, so nothing needs sideways scrolling. */}
      <div className="mt-4 space-y-3 md:hidden">
        {visible.length === 0 ? (
          <p className="rounded-xl border border-border px-4 py-8 text-center text-sm text-muted-foreground">
            {entries.length === 0 ? "No entries yet. Add the first one above." : "Nothing matches these filters."}
          </p>
        ) : (
          visible.map((entry) => {
            const effect = describeEntry(entry);
            return (
              <div
                key={entry.id}
                className={`rounded-xl border border-border p-4 ${entry.voided ? "opacity-50" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${TYPE_BADGE[entry.type]}`}>
                      {TYPE_LABELS[entry.type]}
                    </span>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {formatDate(entry.date)} · {effect.paidBy}
                    </p>
                  </div>
                  <p className="shrink-0 text-right text-lg font-bold tabular-nums">{formatINR(entry.amount)}</p>
                </div>

                {(entry.category || entry.note) && (
                  <p className={`mt-2 break-words text-sm ${entry.voided ? "line-through" : ""}`}>
                    {entry.category && <span className="font-medium">{entry.category}</span>}
                    {entry.category && entry.note && " — "}
                    {entry.note}
                  </p>
                )}

                <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
                  <p className="text-xs text-muted-foreground">
                    Company funds{" "}
                    <span
                      className={
                        effect.companyDelta > 0
                          ? "font-semibold text-emerald-600 dark:text-emerald-400"
                          : effect.companyDelta < 0
                            ? "font-semibold text-red-600 dark:text-red-400"
                            : ""
                      }
                    >
                      {formatDelta(effect.companyDelta)}
                    </span>
                    {entry.voided && <span className="ml-2 font-semibold uppercase">· Cancelled</span>}
                  </p>
                  <div className="flex shrink-0 gap-1">
                    {entry.voided ? (
                      <button
                        type="button"
                        onClick={() => onRestore(entry)}
                        aria-label="Restore entry"
                        className="rounded-lg border border-border p-2.5 transition hover:bg-secondary/40"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => onEdit(entry)}
                          aria-label="Edit entry"
                          className="rounded-lg border border-border p-2.5 transition hover:bg-secondary/40"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onVoid(entry)}
                          aria-label="Cancel entry"
                          className="rounded-lg border border-border p-2.5 text-red-600 transition hover:bg-red-500/10 dark:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {visible.length > 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          Showing {visible.length} of {entries.length} entries. Cancelled entries keep their history but are left out of every total.
        </p>
      )}
    </div>
  );
};

export default FundLedgerTable;
