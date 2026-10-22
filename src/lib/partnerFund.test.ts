import { describe, expect, it } from "vitest";
import {
  computeFundState,
  computeFundTotals,
  computePartnerPositions,
  formatINR,
  splitEqually,
  toPaise,
  type FundEntry,
  type PartnerId,
} from "./partnerFund";

const rupees = (value: number) => value * 100;

let nextId = 0;
const entry = (
  type: FundEntry["type"],
  amountInRupees: number,
  partnerId: PartnerId | null = null,
  overrides: Partial<FundEntry> = {},
): FundEntry => ({
  id: `e${(nextId += 1)}`,
  type,
  amount: rupees(amountInRupees),
  date: new Date("2026-01-01"),
  partnerId,
  category: "",
  note: "",
  voided: false,
  ...overrides,
});

const positionOf = (entries: FundEntry[], id: PartnerId) =>
  computePartnerPositions(entries).find((position) => position.id === id)!;

describe("splitEqually", () => {
  it("splits evenly when it divides cleanly", () => {
    expect(splitEqually(900, 3)).toEqual([300, 300, 300]);
  });

  it("hands leftover paise to the earlier partners and still sums to the total", () => {
    const shares = splitEqually(1000, 3);
    expect(shares).toEqual([334, 333, 333]);
    expect(shares.reduce((a, b) => a + b, 0)).toBe(1000);
  });

  it("never loses a paisa, whatever the amount", () => {
    for (let amount = 0; amount < 400; amount += 1) {
      expect(splitEqually(amount, 3).reduce((a, b) => a + b, 0)).toBe(amount);
    }
  });
});

describe("partner positions", () => {
  it("works out who is owed what when partners pay from their own pockets", () => {
    // Yash pays 30,000 and Bhagya 15,000 — 45,000 of cost, 15,000 each.
    const entries = [entry("expense", 30000, "yash"), entry("expense", 15000, "bhagya")];

    expect(positionOf(entries, "yash").net).toBe(rupees(15000));
    expect(positionOf(entries, "bhagya").net).toBe(0);
    expect(positionOf(entries, "pratik").net).toBe(rupees(-15000));
  });

  it("clears the debt once the company pays the partner back", () => {
    const entries = [
      entry("expense", 30000, "yash"),
      entry("expense", 15000, "bhagya"),
      entry("contribution", 15000, "pratik"),
      entry("payout", 15000, "yash"),
    ];

    expect(positionOf(entries, "yash").net).toBe(0);
    expect(positionOf(entries, "pratik").net).toBe(0);
    expect(computeFundTotals(entries).companyBalance).toBe(0);
  });

  it("shares income equally on top of what each partner put in", () => {
    const entries = [entry("expense", 30000, "yash"), entry("income", 90000)];
    const yash = positionOf(entries, "yash");

    expect(yash.shareOfIncome).toBe(rupees(30000));
    expect(yash.shareOfCosts).toBe(rupees(10000));
    expect(yash.net).toBe(rupees(30000 - 10000 + 30000));
    expect(positionOf(entries, "pratik").net).toBe(rupees(20000));
  });

  it("leaves a partner owing money when they take out more than they put in", () => {
    const entries = [entry("contribution", 10000, "bhagya"), entry("payout", 25000, "bhagya")];
    expect(positionOf(entries, "bhagya").net).toBe(rupees(-15000));
  });

  it("ignores voided entries", () => {
    const entries = [
      entry("expense", 30000, "yash"),
      entry("expense", 9000000, "yash", { voided: true, note: "typo" }),
    ];
    expect(positionOf(entries, "yash").net).toBe(rupees(20000));
    expect(computeFundTotals(entries).totalCosts).toBe(rupees(30000));
  });
});

describe("company totals", () => {
  it("tracks the balance through money in, costs and payouts", () => {
    const entries = [
      entry("contribution", 100000, null, { note: "opening balance" }),
      entry("contribution", 50000, "pratik"),
      entry("income", 20000),
      entry("expense", 30000, null), // paid from the company account
      entry("expense", 12000, "yash"), // paid from a pocket: company account untouched
      entry("payout", 8000, "yash"),
    ];
    const totals = computeFundTotals(entries);

    expect(totals.companyBalance).toBe(rupees(100000 + 50000 + 20000 - 30000 - 8000));
    expect(totals.totalCosts).toBe(rupees(42000));
    expect(totals.costsPaidFromPockets).toBe(rupees(12000));
    expect(totals.unallocatedFunds).toBe(rupees(100000));
    expect(totals.profitOrLoss).toBe(rupees(20000 - 42000));
  });

  it("separates what the company owes from what partners owe it", () => {
    const entries = [entry("expense", 30000, "yash")];
    const totals = computeFundTotals(entries);

    expect(totals.owedToPartners).toBe(rupees(20000));
    expect(totals.owedByPartners).toBe(rupees(20000));
  });
});

describe("the books always balance", () => {
  // Partner positions plus company funds belonging to no partner must equal the
  // money actually in the account. Any maths bug breaks this.
  const scenarios: Record<string, FundEntry[]> = {
    empty: [],
    "pockets only": [entry("expense", 30000, "yash"), entry("expense", 15000, "bhagya")],
    "amounts that do not divide by three": [
      entry("expense", 100, "yash"),
      entry("income", 1000),
      entry("expense", 1, "pratik"),
    ],
    "every kind of entry": [
      entry("contribution", 100000, null),
      entry("contribution", 50000, "pratik"),
      entry("contribution", 25000, "bhagya"),
      entry("income", 20000),
      entry("expense", 30000, null),
      entry("expense", 12000, "yash"),
      entry("payout", 8000, "yash"),
      entry("payout", 1234.56, "bhagya"),
      entry("expense", 999.99, "pratik"),
      entry("income", 777.77),
    ],
    "with voided entries": [
      entry("expense", 5000, "yash"),
      entry("payout", 5000, "yash", { voided: true }),
      entry("income", 1234.56, null, { voided: true }),
    ],
  };

  for (const [name, entries] of Object.entries(scenarios)) {
    it(name, () => {
      const state = computeFundState(entries);
      const positionsTotal = state.positions.reduce((total, position) => total + position.net, 0);

      expect(positionsTotal + state.totals.unallocatedFunds).toBe(state.totals.companyBalance);
      expect(state.balances).toBe(true);
    });
  }

  it("keeps every amount a whole number of paise", () => {
    const entries = [entry("expense", 100, "yash"), entry("income", 1000)];
    for (const position of computePartnerPositions(entries)) {
      expect(Number.isInteger(position.net)).toBe(true);
      expect(Number.isInteger(position.shareOfCosts)).toBe(true);
    }
  });
});

describe("money conversion and formatting", () => {
  it("turns typed rupees into whole paise", () => {
    expect(toPaise("1250.50")).toBe(125050);
    expect(toPaise("₹1,250")).toBe(125000);
    expect(toPaise(0.1 + 0.2)).toBe(30); // no floating point drift
    expect(Number.isNaN(toPaise("abc"))).toBe(true);
  });

  it("formats in Indian style, hiding empty decimals", () => {
    expect(formatINR(rupees(150000)).replace(/ /g, " ")).toBe("₹1,50,000");
    expect(formatINR(125050).replace(/ /g, " ")).toBe("₹1,250.50");
  });
});
