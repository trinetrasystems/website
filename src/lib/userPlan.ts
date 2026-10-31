// Customer plan & billing model shared by the admin console and the user dashboard.
//
// Storage is split in two on purpose:
//   users/{uid}        — readable by the customer themselves (it powers their
//                        dashboard), so it only holds non-financial plan data:
//                        company, cameras, plan type, renewal cycle, validity dates.
//   userBilling/{uid}  — admin-only (see firestore.rules). Plan cost, amount
//                        received, maintenance charge, Jetson count and private
//                        notes live here, because the Firebase config is public
//                        and anything on users/{uid} is readable by that user.

import { Timestamp } from "firebase/firestore";

export type PlanType = "subscription" | "lifetime";
export type CycleUnit = "months" | "years";

export type PlanFormValues = {
  companyName: string;
  cameraCount: string;
  jetsonCount: string;
  planType: PlanType;
  // Subscription: the plan renews every <cycleValue cycleUnit>; start/end is the current period.
  cycleValue: string;
  cycleUnit: CycleUnit;
  startDate: string; // yyyy-mm-dd
  endDate: string; // yyyy-mm-dd
  // Lifetime solution: maintenance renews every <maintenanceCycle…>.
  maintenanceCycleValue: string;
  maintenanceCycleUnit: CycleUnit;
  maintenanceStartDate: string;
  maintenanceEndDate: string;
  // Money (rupees). Admin-only.
  planCost: string;
  amountPaid: string;
  maintenanceCost: string;
  // Security deposit taken from the customer (refundable; not part of the plan cost).
  depositAmount: string;
  depositRefunded: boolean;
  notes: string;
};

// ---------- date helpers (all dates are local calendar days, yyyy-mm-dd) ----------

const pad = (n: number) => String(n).padStart(2, "0");

export const toDateInput = (date: Date | null | undefined): string =>
  date ? `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` : "";

export const parseDateInput = (value: string): Date | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
};

/** Start of the given calendar day. */
export const startOfDay = (value: string): Date | null => parseDateInput(value);

/** Last millisecond of the given calendar day — a plan "valid until 31 Oct" covers all of 31 Oct. */
export const endOfDay = (value: string): Date | null => {
  const date = parseDateInput(value);
  if (!date) return null;
  date.setHours(23, 59, 59, 999);
  return date;
};

/**
 * End date of a period that starts on `start` and lasts `value` `unit`s.
 * 1 Nov 2026 + 1 year → 31 Oct 2027 (the day before the next period starts).
 * Month-end safe: 31 Jan + 1 month → 28/29 Feb, never 2/3 Mar.
 */
export const addCycle = (start: string, value: number, unit: CycleUnit): string => {
  const date = parseDateInput(start);
  if (!date || !(value > 0)) return "";
  const months = unit === "years" ? value * 12 : value;
  const targetMonthIndex = date.getMonth() + months;
  const target = new Date(date.getFullYear(), targetMonthIndex, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(date.getDate(), lastDay));
  target.setDate(target.getDate() - 1);
  return toDateInput(target);
};

export const todayInput = () => toDateInput(new Date());

export const describeCycle = (value: number | undefined, unit: string | undefined): string => {
  if (!value || value <= 0 || (unit !== "months" && unit !== "years")) return "";
  if (unit === "years") return value === 1 ? "every year" : `every ${value} years`;
  return value === 1 ? "every month" : `every ${value} months`;
};

// ---------- money ----------

export const parseAmount = (value: string): number => {
  const n = Number(String(value ?? "").replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : NaN;
};

/** Amount still to be received. Never negative. */
export const balanceDue = (planCost: string | number, amountPaid: string | number): number => {
  const cost = typeof planCost === "number" ? planCost : parseAmount(planCost || "0");
  const paid = typeof amountPaid === "number" ? amountPaid : parseAmount(amountPaid || "0");
  if (!Number.isFinite(cost) || !Number.isFinite(paid)) return 0;
  return Math.max(0, Math.round((cost - paid) * 100) / 100);
};

export const formatRupees = (value: number): string =>
  `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

// ---------- form <-> Firestore ----------

export const emptyPlanForm = (): PlanFormValues => {
  const start = todayInput();
  return {
    companyName: "",
    cameraCount: "",
    jetsonCount: "",
    planType: "subscription",
    cycleValue: "1",
    cycleUnit: "years",
    startDate: start,
    endDate: addCycle(start, 1, "years"),
    maintenanceCycleValue: "1",
    maintenanceCycleUnit: "years",
    maintenanceStartDate: start,
    maintenanceEndDate: addCycle(start, 1, "years"),
    planCost: "",
    amountPaid: "",
    maintenanceCost: "",
    depositAmount: "",
    depositRefunded: false,
    notes: "",
  };
};

type AnyData = Record<string, any> | null | undefined;

const tsToDate = (value: any): Date | null => (value?.toDate ? value.toDate() : value instanceof Date ? value : null);
const numToInput = (value: any): string => (typeof value === "number" && Number.isFinite(value) ? String(value) : "");
const unitOr = (value: any, fallback: CycleUnit): CycleUnit => (value === "months" || value === "years" ? value : fallback);

/**
 * Build the edit form from a stored user doc and billing doc. Handles legacy
 * profiles created before plans existed (only softwareValidUntil / softwareLifetime).
 */
export const planFormFromDocs = (user: AnyData, billing: AnyData): PlanFormValues => {
  const u = user || {};
  const b = billing || {};
  const lifetime = u.planType ? u.planType === "lifetime" : u.softwareLifetime === true;
  const legacyCycleValue = u.softwareValidityUnit === "lifetime" ? 0 : u.softwareValidityValue;
  const legacyMaintValue = u.maintenanceValidityUnit === "lifetime" ? 0 : u.maintenanceValidityValue;
  return {
    companyName: u.companyName || "",
    cameraCount: numToInput(u.cameraCount),
    jetsonCount: numToInput(b.jetsonCount),
    planType: lifetime ? "lifetime" : "subscription",
    cycleValue: numToInput(legacyCycleValue) || "",
    cycleUnit: unitOr(u.softwareValidityUnit, "years"),
    startDate: toDateInput(tsToDate(u.softwareValidFrom)),
    endDate: toDateInput(tsToDate(u.softwareValidUntil ?? u.validUntil)),
    maintenanceCycleValue: numToInput(legacyMaintValue) || "",
    maintenanceCycleUnit: unitOr(u.maintenanceValidityUnit, "years"),
    maintenanceStartDate: toDateInput(tsToDate(u.maintenanceValidFrom)),
    maintenanceEndDate: toDateInput(tsToDate(u.maintenanceValidUntil)),
    planCost: numToInput(b.planCost),
    amountPaid: numToInput(b.amountPaid),
    maintenanceCost: numToInput(b.maintenanceCost),
    depositAmount: numToInput(b.depositAmount),
    depositRefunded: b.depositRefunded === true,
    notes: b.notes || "",
  };
};

const toTimestamp = (date: Date | null) => (date ? Timestamp.fromDate(date) : null);
const optionalInt = (value: string) => (value.trim() === "" ? null : Math.trunc(Number(value)));
const optionalAmount = (value: string) => (value.trim() === "" ? null : parseAmount(value));

/** Fields written to users/{uid}. Safe for the customer to read — no money, no Jetsons, no notes. */
export const planFormToUserFields = (form: PlanFormValues) => {
  const lifetime = form.planType === "lifetime";
  const cycleValue = Number(form.cycleValue) || 0;
  const maintValue = Number(form.maintenanceCycleValue) || 0;
  return {
    companyName: form.companyName.trim(),
    cameraCount: optionalInt(form.cameraCount),
    planType: form.planType,
    // Software / subscription period
    softwareLifetime: lifetime,
    softwareValidFrom: lifetime ? null : toTimestamp(startOfDay(form.startDate)),
    softwareValidUntil: lifetime ? null : toTimestamp(endOfDay(form.endDate)),
    softwareValidityValue: lifetime ? 0 : cycleValue,
    softwareValidityUnit: lifetime ? "lifetime" : cycleValue > 0 ? form.cycleUnit : "",
    // Maintenance period (lifetime solutions only — a subscription includes maintenance)
    maintenanceLifetime: false,
    maintenanceValidFrom: lifetime ? toTimestamp(startOfDay(form.maintenanceStartDate)) : null,
    maintenanceValidUntil: lifetime ? toTimestamp(endOfDay(form.maintenanceEndDate)) : null,
    maintenanceValidityValue: lifetime ? maintValue : 0,
    maintenanceValidityUnit: lifetime && maintValue > 0 ? form.maintenanceCycleUnit : "",
  };
};

/** Fields written to userBilling/{uid}. Admin-only. */
export const planFormToBillingFields = (form: PlanFormValues) => ({
  planCost: optionalAmount(form.planCost),
  amountPaid: optionalAmount(form.amountPaid),
  maintenanceCost: form.planType === "lifetime" ? optionalAmount(form.maintenanceCost) : null,
  depositAmount: optionalAmount(form.depositAmount),
  depositRefunded: form.depositAmount.trim() !== "" && form.depositRefunded,
  jetsonCount: optionalInt(form.jetsonCount),
  notes: form.notes.trim(),
});

/** Returns a human-readable problem with the form, or null when it is valid. */
export const validatePlanForm = (form: PlanFormValues): string | null => {
  const isWholeNumber = (v: string) => v.trim() === "" || (/^\d+$/.test(v.trim()) && Number(v) <= 100000);
  if (!form.companyName.trim()) return "Company name is required.";
  if (!isWholeNumber(form.cameraCount)) return "Number of cameras must be a whole number.";
  if (!isWholeNumber(form.jetsonCount)) return "Number of Jetsons must be a whole number.";

  const checkPeriod = (label: string, start: string, end: string, cycle: string) => {
    if (cycle.trim() !== "" && !(/^\d+$/.test(cycle.trim()) && Number(cycle) > 0)) {
      return `${label} renewal duration must be a whole number greater than 0.`;
    }
    if (start && !parseDateInput(start)) return `${label} start date is invalid.`;
    if (end && !parseDateInput(end)) return `${label} end date is invalid.`;
    if (!end) return `${label} end date is required.`;
    if (start && end && parseDateInput(end)!.getTime() < parseDateInput(start)!.getTime()) {
      return `${label} end date cannot be before the start date.`;
    }
    return null;
  };
  const periodError =
    form.planType === "subscription"
      ? checkPeriod("Subscription", form.startDate, form.endDate, form.cycleValue)
      : checkPeriod("Maintenance", form.maintenanceStartDate, form.maintenanceEndDate, form.maintenanceCycleValue);
  if (periodError) return periodError;

  const amounts: [string, string][] = [
    ["Plan cost", form.planCost],
    ["Amount received", form.amountPaid],
    ["Maintenance charge", form.planType === "lifetime" ? form.maintenanceCost : ""],
    ["Security deposit", form.depositAmount],
  ];
  for (const [label, value] of amounts) {
    if (value.trim() === "") continue;
    const n = parseAmount(value);
    if (!Number.isFinite(n) || n < 0) return `${label} must be a positive amount.`;
    if (n > 1_000_000_000) return `${label} looks too large.`;
  }
  if (form.amountPaid.trim() !== "" && form.planCost.trim() === "") {
    return "Enter the plan cost before the amount received.";
  }
  if (parseAmount(form.amountPaid || "0") > parseAmount(form.planCost || "0")) {
    return "Amount received cannot be more than the plan cost.";
  }
  if (form.notes.length > 5000) return "Notes are too long (5000 characters max).";
  return null;
};

// ---------- what the customer sees ----------

/** Plan details the user dashboard is allowed to show. Deliberately has no money/Jetson fields. */
export type CustomerPlan = {
  companyName: string;
  cameraCount: number | null;
  planType: PlanType | null;
  softwareValidFrom: Date | null;
  softwareValidUntil: Date | null;
  softwareLifetime: boolean;
  softwareCycle: string;
  maintenanceValidFrom: Date | null;
  maintenanceValidUntil: Date | null;
  maintenanceLifetime: boolean;
  maintenanceCycle: string;
};

export const customerPlanFromUserDoc = (data: AnyData): CustomerPlan => {
  const u = data || {};
  const lifetime = u.planType ? u.planType === "lifetime" : u.softwareLifetime === true;
  return {
    companyName: u.companyName || "",
    cameraCount: typeof u.cameraCount === "number" ? u.cameraCount : null,
    planType: u.planType === "lifetime" || u.planType === "subscription" ? u.planType : null,
    softwareValidFrom: tsToDate(u.softwareValidFrom),
    softwareValidUntil: lifetime ? null : tsToDate(u.softwareValidUntil ?? u.validUntil),
    softwareLifetime: lifetime,
    softwareCycle: describeCycle(u.softwareValidityValue, u.softwareValidityUnit),
    maintenanceValidFrom: tsToDate(u.maintenanceValidFrom),
    maintenanceValidUntil: tsToDate(u.maintenanceValidUntil),
    maintenanceLifetime: u.maintenanceLifetime === true,
    maintenanceCycle: describeCycle(u.maintenanceValidityValue, u.maintenanceValidityUnit),
  };
};

/** Days left until a validity end (ceil), or null for none. Negative once expired. */
export const daysUntil = (date: Date | null | undefined, now = Date.now()): number | null =>
  date ? Math.ceil((date.getTime() - now) / 86_400_000) : null;
