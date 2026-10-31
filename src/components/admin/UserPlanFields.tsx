import { Building2, Camera, Cpu, IndianRupee, Lock, PiggyBank, StickyNote } from "lucide-react";
import {
  addCycle,
  balanceDue,
  formatRupees,
  parseAmount,
  type CycleUnit,
  type PlanFormValues,
  type PlanType,
} from "@/lib/userPlan";

type Props = {
  value: PlanFormValues;
  onChange: (next: PlanFormValues) => void;
  idPrefix: string;
};

const inputClass =
  "w-full rounded-lg border border-border bg-background px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50";

const Field = ({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <label htmlFor={id} className="text-sm font-medium">
      {label}
    </label>
    {children}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

/**
 * Company, hardware, plan, validity, pricing and notes inputs for a customer
 * account. Used by both Create User and Edit User. Pricing, Jetsons and notes
 * are marked "admin only" — they are saved to userBilling and never reach the
 * customer's dashboard.
 */
const UserPlanFields = ({ value, onChange, idPrefix }: Props) => {
  const set = (patch: Partial<PlanFormValues>) => onChange({ ...value, ...patch });
  const id = (name: string) => `${idPrefix}-${name}`;
  const lifetime = value.planType === "lifetime";

  // Changing the start date or the renewal duration re-derives the end date;
  // the admin can still type a different end date afterwards.
  const updatePeriod = (
    kind: "subscription" | "maintenance",
    patch: { start?: string; cycleValue?: string; cycleUnit?: CycleUnit }
  ) => {
    if (kind === "subscription") {
      const start = patch.start ?? value.startDate;
      const cycleValue = patch.cycleValue ?? value.cycleValue;
      const cycleUnit = patch.cycleUnit ?? value.cycleUnit;
      const derived = addCycle(start, Number(cycleValue), cycleUnit);
      set({ startDate: start, cycleValue, cycleUnit, endDate: derived || value.endDate });
    } else {
      const start = patch.start ?? value.maintenanceStartDate;
      const cycleValue = patch.cycleValue ?? value.maintenanceCycleValue;
      const cycleUnit = patch.cycleUnit ?? value.maintenanceCycleUnit;
      const derived = addCycle(start, Number(cycleValue), cycleUnit);
      set({
        maintenanceStartDate: start,
        maintenanceCycleValue: cycleValue,
        maintenanceCycleUnit: cycleUnit,
        maintenanceEndDate: derived || value.maintenanceEndDate,
      });
    }
  };

  const cost = parseAmount(value.planCost || "0");
  const paid = parseAmount(value.amountPaid || "0");
  const due = balanceDue(value.planCost, value.amountPaid);
  const overpaid = Number.isFinite(cost) && Number.isFinite(paid) && paid > cost;

  const periodLabel = lifetime ? "Maintenance" : "Subscription";
  const periodKind = lifetime ? "maintenance" : "subscription";
  const cycleValue = lifetime ? value.maintenanceCycleValue : value.cycleValue;
  const cycleUnit = lifetime ? value.maintenanceCycleUnit : value.cycleUnit;
  const startDate = lifetime ? value.maintenanceStartDate : value.startDate;
  const endDate = lifetime ? value.maintenanceEndDate : value.endDate;

  return (
    <div className="space-y-5" data-testid={`${idPrefix}-plan-fields`}>
      {/* Company & hardware */}
      <div className="rounded-xl border border-border bg-secondary/10 p-4 space-y-4">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Building2 className="h-4 w-4 text-primary" /> Company &amp; Installation
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <Field id={id("company")} label="Company Name *">
            <input
              id={id("company")}
              type="text"
              value={value.companyName}
              onChange={(e) => set({ companyName: e.target.value })}
              className={inputClass}
              placeholder="Customer company"
              maxLength={150}
            />
          </Field>
          <Field id={id("cameras")} label="Number of Cameras">
            <div className="relative">
              <Camera className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id={id("cameras")}
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                value={value.cameraCount}
                onChange={(e) => set({ cameraCount: e.target.value })}
                className={`${inputClass} pl-9`}
                placeholder="e.g. 16"
              />
            </div>
          </Field>
          <Field id={id("jetsons")} label="Number of Jetsons" hint="Admin only — not shown to the user.">
            <div className="relative">
              <Cpu className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id={id("jetsons")}
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                value={value.jetsonCount}
                onChange={(e) => set({ jetsonCount: e.target.value })}
                className={`${inputClass} pl-9`}
                placeholder="e.g. 2"
              />
            </div>
          </Field>
        </div>
      </div>

      {/* Plan & validity */}
      <div className="rounded-xl border border-border bg-secondary/10 p-4 space-y-4">
        <p className="text-sm font-semibold">Plan &amp; Validity</p>
        <div role="radiogroup" aria-label="Plan type" className="grid gap-3 sm:grid-cols-2">
          {(
            [
              { v: "subscription", title: "Subscription", desc: "Renews every chosen duration" },
              { v: "lifetime", title: "Lifetime Solution", desc: "One-time licence + periodic maintenance" },
            ] as { v: PlanType; title: string; desc: string }[]
          ).map((opt) => (
            <label
              key={opt.v}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                value.planType === opt.v ? "border-primary bg-primary/10" : "border-border bg-background hover:bg-secondary/30"
              }`}
            >
              <input
                type="radio"
                name={id("plan-type")}
                value={opt.v}
                checked={value.planType === opt.v}
                onChange={() => set({ planType: opt.v })}
                className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]"
              />
              <span>
                <span className="block text-sm font-semibold">{opt.title}</span>
                <span className="block text-xs text-muted-foreground">{opt.desc}</span>
              </span>
            </label>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Field id={id("cycle")} label={lifetime ? "Maintenance Every" : "Subscription Every"}>
            <div className="flex gap-2">
              <input
                id={id("cycle")}
                type="number"
                min={1}
                step={1}
                value={cycleValue}
                onChange={(e) => updatePeriod(periodKind, { cycleValue: e.target.value })}
                className={inputClass}
                placeholder="e.g. 1"
              />
              <select
                aria-label={`${periodLabel} duration unit`}
                value={cycleUnit}
                onChange={(e) => updatePeriod(periodKind, { cycleUnit: e.target.value as CycleUnit })}
                className="w-32 rounded-lg border border-border bg-background px-3 py-3 outline-none transition-all focus:ring-2 focus:ring-primary/40"
              >
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>
          </Field>
          <Field id={id("start")} label={`${periodLabel} Start Date`}>
            <input
              id={id("start")}
              type="date"
              value={startDate}
              onChange={(e) => updatePeriod(periodKind, { start: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field
            id={id("end")}
            label={`${periodLabel} End Date *`}
            hint="Auto-filled from start + duration; you can change it. A reminder email goes out 7 days before."
          >
            <input
              id={id("end")}
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) =>
                set(lifetime ? { maintenanceEndDate: e.target.value } : { endDate: e.target.value })
              }
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      {/* Pricing — admin only */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.04] p-4 space-y-4">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <IndianRupee className="h-4 w-4 text-amber-600" /> Plan Costing
          <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            <Lock className="h-3 w-3" /> Admin only
          </span>
        </p>
        <div className={`grid gap-4 ${lifetime ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
          <Field id={id("cost")} label={lifetime ? "Plan Cost (one-time) ₹" : "Plan Cost ₹"}>
            <input
              id={id("cost")}
              type="number"
              min={0}
              step="0.01"
              value={value.planCost}
              onChange={(e) => set({ planCost: e.target.value })}
              className={inputClass}
              placeholder="0"
            />
          </Field>
          <Field id={id("paid")} label="Amount Received ₹">
            <input
              id={id("paid")}
              type="number"
              min={0}
              step="0.01"
              value={value.amountPaid}
              onChange={(e) => set({ amountPaid: e.target.value })}
              className={inputClass}
              placeholder="0"
            />
          </Field>
          <div className="space-y-2">
            <span className="text-sm font-medium">Balance to Receive</span>
            <div
              data-testid={`${idPrefix}-balance`}
              className={`rounded-lg border px-4 py-3 font-semibold tabular-nums ${
                overpaid
                  ? "border-red-500/40 bg-red-500/10 text-red-600"
                  : due > 0
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                  : "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              }`}
            >
              {overpaid ? "Received exceeds cost" : due > 0 ? formatRupees(due) : "Fully paid"}
            </div>
          </div>
          {lifetime && (
            <Field id={id("maint-cost")} label="Maintenance Charge ₹" hint="Per maintenance period.">
              <input
                id={id("maint-cost")}
                type="number"
                min={0}
                step="0.01"
                value={value.maintenanceCost}
                onChange={(e) => set({ maintenanceCost: e.target.value })}
                className={inputClass}
                placeholder="0"
              />
            </Field>
          )}
        </div>

        {/* Security deposit — separate from the plan cost, so it does not affect the balance. */}
        <div className="grid gap-4 border-t border-amber-500/20 pt-4 md:grid-cols-3">
          <Field id={id("deposit")} label="Security Deposit ₹" hint="Refundable deposit held for this customer. Not included in the balance.">
            <div className="relative">
              <PiggyBank className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id={id("deposit")}
                type="number"
                min={0}
                step="0.01"
                value={value.depositAmount}
                onChange={(e) => set({ depositAmount: e.target.value })}
                className={`${inputClass} pl-9`}
                placeholder="0"
              />
            </div>
          </Field>
          <div className="space-y-2">
            <span className="text-sm font-medium">Deposit Status</span>
            <label
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm transition ${
                value.depositAmount.trim() === "" ? "cursor-not-allowed border-border opacity-50" : "cursor-pointer border-border bg-background hover:bg-secondary/30"
              }`}
            >
              <input
                id={id("deposit-refunded")}
                type="checkbox"
                checked={value.depositRefunded}
                disabled={value.depositAmount.trim() === ""}
                onChange={(e) => set({ depositRefunded: e.target.checked })}
                className="h-4 w-4 accent-[hsl(var(--primary))]"
              />
              {value.depositRefunded ? "Refunded to customer" : "Held by Trinetra"}
            </label>
          </div>
        </div>
      </div>

      {/* Notes — admin only */}
      <Field id={id("notes")} label="Notes (admin only)" hint="Private record — never shown to the user.">
        <div className="relative">
          <StickyNote className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <textarea
            id={id("notes")}
            value={value.notes}
            onChange={(e) => set({ notes: e.target.value })}
            rows={3}
            maxLength={5000}
            className={`${inputClass} min-h-[88px] resize-y pl-9`}
            placeholder="e.g. Installed at warehouse gate; payment of balance due by month end…"
          />
        </div>
      </Field>
    </div>
  );
};

export default UserPlanFields;
