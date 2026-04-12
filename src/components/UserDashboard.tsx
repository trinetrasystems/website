import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  LogOut,
  ArrowLeft,
  Clock,
  Activity,
  Radio,
  ChevronRight,
  User,
  Lock,
  ExternalLink,
  Zap,
  Camera,
  Shield,
} from "lucide-react";
import { Link } from "react-router-dom";
import { updatePassword, type User as FirebaseUser } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

interface UserDashboardProps {
  user: FirebaseUser;
  username: string;
  ipLink: string;
  onSignOut: () => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const UserDashboard = ({ user, username, ipLink, onSignOut }: UserDashboardProps) => {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const displayName = (username || "User").replace(/\d+$/, "") || username || "User";
  const dashboardUrl = ipLink
    ? ipLink.startsWith("http") ? ipLink : `http://${ipLink}`
    : null;

  const now = new Date();
  const greeting =
    now.getHours() < 12 ? "Good Morning" : now.getHours() < 17 ? "Good Afternoon" : "Good Evening";

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
        {
          uid: user.uid,
          username: username || user.email || "",
          password: newPassword,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
      toast.success("Password updated successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not update password.";
      toast.error(message);
      if (message.includes("requires-recent-login")) {
        toast.info("Please logout and login again to change your password.");
      }
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -right-48 w-[600px] h-[600px] rounded-full bg-primary/[0.04] blur-[120px]" />
        <div className="absolute -bottom-48 -left-48 w-[500px] h-[500px] rounded-full bg-accent/[0.04] blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/[0.015] blur-[160px]" />
      </div>

      <div className="relative z-10 px-4 pt-24 lg:pt-28 pb-12 md:px-8">
        <div className="mx-auto max-w-5xl space-y-6">

          {/* Top Bar */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card/80 backdrop-blur-xl px-5 py-4 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">User Portal</p>
                <h1 className="text-xl font-bold">Dashboard</h1>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary/40 hover:text-foreground hover:border-border/80"
              >
                <ArrowLeft className="h-4 w-4" />
                Home
              </Link>
              <button
                type="button"
                onClick={onSignOut}
                className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm font-medium text-red-500 transition-all hover:bg-red-500/10 hover:border-red-500/30"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </motion.div>

          {/* Welcome Hero */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/[0.08] via-card to-accent/[0.06] p-8 md:p-10 shadow-lg"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/[0.05] rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/[0.05] rounded-full blur-[60px] translate-y-1/2 -translate-x-1/4" />

            {/* Scan line effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-scan-line" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-sm font-semibold text-primary mb-2"
                >
                  {greeting} 👋
                </motion.p>
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="text-3xl md:text-4xl font-bold"
                >
                  Welcome back,{" "}
                  <span className="text-gradient">{displayName}</span>
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="mt-2 text-muted-foreground max-w-lg"
                >
                  Your Trinetra surveillance system is{" "}
                  {dashboardUrl ? (
                    <span className="text-green-500 font-semibold">active and monitoring</span>
                  ) : (
                    <span className="text-yellow-500 font-semibold">being configured</span>
                  )}
                  . Access your live feeds and manage your account below.
                </motion.p>
              </div>

              {/* Status Indicator */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="flex-shrink-0"
              >
                <div className={`relative flex h-24 w-24 items-center justify-center rounded-2xl border ${dashboardUrl
                    ? "border-green-500/30 bg-green-500/10"
                    : "border-yellow-500/30 bg-yellow-500/10"
                  }`}>
                  <div className={`absolute inset-0 rounded-2xl ${dashboardUrl ? "bg-green-500/5" : "bg-yellow-500/5"
                    } animate-pulse`} />
                  <Activity className={`h-10 w-10 ${dashboardUrl ? "text-green-500" : "text-yellow-500"
                    }`} />
                  <div className={`absolute -top-1 -right-1 h-4 w-4 rounded-full border-2 border-card ${dashboardUrl ? "bg-green-500" : "bg-yellow-500"
                    }`}>
                    <div className={`absolute inset-0 rounded-full ${dashboardUrl ? "bg-green-500" : "bg-yellow-500"
                      } animate-ping`} />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Main Layout Area */}
          <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">

            {/* Live Dashboard Card - Takes full row */}
            <motion.div
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              custom={3}
              className="md:col-span-2"
            >
              <div className={`group relative overflow-hidden rounded-2xl border p-6 shadow-lg transition-all duration-500 ${dashboardUrl
                  ? "border-primary/20 bg-gradient-to-br from-primary/[0.06] via-card to-primary/[0.03] hover:border-primary/40 hover:shadow-primary/10"
                  : "border-border bg-card"
                }`}>
                {/* Animated background */}
                {dashboardUrl && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/[0.06] rounded-full blur-[60px] group-hover:w-56 group-hover:h-56 transition-all duration-700" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/[0.04] rounded-full blur-[40px] group-hover:w-40 group-hover:h-40 transition-all duration-700" />
                  </div>
                )}

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${dashboardUrl
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground"
                        }`}>
                        <Camera className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">Live Surveillance</h3>
                        <p className="text-xs text-muted-foreground">Real-time camera feeds</p>
                      </div>
                    </div>
                    {dashboardUrl && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                        <Radio className="h-3 w-3 text-green-500 animate-pulse" />
                        <span className="text-xs font-bold text-green-500 uppercase tracking-wider">Live</span>
                      </div>
                    )}
                  </div>

                  {dashboardUrl ? (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-border/50 bg-background/50 p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Zap className="h-4 w-4 text-primary" />
                          <span className="text-sm font-semibold">System Status</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-center">
                            <p className="text-lg font-bold text-green-500">●</p>
                            <p className="text-[10px] font-semibold text-green-600 dark:text-green-400 uppercase mt-1">Online</p>
                          </div>
                          <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 text-center">
                            <p className="text-lg font-bold text-primary">AI</p>
                            <p className="text-[10px] font-semibold text-primary uppercase mt-1">Active</p>
                          </div>
                          <div className="rounded-lg bg-accent/10 border border-accent/20 p-3 text-center">
                            <p className="text-lg font-bold text-accent">24/7</p>
                            <p className="text-[10px] font-semibold text-accent uppercase mt-1">Monitoring</p>
                          </div>
                        </div>
                      </div>

                      <a
                        href={dashboardUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/btn flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-primary to-primary/80 py-4 px-6 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Eye className="h-5 w-5 transition-transform group-hover/btn:scale-110" />
                        Open Live Dashboard
                        <ExternalLink className="h-4 w-4 opacity-60" />
                      </a>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/[0.05] p-6 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-500/10 mx-auto mb-3">
                        <Shield className="h-7 w-7 text-yellow-500" />
                      </div>
                      <p className="font-semibold text-yellow-600 dark:text-yellow-400">Dashboard Pending Setup</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your dashboard is being configured by the admin team. You'll be notified once it's ready.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>



            {/* Password Reset Card */}
            <motion.div
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              custom={5}
            >
              <div className="h-full rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 shadow-lg">
                {!showPasswordForm ? (
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(true)}
                    className="flex w-full items-center gap-3 rounded-xl border border-border bg-secondary/20 p-4 text-left transition-all hover:bg-secondary/40 hover:border-primary/20 group"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 transition-transform group-hover:scale-105">
                      <Lock className="h-4.5 w-4.5 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">Reset Password</p>
                      <p className="text-xs text-muted-foreground">Update your account credentials</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </button>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
                          <Lock className="h-4 w-4 text-amber-500" />
                        </div>
                        <p className="text-sm font-bold">Set New Password</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordForm(false);
                          setNewPassword("");
                          setConfirmPassword("");
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                    <form className="space-y-3" onSubmit={handlePasswordChange}>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/30 focus:border-primary/30"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Confirm Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/30 focus:border-primary/30"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={updatingPassword}
                        className="w-full rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                      >
                        {updatingPassword ? "Updating..." : "Update Password"}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </motion.div>


          </div>

          {/* Footer Info */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={8}
            className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm px-6 py-4 shadow-md"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span>System Operational</span>
                </div>
                <span className="hidden sm:inline text-border">•</span>
                <span className="hidden sm:inline">Powered by Trinetra AI</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {now.toLocaleDateString("en-IN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
