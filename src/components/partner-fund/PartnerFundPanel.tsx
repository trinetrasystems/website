import { useEffect, useMemo, useState } from "react";
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { AlertTriangle, Lock, Plus, Wallet } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import {
  computeFundState,
  formatINR,
  isPartnerId,
  type FundEntry,
  type FundEntryType,
} from "@/lib/partnerFund";
import FundEntryDialog, { type FundEntryDraft } from "./FundEntryDialog";
import FundLedgerTable from "./FundLedgerTable";

const FUND_ENTRIES = "fundEntries";

const isFundEntryType = (value: unknown): value is FundEntryType =>
  value === "expense" || value === "payout" || value === "contribution" || value === "income";

/** Firestore document -> FundEntry, skipping anything that is not a usable entry. */
const toFundEntry = (id: string, data: Record<string, unknown>): FundEntry | null => {
  if (!isFundEntryType(data.type)) return null;
  if (typeof data.amount !== "number" || !Number.isFinite(data.amount)) return null;

  const rawDate = data.date;
  const date = rawDate instanceof Timestamp ? rawDate.toDate() : rawDate instanceof Date ? rawDate : null;
  if (!date) return null;

  return {
    id,
    type: data.type,
    amount: Math.round(data.amount),
    date,
    partnerId: isPartnerId(data.partnerId) ? data.partnerId : null,
    category: typeof data.category === "string" ? data.category : "",
    note: typeof data.note === "string" ? data.note : "",
    voided: data.voided === true,
  };
};

/** "−₹500", but a plain "₹0" so an empty row never shows a pointless minus sign. */
const withMinus = (paise: number) => (paise === 0 ? formatINR(0) : `−${formatINR(paise)}`);

const SummaryCard = ({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "positive" | "negative";
}) => (
  <div className="rounded-xl border border-border bg-background p-3 sm:p-4">
    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">{label}</p>
    <p
      className={`mt-1 break-words text-xl font-bold tabular-nums sm:text-2xl ${
        tone === "positive"
          ? "text-emerald-600 dark:text-emerald-400"
          : tone === "negative"
            ? "text-red-600 dark:text-red-400"
            : ""
      }`}
    >
      {value}
    </p>
    {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
  </div>
);

const PartnerFundPanel = () => {
  const [entries, setEntries] = useState<FundEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FundEntry | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, FUND_ENTRIES), orderBy("date", "desc")),
      (snapshot) => {
        const rows = snapshot.docs
          .map((entryDoc) => toFundEntry(entryDoc.id, entryDoc.data() as Record<string, unknown>))
          .filter((entry): entry is FundEntry => entry !== null);
        setEntries(rows);
        setAccessDenied(false);
        setError(null);
        setLoading(false);
      },
      (snapshotError) => {
        setLoading(false);
        if (snapshotError.code === "permission-denied") {
          setAccessDenied(true);
        } else {
          setError(snapshotError.message);
        }
      },
    );

    return unsubscribe;
  }, []);

  const { totals, positions, balances } = useMemo(() => computeFundState(entries), [entries]);

  const handleSave = async (draft: FundEntryDraft) => {
    setSaving(true);
    setError(null);
    try {
      const uid = auth.currentUser?.uid ?? "";
      const payload = {
        type: draft.type,
        amount: draft.amount,
        date: Timestamp.fromDate(draft.date),
        partnerId: draft.partnerId,
        category: draft.category,
        note: draft.note,
      };

      if (editing) {
        await updateDoc(doc(db, FUND_ENTRIES, editing.id), {
          ...payload,
          voided: editing.voided,
          updatedAt: serverTimestamp(),
          updatedByUid: uid,
        });
      } else {
        await addDoc(collection(db, FUND_ENTRIES), {
          ...payload,
          voided: false,
          createdAt: serverTimestamp(),
          createdByUid: uid,
        });
      }

      setDialogOpen(false);
      setEditing(null);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save the entry.");
    } finally {
      setSaving(false);
    }
  };

  // Entries are cancelled rather than deleted, so the history of a money record stays intact.
  const setVoided = async (entry: FundEntry, voided: boolean) => {
    setError(null);
    try {
      await updateDoc(doc(db, FUND_ENTRIES, entry.id), {
        voided,
        updatedAt: serverTimestamp(),
        updatedByUid: auth.currentUser?.uid ?? "",
      });
    } catch (voidError) {
      setError(voidError instanceof Error ? voidError.message : "Could not update the entry.");
    }
  };

  const handleVoid = (entry: FundEntry) => {
    if (!window.confirm(`Cancel this ${formatINR(entry.amount)} entry? It stays in the history but is left out of every total.`)) {
      return;
    }
    void setVoided(entry, true);
  };

  if (accessDenied) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6">
        <div className="flex items-start gap-3">
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <h3 className="font-bold">The database is refusing to open the partner fund</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Usually this means the security rules have not been published yet. Paste
              <code className="mx-1 rounded bg-background px-1.5 py-0.5 text-xs">firestore.rules</code>
              into Firebase console → Firestore → Rules → Publish, then reload this page.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              If the rules are already live, check that you are signed in as a full admin rather than a team member — the
              partner fund is closed to members.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
            <Wallet className="h-5 w-5 text-primary" />
            Partner Fund
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            What each partner put in, what the company spent, and what it still owes them. Costs and income are split equally three ways.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 sm:w-auto sm:self-start"
        >
          <Plus className="h-4 w-4" />
          Add entry
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading the ledger…</p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <SummaryCard
              label="Company funds"
              value={formatINR(totals.companyBalance)}
              hint="Money in the company account"
              tone={totals.companyBalance < 0 ? "negative" : "default"}
            />
            <SummaryCard
              label="Total spent"
              value={formatINR(totals.totalCosts)}
              hint={`${formatINR(totals.costsPaidFromPockets)} from partners' pockets`}
            />
            <SummaryCard
              label={totals.profitOrLoss < 0 ? "Loss so far" : "Profit so far"}
              value={formatINR(Math.abs(totals.profitOrLoss))}
              hint={`Income ${formatINR(totals.totalIncome)} − costs ${formatINR(totals.totalCosts)}`}
              tone={totals.profitOrLoss < 0 ? "negative" : "positive"}
            />
            <SummaryCard
              label="Owed to partners"
              value={formatINR(totals.owedToPartners)}
              hint={totals.owedByPartners > 0 ? `${formatINR(totals.owedByPartners)} owed back by partners` : "Nobody owes the company"}
              tone={totals.owedToPartners > 0 ? "negative" : "default"}
            />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {positions.map((position) => {
              const settled = position.net === 0;
              const owedToThem = position.net > 0;
              return (
                <div key={position.id} className="rounded-xl border border-border bg-background p-4 sm:p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-lg font-bold">{position.name}</h3>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                        settled
                          ? "border-border text-muted-foreground"
                          : owedToThem
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"
                      }`}
                    >
                      {settled ? "Settled" : owedToThem ? "Company owes" : "Owes company"}
                    </span>
                  </div>

                  <p
                    data-testid="partner-net"
                    className={`mt-2 break-words text-2xl font-bold tabular-nums sm:text-3xl ${
                      settled ? "" : owedToThem ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {formatINR(Math.abs(position.net))}
                  </p>

                  <dl className="mt-4 space-y-1.5 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Paid from pocket</dt>
                      <dd className="tabular-nums">{formatINR(position.paidFromPocket)}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Put into company</dt>
                      <dd className="tabular-nums">{formatINR(position.contributed)}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Received back</dt>
                      <dd className="tabular-nums">{withMinus(position.receivedBack)}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Share of costs (⅓)</dt>
                      <dd className="tabular-nums">{withMinus(position.shareOfCosts)}</dd>
                    </div>
                    {position.shareOfIncome > 0 && (
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted-foreground">Share of income (⅓)</dt>
                        <dd className="tabular-nums">+{formatINR(position.shareOfIncome)}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              );
            })}
          </div>

          {totals.unallocatedFunds > 0 && (
            <p className="mt-4 text-sm text-muted-foreground">
              {formatINR(totals.unallocatedFunds)} of the company funds was added without naming a partner, so it is not owed to anyone.
            </p>
          )}

          {!balances && (
            <p className="mt-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              The partner positions do not add up to the company funds. Please report this — it means a calculation bug, not a data problem.
            </p>
          )}

          <div className="mt-8">
            <h3 className="text-base font-bold sm:text-lg">Ledger</h3>
            <p className="mb-4 mt-1 text-sm text-muted-foreground">Every entry behind the figures above.</p>
            <FundLedgerTable
              entries={entries}
              onEdit={(entry) => {
                setEditing(entry);
                setDialogOpen(true);
              }}
              onVoid={handleVoid}
              onRestore={(entry) => void setVoided(entry, false)}
            />
          </div>
        </>
      )}

      <FundEntryDialog
        open={dialogOpen}
        editing={editing}
        saving={saving}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
};

export default PartnerFundPanel;
