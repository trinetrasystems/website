import { describe, expect, it } from "vitest";
import { Timestamp } from "firebase/firestore";
import {
  addCycle,
  balanceDue,
  customerPlanFromUserDoc,
  describeCycle,
  emptyPlanForm,
  endOfDay,
  planFormFromDocs,
  planFormToBillingFields,
  planFormToUserFields,
  validatePlanForm,
  type PlanFormValues,
} from "./userPlan";

const form = (patch: Partial<PlanFormValues> = {}): PlanFormValues => ({
  ...emptyPlanForm(),
  companyName: "Acme Foods",
  cameraCount: "16",
  jetsonCount: "2",
  startDate: "2026-11-01",
  endDate: "2027-10-31",
  planCost: "120000",
  amountPaid: "50000",
  notes: "Gate + warehouse",
  ...patch,
});

describe("addCycle", () => {
  it("ends the day before the next period starts", () => {
    expect(addCycle("2026-11-01", 1, "years")).toBe("2027-10-31");
    expect(addCycle("2026-11-01", 6, "months")).toBe("2027-04-30");
    expect(addCycle("2026-11-01", 1, "months")).toBe("2026-11-30");
  });
  it("is month-end safe", () => {
    expect(addCycle("2027-01-31", 1, "months")).toBe("2027-02-27");
    expect(addCycle("2028-01-31", 1, "months")).toBe("2028-02-28"); // leap year: 29 Feb is the next start
  });
  it("returns empty for invalid input", () => {
    expect(addCycle("", 1, "years")).toBe("");
    expect(addCycle("2026-11-01", 0, "years")).toBe("");
  });
});

describe("money", () => {
  it("computes balance and never goes negative", () => {
    expect(balanceDue("120000", "50000")).toBe(70000);
    expect(balanceDue("1000", "1000")).toBe(0);
    expect(balanceDue("1000", "1500")).toBe(0);
    expect(balanceDue("", "")).toBe(0);
    expect(balanceDue("999.99", "0.49")).toBe(999.5);
  });
});

describe("validatePlanForm", () => {
  it("accepts a complete subscription", () => {
    expect(validatePlanForm(form())).toBeNull();
  });
  it("requires company name", () => {
    expect(validatePlanForm(form({ companyName: "  " }))).toMatch(/Company name/);
  });
  it("rejects non-integer counts", () => {
    expect(validatePlanForm(form({ cameraCount: "2.5" }))).toMatch(/cameras/);
    expect(validatePlanForm(form({ jetsonCount: "-1" }))).toMatch(/Jetsons/);
  });
  it("rejects end before start and missing end", () => {
    expect(validatePlanForm(form({ endDate: "2026-10-01" }))).toMatch(/before the start/);
    expect(validatePlanForm(form({ endDate: "" }))).toMatch(/end date is required/);
  });
  it("rejects overpayment and negative amounts", () => {
    expect(validatePlanForm(form({ amountPaid: "200000" }))).toMatch(/more than the plan cost/);
    expect(validatePlanForm(form({ planCost: "-5" }))).toMatch(/positive/);
    expect(validatePlanForm(form({ depositAmount: "-1" }))).toMatch(/Security deposit must be a positive amount/);
  });
  it("validates the maintenance period for lifetime plans", () => {
    const lifetime = form({ planType: "lifetime", maintenanceEndDate: "", endDate: "" });
    expect(validatePlanForm(lifetime)).toMatch(/Maintenance end date/);
    expect(validatePlanForm({ ...lifetime, maintenanceEndDate: "2027-10-31" })).toBeNull();
  });
});

describe("planFormToUserFields / planFormToBillingFields", () => {
  it("keeps money, Jetsons and notes OUT of the customer-readable user doc", () => {
    const fields = planFormToUserFields(form()) as Record<string, unknown>;
    for (const key of ["planCost", "amountPaid", "maintenanceCost", "jetsonCount", "notes"]) {
      expect(fields).not.toHaveProperty(key);
    }
    expect(fields.companyName).toBe("Acme Foods");
    expect(fields.cameraCount).toBe(16);
    expect(fields.planType).toBe("subscription");
    expect(fields.softwareLifetime).toBe(false);
    expect((fields.softwareValidFrom as Timestamp).toDate()).toEqual(new Date(2026, 10, 1));
    expect((fields.softwareValidUntil as Timestamp).toDate()).toEqual(endOfDay("2027-10-31"));
    expect(fields.softwareValidityValue).toBe(1);
    expect(fields.softwareValidityUnit).toBe("years");
    expect(fields.maintenanceValidUntil).toBeNull();
  });

  it("maps a lifetime solution to lifetime software + maintenance period", () => {
    const fields = planFormToUserFields(
      form({
        planType: "lifetime",
        maintenanceCycleValue: "6",
        maintenanceCycleUnit: "months",
        maintenanceStartDate: "2026-11-01",
        maintenanceEndDate: "2027-04-30",
      })
    );
    expect(fields.softwareLifetime).toBe(true);
    expect(fields.softwareValidUntil).toBeNull();
    expect(fields.softwareValidityUnit).toBe("lifetime");
    expect(fields.maintenanceValidUntil!.toDate()).toEqual(endOfDay("2027-04-30"));
    expect(fields.maintenanceValidityValue).toBe(6);
    expect(fields.maintenanceValidityUnit).toBe("months");
  });

  it("produces billing fields as numbers", () => {
    expect(planFormToBillingFields(form())).toEqual({
      planCost: 120000,
      amountPaid: 50000,
      maintenanceCost: null,
      depositAmount: null,
      depositRefunded: false,
      jetsonCount: 2,
      notes: "Gate + warehouse",
    });
    expect(planFormToBillingFields(form({ depositAmount: "25000", depositRefunded: true }))).toMatchObject({
      depositAmount: 25000,
      depositRefunded: true,
    });
    // "Refunded" without an amount is meaningless — stored as false.
    expect(planFormToBillingFields(form({ depositAmount: "", depositRefunded: true })).depositRefunded).toBe(false);
    expect(planFormToBillingFields(form({ planType: "lifetime", maintenanceCost: "8000" })).maintenanceCost).toBe(8000);
    expect(planFormToBillingFields(form({ planCost: "", amountPaid: "", jetsonCount: "" }))).toMatchObject({
      planCost: null,
      amountPaid: null,
      jetsonCount: null,
    });
  });
});

describe("round trip", () => {
  it("planFormFromDocs restores what was saved", () => {
    const original = form({ cycleValue: "6", cycleUnit: "months", endDate: "2027-04-30", depositAmount: "10000", depositRefunded: false });
    const userDoc = planFormToUserFields(original);
    const billingDoc = planFormToBillingFields(original);
    const restored = planFormFromDocs(userDoc, billingDoc);
    expect(restored).toMatchObject({
      companyName: "Acme Foods",
      cameraCount: "16",
      jetsonCount: "2",
      planType: "subscription",
      cycleValue: "6",
      cycleUnit: "months",
      startDate: "2026-11-01",
      endDate: "2027-04-30",
      planCost: "120000",
      amountPaid: "50000",
      depositAmount: "10000",
      depositRefunded: false,
      notes: "Gate + warehouse",
    });
  });

  it("reads legacy profiles that only had validUntil / softwareLifetime", () => {
    const legacy = planFormFromDocs(
      { validUntil: Timestamp.fromDate(new Date(2027, 0, 15, 12)), softwareValidityValue: 6, softwareValidityUnit: "months" },
      null
    );
    expect(legacy.planType).toBe("subscription");
    expect(legacy.endDate).toBe("2027-01-15");
    expect(legacy.cycleValue).toBe("6");
    expect(planFormFromDocs({ softwareLifetime: true, softwareValidityUnit: "lifetime" }, null).planType).toBe("lifetime");
  });
});

describe("customerPlanFromUserDoc", () => {
  it("exposes plan info only", () => {
    const plan = customerPlanFromUserDoc({ ...planFormToUserFields(form()), planCost: 1, notes: "secret" });
    expect(plan).not.toHaveProperty("planCost");
    expect(plan).not.toHaveProperty("notes");
    expect(plan.companyName).toBe("Acme Foods");
    expect(plan.cameraCount).toBe(16);
    expect(plan.softwareCycle).toBe("every year");
  });
  it("describes cycles", () => {
    expect(describeCycle(3, "months")).toBe("every 3 months");
    expect(describeCycle(2, "years")).toBe("every 2 years");
    expect(describeCycle(0, "years")).toBe("");
  });
});
