// Partner fund: the money the three partners put into the company, what the
// company spends, and what it still owes each of them.
//
// Every figure shown in the admin console is derived from the ledger by the
// functions below — nothing is stored as a running total, so no number can
// drift out of sync with the entries behind it.
//
// Money is handled in whole paise (integers) everywhere. Rupee decimals exist
// only at the edges: `toPaise` on the way in, `formatINR` on the way out.

export const PARTNERS = [
  { id: "yash", name: "Yash" },
  { id: "bhagya", name: "Bhagya" },
  { id: "pratik", name: "Pratik" },
] as const;

export type PartnerId = (typeof PARTNERS)[number]["id"];

export const PARTNER_IDS = PARTNERS.map((partner) => partner.id) as PartnerId[];

export const isPartnerId = (value: unknown): value is PartnerId =>
  typeof value === "string" && (PARTNER_IDS as string[]).includes(value);

export const partnerName = (id: PartnerId | null) =>
  PARTNERS.find((partner) => partner.id === id)?.name ?? "Company funds";

/**
 * - `expense`      a company cost. `partnerId` is whoever paid it from their own
 *                  pocket, or null when it came out of the company account.
 * - `payout`       the company paying a partner back. Reduces what they are owed.
 * - `contribution` money put into the company account. `partnerId` is the partner
 *                  it came from, or null for company funds not from any partner.
 * - `income`       money received from a client. Always lands in the company account.
 */
export type FundEntryType = "expense" | "payout" | "contribution" | "income";

export type FundEntry = {
  id: string;
  type: FundEntryType;
  /** Whole paise, always positive. The type decides the direction. */
  amount: number;
  date: Date;
  partnerId: PartnerId | null;
  category: string;
  note: string;
  voided: boolean;
};

export type FundTotals = {
  /** Money sitting in the company account. */
  companyBalance: number;
  /** Every company cost, however it was paid. Shared equally between partners. */
  totalCosts: number;
  costsPaidFromPockets: number;
  costsPaidFromCompany: number;
  totalIncome: number;
  /** Contributions that came from a partner (so they are owed it back). */
  partnerContributions: number;
  /** Company funds added that belong to no partner. */
  unallocatedFunds: number;
  totalPaidBackToPartners: number;
  /** Income minus every cost. Negative means the company is running at a loss. */
  profitOrLoss: number;
  owedToPartners: number;
  owedByPartners: number;
};

export type PartnerPosition = {
  id: PartnerId;
  name: string;
  /** Company costs this partner paid out of their own pocket. */
  paidFromPocket: number;
  /** Money this partner put into the company account. */
  contributed: number;
  /** Money the company has already paid back to them. */
  receivedBack: number;
  /** Their third of every company cost. */
  shareOfCosts: number;
  /** Their third of all income. */
  shareOfIncome: number;
  /** Positive: the company owes them. Negative: they owe the company. */
  net: number;
};

export type FundState = {
  totals: FundTotals;
  positions: PartnerPosition[];
  /**
   * The books balance when every partner position plus the company funds that
   * belong to no partner add up to the money actually in the account. If this is
   * ever false there is a bug in the maths, not in the data.
   */
  balances: boolean;
};

/**
 * Splits `amount` into `parts` whole-paise shares that add back up to exactly
 * `amount`. A leftover paisa goes to the earlier partners, in a fixed order, so
 * the split is stable rather than drifting between renders.
 */
export const splitEqually = (amount: number, parts: number): number[] => {
  if (parts <= 0) return [];
  const sign = amount < 0 ? -1 : 1;
  const absolute = Math.abs(amount);
  const base = Math.floor(absolute / parts);
  const remainder = absolute - base * parts;
  return Array.from({ length: parts }, (_, index) => sign * (base + (index < remainder ? 1 : 0)));
};

const liveEntries = (entries: FundEntry[]) => entries.filter((entry) => !entry.voided);

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

export const computeFundTotals = (entries: FundEntry[]): FundTotals => {
  const live = liveEntries(entries);
  const totalOf = (predicate: (entry: FundEntry) => boolean) =>
    sum(live.filter(predicate).map((entry) => entry.amount));

  const costsPaidFromPockets = totalOf((entry) => entry.type === "expense" && entry.partnerId !== null);
  const costsPaidFromCompany = totalOf((entry) => entry.type === "expense" && entry.partnerId === null);
  const totalCosts = costsPaidFromPockets + costsPaidFromCompany;
  const totalIncome = totalOf((entry) => entry.type === "income");
  const partnerContributions = totalOf((entry) => entry.type === "contribution" && entry.partnerId !== null);
  const unallocatedFunds = totalOf((entry) => entry.type === "contribution" && entry.partnerId === null);
  const totalPaidBackToPartners = totalOf((entry) => entry.type === "payout");

  const companyBalance =
    partnerContributions + unallocatedFunds + totalIncome - costsPaidFromCompany - totalPaidBackToPartners;

  const positions = computePartnerPositions(entries);

  return {
    companyBalance,
    totalCosts,
    costsPaidFromPockets,
    costsPaidFromCompany,
    totalIncome,
    partnerContributions,
    unallocatedFunds,
    totalPaidBackToPartners,
    profitOrLoss: totalIncome - totalCosts,
    owedToPartners: sum(positions.filter((p) => p.net > 0).map((p) => p.net)),
    owedByPartners: sum(positions.filter((p) => p.net < 0).map((p) => -p.net)),
  };
};

export const computePartnerPositions = (entries: FundEntry[]): PartnerPosition[] => {
  const live = liveEntries(entries);

  const totalCosts = sum(live.filter((entry) => entry.type === "expense").map((entry) => entry.amount));
  const totalIncome = sum(live.filter((entry) => entry.type === "income").map((entry) => entry.amount));

  const costShares = splitEqually(totalCosts, PARTNERS.length);
  const incomeShares = splitEqually(totalIncome, PARTNERS.length);

  return PARTNERS.map((partner, index) => {
    const byPartner = (type: FundEntryType) =>
      sum(live.filter((entry) => entry.type === type && entry.partnerId === partner.id).map((entry) => entry.amount));

    const paidFromPocket = byPartner("expense");
    const contributed = byPartner("contribution");
    const receivedBack = byPartner("payout");
    const shareOfCosts = costShares[index];
    const shareOfIncome = incomeShares[index];

    return {
      id: partner.id,
      name: partner.name,
      paidFromPocket,
      contributed,
      receivedBack,
      shareOfCosts,
      shareOfIncome,
      net: paidFromPocket + contributed - receivedBack - shareOfCosts + shareOfIncome,
    };
  });
};

export const computeFundState = (entries: FundEntry[]): FundState => {
  const totals = computeFundTotals(entries);
  const positions = computePartnerPositions(entries);
  const positionsTotal = sum(positions.map((position) => position.net));

  return {
    totals,
    positions,
    balances: positionsTotal + totals.unallocatedFunds === totals.companyBalance,
  };
};

/** How one entry moves the company account and that partner's position. */
export const describeEntry = (entry: FundEntry) => {
  switch (entry.type) {
    case "expense":
      return entry.partnerId === null
        ? { label: "Expense", paidBy: "Company funds", companyDelta: -entry.amount, partnerDelta: 0 }
        : { label: "Expense", paidBy: partnerName(entry.partnerId), companyDelta: 0, partnerDelta: entry.amount };
    case "payout":
      return {
        label: "Paid to partner",
        paidBy: "Company funds",
        companyDelta: -entry.amount,
        partnerDelta: -entry.amount,
      };
    case "contribution":
      return entry.partnerId === null
        ? { label: "Money in", paidBy: "Company funds", companyDelta: entry.amount, partnerDelta: 0 }
        : { label: "Money in", paidBy: partnerName(entry.partnerId), companyDelta: entry.amount, partnerDelta: entry.amount };
    case "income":
      return { label: "Client income", paidBy: "Client", companyDelta: entry.amount, partnerDelta: 0 };
  }
};

/** Rupees as typed into a form (e.g. "1,250.50") to whole paise. */
export const toPaise = (rupees: string | number): number => {
  const cleaned = typeof rupees === "string" ? rupees.replace(/[,\s₹]/g, "") : String(rupees);
  const value = Number(cleaned);
  if (!Number.isFinite(value)) return Number.NaN;
  return Math.round(value * 100);
};

export const toRupees = (paise: number): number => paise / 100;

export const formatINR = (paise: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: paise % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(paise / 100);

/** "+₹500" / "-₹500" / "—" for a column showing movement. */
export const formatDelta = (paise: number): string => {
  if (paise === 0) return "—";
  return `${paise > 0 ? "+" : "-"}${formatINR(Math.abs(paise))}`;
};
