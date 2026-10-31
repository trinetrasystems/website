import { FormEvent, memo, useEffect, useMemo, useState, type ReactNode } from "react";
import { MotionConfig, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Building2,
  CalendarCheck2,
  CalendarClock,
  CalendarRange,
  Camera,
  CheckCircle2,
  Clock,
  Cpu,
  ExternalLink,
  Eye,
  Infinity as InfinityIcon,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  Lock,
  LogOut,
  MessageSquareHeart,
  RefreshCw,
  ShieldCheck,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import { updatePassword, type User as FirebaseUser } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import UserTickets from "./UserTickets";
import UserFeedback from "./UserFeedback";
import type { CustomerPlan } from "@/lib/userPlan";

interface UserDashboardProps {
  user: FirebaseUser;
  username: string;
  ipLink: string;
  /** Plan type, validity and cameras only — this component never receives pricing or Jetson data. */
  plan?: CustomerPlan | null;
  onSignOut: () => void;
}

type Tab = "dashboard" | "tickets" | "feedback";
type PeriodStatus = "none" | "lifetime" | "active" | "expiring" | "expired";

const DAY = 86_400_000;
const EXPIRING_SOON_DAYS = 30;

const longDate = (date: Date) => date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
const shortDate = (date: Date) => date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const pad2 = (n: number) => String(n).padStart(2, "0");
const titleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

// Short, delay-free entrance so content is usable immediately. MotionConfig
// below turns it off entirely for users who prefer reduced motion.
const fade = {
  hidden: { opacity: 0, y: 4 },
  visible: () => ({ opacity: 1, y: 0, transition: { duration: 0.18, ease: "easeOut" } }),
};

/**
 * Live D/H/M/S countdown. Owns its own 1-second timer so only these four
 * numbers re-render each second — not the whole dashboard.
 */
const Countdown = memo(({ until, warning }: { until: Date; warning: boolean }) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [until]);
  const remaining = Math.max(0, until.getTime() - now);
  const units = [
    { label: "Days", value: String(Math.floor(remaining / DAY)) },
    { label: "Hrs", value: pad2(Math.floor((remaining % DAY) / 3_600_000)) },
    { label: "Min", value: pad2(Math.floor((remaining % 3_600_000) / 60_000)) },
    { label: "Sec", value: pad2(Math.floor((remaining % 60_000) / 1000)) },
  ];
  return (
    <div className="grid w-full grid-cols-4 gap-2 sm:w-auto sm:shrink-0" role="timer" aria-label="Time remaining">
      {units.map((u) => (
        <div key={u.label} className="rounded-lg border border-border bg-secondary/30 px-1 py-2 text-center sm:w-14">
          <p className={`text-lg font-bold tabular-nums ${warning ? "text-amber-600 dark:text-amber-400" : "text-foreground"}`}>{u.value}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{u.label}</p>
        </div>
      ))}
    </div>
  );
});
Countdown.displayName = "Countdown";

// ---------------------------------------------------------------------------
// Shared building blocks — every panel on the page uses the same card,
// header and tile so the dashboard reads as one system.
// ---------------------------------------------------------------------------

const Card = ({ children, className = "", ...rest }: { children: ReactNode; className?: string; [k: string]: unknown }) => (
  <div className={`rounded-2xl border border-border bg-card shadow-sm ${className}`} {...rest}>
    {children}
  </div>
);

const CardHeader = ({ icon, title, subtitle, action }: { icon: ReactNode; title: string; subtitle?: string; action?: ReactNode }) => (
  <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-4 sm:px-6">
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</div>
      <div className="min-w-0">
        <h3 className="truncate text-base font-semibold leading-tight">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

const Tile = ({ icon, label, value, hint }: { icon: ReactNode; label: string; value: ReactNode; hint?: string }) => (
  <div className="min-w-0 rounded-xl border border-border bg-secondary/30 p-3 sm:p-4">
    <div className="flex items-start gap-1.5 text-[11px] font-semibold uppercase leading-tight tracking-wider text-muted-foreground">
      <span className="mt-px shrink-0 text-primary [&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>
      <span>{label}</span>
    </div>
    <p className="mt-2 truncate text-base font-semibold tabular-nums leading-tight sm:text-lg">{value}</p>
    {hint && <p className="mt-1 text-xs leading-snug text-muted-foreground">{hint}</p>}
  </div>
);

const STATUS_STYLE: Record<PeriodStatus, { label: string; className: string; icon: ReactNode }> = {
  none: { label: "Not set", className: "border-border bg-secondary/50 text-muted-foreground", icon: <Clock className="h-3.5 w-3.5" /> },
  lifetime: { label: "Lifetime", className: "border-primary/30 bg-primary/10 text-primary", icon: <InfinityIcon className="h-3.5 w-3.5" /> },
  active: { label: "Active", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  expiring: { label: "Renewal due soon", className: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  expired: { label: "Expired", className: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
};

const StatusBadge = ({ status }: { status: PeriodStatus }) => {
  const s = STATUS_STYLE[status];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${s.className}`}>
      {s.icon}
      {s.label}
    </span>
  );
};

// ---------------------------------------------------------------------------

const UserDashboard = ({ user, username, ipLink, plan, onSignOut }: UserDashboardProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [nowTick, setNowTick] = useState(() => Date.now());

  // The period that matters to the customer: the subscription itself, or —
  // for a lifetime solution — its maintenance contract.
  const lifetime = plan?.softwareLifetime === true;
  const period = lifetime
    ? { name: "Maintenance", from: plan?.maintenanceValidFrom ?? null, until: plan?.maintenanceValidUntil ?? null, cycle: plan?.maintenanceCycle || "" }
    : { name: "Subscription", from: plan?.softwareValidFrom ?? null, until: plan?.softwareValidUntil ?? null, cycle: plan?.softwareCycle || "" };

  // Status and the progress bar only need minute precision; the per-second
  // countdown runs inside <Countdown>.
  useEffect(() => {
    if (!period.until) return;
    const id = setInterval(() => setNowTick(Date.now()), 60_000);
    return () => clearInterval(id);
  }, [period.until]);

  const timing = useMemo(() => {
    if (!period.until) return null;
    const remaining = period.until.getTime() - nowTick;
    const total = period.from ? period.until.getTime() - period.from.getTime() : 0;
    const used = total > 0 ? Math.min(100, Math.max(0, ((nowTick - period.from!.getTime()) / total) * 100)) : null;
    return { remaining, used };
  }, [period.from, period.until, nowTick]);

  const status: PeriodStatus = !timing
    ? lifetime
      ? "lifetime"
      : "none"
    : timing.remaining <= 0
    ? "expired"
    : timing.remaining <= EXPIRING_SOON_DAYS * DAY
    ? "expiring"
    : "active";

  const displayName = titleCase((username || "User").replace(/\d+$/, "") || username || "User");
  const dashboardUrl = ipLink ? (ipLink.startsWith("http") ? ipLink : `http://${ipLink}`) : null;
  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";
  const planLabel = lifetime || plan?.planType === "lifetime" ? "Lifetime Solution" : plan?.planType === "subscription" ? "Subscription" : "—";
  const barTone = status === "expired" ? "bg-red-500" : status === "expiring" ? "bg-amber-500" : "bg-primary";

  const handlePasswordChange = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password should be at least 6 characters.");
      return;
    }
    setUpdatingPassword(true);
    try {
      await updatePassword(user, newPassword);
      await setDoc(
        doc(db, "userPasswords", user.uid),
        { uid: user.uid, username: username || user.email || "", password: newPassword, updatedAt: serverTimestamp() },
        { merge: true }
      );
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
      toast.success("Password updated successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not update password.";
      toast.error(message);
      if (message.includes("requires-recent-login")) toast.info("Please logout and login again to change your password.");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const tabs: { id: Tab; label: string; short?: string; icon: ReactNode }[] = [
    { id: "dashboard", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: "tickets", label: "Support Tickets", short: "Tickets", icon: <LifeBuoy className="h-4 w-4" /> },
    { id: "feedback", label: "Feedback", icon: <MessageSquareHeart className="h-4 w-4" /> },
  ];

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/30";

  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen bg-background text-foreground">
      <div className="px-4 pb-12 pt-24 md:px-8 lg:pt-28">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* ---------- Header + tabs ---------- */}
          <motion.div variants={fade} initial="hidden" animate="visible" custom={0}>
            <Card className="overflow-hidden">
              <div className="flex flex-col gap-5 p-4 sm:p-6 md:flex-row md:items-center md:justify-between md:p-7">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-xl font-bold text-primary">
                    {displayName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">{greeting},</p>
                    <h1 className="truncate text-2xl font-bold tracking-tight md:text-3xl">{displayName}</h1>
                    {plan?.companyName && (
                      <p className="mt-1 flex items-center gap-1.5 truncate text-sm font-medium text-muted-foreground" data-testid="user-company">
                        <Building2 className="h-4 w-4 shrink-0" />
                        {plan.companyName}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex w-full items-center gap-2 md:w-auto">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                      dashboardUrl
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${dashboardUrl ? "animate-pulse bg-emerald-500" : "bg-amber-500"}`} />
                    {dashboardUrl ? "System online" : "Setup in progress"}
                  </span>
                  <Link
                    to="/"
                    aria-label="Home"
                    className="ml-auto inline-flex items-center gap-2 sm:ml-0 rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary/50 hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Home</span>
                  </Link>
                  <button
                    type="button"
                    onClick={onSignOut}
                    aria-label="Logout"
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-muted-foreground transition hover:border-red-500/30 hover:bg-red-500/5 hover:text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              </div>

              <div className="border-t border-border bg-secondary/20 px-3 md:px-5">
                <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Dashboard sections">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      aria-current={activeTab === tab.id ? "page" : undefined}
                      className={`inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-2.5 py-3 text-sm font-semibold transition sm:px-3 ${
                        activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab.icon}
                      {tab.short ? (
                        <>
                          <span className="sm:hidden">{tab.short}</span>
                          <span className="hidden sm:inline">{tab.label}</span>
                        </>
                      ) : (
                        tab.label
                      )}
                    </button>
                  ))}
                </nav>
              </div>
            </Card>
          </motion.div>

          {activeTab === "dashboard" && (
            <>
              {/* ---------- Plan & validity ---------- */}
              <motion.div variants={fade} initial="hidden" animate="visible" custom={1}>
                <Card data-testid="user-validity">
                  <CardHeader
                    icon={<CalendarClock className="h-5 w-5" />}
                    title="Plan & Validity"
                    subtitle={lifetime ? "Lifetime licence with maintenance contract" : "Your current subscription period"}
                    action={<StatusBadge status={status} />}
                  />
                  <div className="space-y-5 p-4 sm:p-6">
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4" data-testid="user-plan-summary">
                      <Tile
                        icon={lifetime ? <InfinityIcon /> : <RefreshCw />}
                        label="Plan"
                        value={planLabel}
                        hint={lifetime ? "Software licence never expires" : period.cycle ? `Renews ${period.cycle}` : undefined}
                      />
                      <Tile
                        icon={<Camera />}
                        label="Cameras"
                        value={plan?.cameraCount ?? "—"}
                        hint={plan?.cameraCount != null ? "Covered by your plan" : undefined}
                      />
                      <Tile icon={<CalendarRange />} label="Start date" value={period.from ? shortDate(period.from) : "—"} />
                      <Tile icon={<CalendarCheck2 />} label="End date" value={period.until ? shortDate(period.until) : "—"} />
                    </div>

                    {timing ? (
                      <div className="rounded-xl border border-border p-4 md:p-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold">{status === "expired" ? `${period.name} expired` : `${period.name} validity`}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {period.from ? `Valid ${longDate(period.from)} → ${longDate(period.until!)}` : `Valid until ${longDate(period.until!)}`}
                              {period.cycle ? ` · Renews ${period.cycle}` : ""}
                            </p>
                            {timing.used !== null && (
                              <div className="mt-3">
                                <div
                                  className="h-2 w-full overflow-hidden rounded-full bg-secondary"
                                  role="progressbar"
                                  aria-valuenow={Math.round(timing.used)}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                  aria-label="Share of the current period used"
                                >
                                  <div className={`h-full rounded-full transition-all ${barTone}`} style={{ width: `${timing.used}%` }} />
                                </div>
                                <p className="mt-1.5 text-xs text-muted-foreground">{Math.round(timing.used)}% of the current period used</p>
                              </div>
                            )}
                          </div>
                          {status !== "expired" && <Countdown until={period.until!} warning={status === "expiring"} />}
                        </div>
                        {(status === "expired" || status === "expiring") && (
                          <div
                            className={`mt-4 flex flex-col gap-3 rounded-lg border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between ${
                              status === "expired" ? "border-red-500/30 bg-red-500/5" : "border-amber-500/30 bg-amber-500/5"
                            }`}
                          >
                            <p>
                              {status === "expired"
                                ? `Your ${period.name.toLowerCase()} expired on ${longDate(period.until!)}. Please contact us to renew.`
                                : `Your ${period.name.toLowerCase()} ends on ${longDate(period.until!)}. Our team will contact you about renewal.`}
                            </p>
                            <button
                              type="button"
                              onClick={() => setActiveTab("tickets")}
                              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold transition hover:bg-secondary/50"
                            >
                              <LifeBuoy className="h-4 w-4" />
                              Contact support
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
                        {lifetime
                          ? "Your software licence never expires. Maintenance dates will appear here once scheduled."
                          : "Validity dates will appear here once your plan is activated."}
                      </p>
                    )}
                  </div>
                </Card>
              </motion.div>

              {/* ---------- Live surveillance + account ---------- */}
              <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
                <motion.div variants={fade} initial="hidden" animate="visible" custom={2} className="min-w-0 lg:col-span-2">
                  <Card className="flex h-full flex-col">
                    <CardHeader
                      icon={<Camera className="h-5 w-5" />}
                      title="Live Surveillance"
                      subtitle="Real-time camera feeds and AI alerts"
                      action={
                        dashboardUrl ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                            Live
                          </span>
                        ) : undefined
                      }
                    />
                    <div className="flex flex-1 flex-col gap-5 p-4 sm:p-6">
                      {dashboardUrl ? (
                        <>
                          <div className="grid grid-cols-3 gap-2 sm:gap-3">
                            <Tile icon={<Activity />} label="Status" value={<span className="text-emerald-600 dark:text-emerald-400">Online</span>} />
                            <Tile icon={<Cpu />} label="AI Engine" value="Active" />
                            <Tile icon={<ShieldCheck />} label="Monitoring" value="24/7" />
                          </div>
                          <a
                            href={dashboardUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-[0.99]"
                          >
                            <Eye className="h-4 w-4" />
                            Open Live Dashboard
                            <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                          </a>
                        </>
                      ) : (
                        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-10 text-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
                            <Clock className="h-6 w-6" />
                          </div>
                          <p className="mt-3 font-semibold">Dashboard setup in progress</p>
                          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                            Our team is configuring your live dashboard. It will appear here as soon as it is ready.
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>

                <motion.div variants={fade} initial="hidden" animate="visible" custom={3} className="min-w-0">
                  <Card className="flex h-full flex-col">
                    <CardHeader icon={<User className="h-5 w-5" />} title="Account" subtitle="Your login and security" />
                    <div className="flex flex-1 flex-col p-4 sm:p-6">
                      <dl className="mb-5 space-y-3 text-sm">
                        <div className="flex items-center justify-between gap-3">
                          <dt className="text-muted-foreground">Username</dt>
                          <dd className="truncate font-medium">{username || "—"}</dd>
                        </div>
                        {plan?.companyName && (
                          <div className="flex items-center justify-between gap-3">
                            <dt className="text-muted-foreground">Company</dt>
                            <dd className="truncate font-medium">{plan.companyName}</dd>
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-3">
                          <dt className="text-muted-foreground">Plan</dt>
                          <dd className="truncate font-medium">{planLabel}</dd>
                        </div>
                      </dl>

                      <div className="mt-auto border-t border-border pt-5">
                        {!showPasswordForm ? (
                          <button
                            type="button"
                            onClick={() => setShowPasswordForm(true)}
                            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-secondary/50"
                          >
                            <KeyRound className="h-4 w-4" />
                            Change Password
                          </button>
                        ) : (
                          <form className="mt-5 space-y-3" onSubmit={handlePasswordChange}>
                            <div className="flex items-center justify-between">
                              <p className="flex items-center gap-2 text-sm font-semibold">
                                <Lock className="h-4 w-4 text-primary" />
                                New password
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowPasswordForm(false);
                                  setNewPassword("");
                                  setConfirmPassword("");
                                }}
                                className="text-xs text-muted-foreground transition hover:text-foreground"
                              >
                                Cancel
                              </button>
                            </div>
                            <input
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Enter new password"
                              aria-label="New password"
                              autoComplete="new-password"
                              className={inputClass}
                            />
                            <input
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Confirm new password"
                              aria-label="Confirm new password"
                              autoComplete="new-password"
                              className={inputClass}
                            />
                            <button
                              type="submit"
                              disabled={updatingPassword}
                              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
                            >
                              {updatingPassword ? "Updating…" : "Update Password"}
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </div>
            </>
          )}

          {activeTab === "tickets" && (
            <motion.div variants={fade} initial="hidden" animate="visible" custom={1}>
              <UserTickets user={user} username={username} />
            </motion.div>
          )}

          {activeTab === "feedback" && (
            <motion.div variants={fade} initial="hidden" animate="visible" custom={1}>
              <UserFeedback user={user} username={username} companyName={plan?.companyName || ""} />
            </motion.div>
          )}

          {/* ---------- Footer ---------- */}
          <div className="flex flex-col items-center justify-between gap-2 px-1 text-xs text-muted-foreground sm:flex-row">
            <span>© {now.getFullYear()} Trinetra Systems · Need help? support@trinetrasystems.com</span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
        </div>
      </div>
    </div>
    </MotionConfig>
  );
};

export default UserDashboard;
