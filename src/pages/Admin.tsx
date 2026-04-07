import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  type Timestamp,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Shield, LogIn, LogOut, RefreshCw, ArrowLeft, CheckCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Submission = {
  id: string;
  name: string;
  email: string;
  contactNumber: string;
  message: string;
  createdAtLabel: string;
  status?: string;
};

type FirestoreTimestamp = Timestamp & {
  toDate: () => Date;
};

const formatTimestamp = (value: unknown) => {
  const timestamp = value as FirestoreTimestamp | undefined;
  if (!timestamp?.toDate) {
    return "Just now";
  }

  return timestamp.toDate().toLocaleString();
};

const Admin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const canShowDashboard = useMemo(() => Boolean(user && isAdmin), [user, isAdmin]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      setIsAdmin(false);
      setSubmissions([]);

      if (!currentUser) {
        setCheckingAdmin(false);
        return;
      }

      setCheckingAdmin(true);
      try {
        const adminDoc = await getDoc(doc(db, "admins", currentUser.uid));
        const hasAccess = adminDoc.exists();
        setIsAdmin(hasAccess);
        setStatus(hasAccess ? "Admin access confirmed." : "This account is not marked as admin.");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Could not check admin access.");
      } finally {
        setCheckingAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!canShowDashboard) {
      return;
    }

    const submissionsQuery = query(
      collection(db, "publicSubmissions"),
      orderBy("createdAt", "desc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(
      submissionsQuery,
      (snapshot) => {
        setSubmissions(
          snapshot.docs.map((entryDoc) => {
            const data = entryDoc.data();
            return {
              id: entryDoc.id,
              name: data.name || "Anonymous",
              email: data.email || "No email",
              contactNumber: data.contactNumber || "No contact number",
              message: data.message || "",
              createdAtLabel: formatTimestamp(data.createdAt),
              status: data.status || "pending",
            };
          })
        );
      },
      (error) => {
        setStatus(error.message || "Could not load submissions.");
      }
    );

    return () => unsubscribe();
  }, [canShowDashboard]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not sign in.");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setStatus("Signed out.");
      setIsAdmin(false);
      setSubmissions([]);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not sign out.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const docRef = doc(db, "publicSubmissions", id);
      await deleteDoc(docRef);
      toast.success("Submission deleted");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete submission: " + (error instanceof Error ? error.message : "Access Denied"));
    }
  };

  const handleComplete = async (id: string, currentStatus?: string) => {
    try {
      const docRef = doc(db, "publicSubmissions", id);
      const newStatus = currentStatus === "completed" ? "pending" : "completed";
      await updateDoc(docRef, {
        status: newStatus,
      });
      toast.success(`Marked as ${newStatus}`);
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update status: " + (error instanceof Error ? error.message : "Access Denied"));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground px-4 py-8 md:px-8">
        <div className="mx-auto max-w-6xl rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground shadow-lg">
          Loading admin page...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to site
          </Link>
          
        </div>

        <div className={`grid gap-6 ${canShowDashboard ? "lg:grid-cols-[380px_minmax(0,1fr)]" : "max-w-md mx-auto"}`}>
          <section className="rounded-2xl border border-border bg-card p-6 shadow-lg h-fit">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {canShowDashboard 
                ? "" 
                : ""}
            </p>

            {!user ? (
              <form className="mt-6 space-y-4" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                    placeholder="Enter your email"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                    placeholder="Enter your password"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </button>
              </form>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="rounded-lg border border-border bg-secondary/30 p-4 text-sm">
                  <p className="font-medium text-primary">System Admin</p>
                  <p className="mt-1 text-muted-foreground truncate">{user.email}</p>
                </div>
                {!isAdmin && user && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-xs text-red-500">
                    Your account does not have admin privileges.
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 font-semibold transition-all hover:bg-secondary/40 active:scale-[0.98]"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
            
            {(checkingAdmin || (status && !canShowDashboard)) && (
              <div className="mt-5 rounded-lg border border-border bg-secondary/20 p-4 text-xs text-muted-foreground animate-pulse">
                {checkingAdmin ? "Verifying permissions..." : status}
              </div>
            )}
          </section>

          {canShowDashboard && (
            <motion.section 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-lg"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">Submitted Forms</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Real-time requests from the website.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium transition hover:bg-secondary/40"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {submissions.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
                    <p className="text-lg font-medium">All caught up!</p>
                    <p className="text-sm opacity-70">No new submissions found in the database.</p>
                  </div>
                ) : (
                  submissions.map((submission) => (
                  <article
                    key={submission.id}
                    className={`rounded-xl border border-border bg-secondary/20 p-5 transition-all ${submission.status === "completed" ? "opacity-60 grayscale-[0.5]" : ""
                      }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{submission.name}</h3>
                          {submission.status === "completed" && (
                            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-500 ring-1 ring-inset ring-emerald-500/20">
                              Completed
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{submission.email}</p>
                        <p className="text-sm text-muted-foreground">Contact: {submission.contactNumber}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleComplete(submission.id, submission.status)}
                          className={`p-2 rounded-lg transition-colors ${submission.status === "completed"
                              ? "text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20"
                              : "text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10"
                            }`}
                          title={submission.status === "completed" ? "Mark as Pending" : "Mark as Completed"}
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              title="Remove Request"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the
                                submission from **{submission.name}**.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(submission.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">{submission.createdAtLabel}</span>
                      </div>
                    </div>
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-foreground/90">
                      {submission.message}
                    </p>
                  </article>
                ))
              )}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  </div>
  );
};

export default Admin;