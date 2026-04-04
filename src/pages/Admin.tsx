import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
  type FormEvent,
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
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Shield, LogIn, LogOut, RefreshCw, ArrowLeft } from "lucide-react";

type Submission = {
  id: string;
  name: string;
  email: string;
  contactNumber: string;
  message: string;
  createdAtLabel: string;
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
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-4 py-2 text-sm">
            <Shield className="h-4 w-4 text-primary" />
            Admin Dashboard
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-lg">
            <h1 className="text-3xl font-bold">Admin Login</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Log in with your Firebase admin account to view submitted form data.
            </p>

            {!user ? (
              <form className="mt-6 space-y-4" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="admin@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground transition hover:opacity-90"
                >
                  <LogIn className="h-4 w-4" />
                  Connect to Firebase
                </button>
              </form>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="rounded-lg border border-border bg-secondary/30 p-4 text-sm">
                  <p className="font-medium">Logged in as</p>
                  <p className="mt-1 text-muted-foreground">{user.email}</p>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 font-semibold transition hover:bg-secondary/40"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}

            <div className="mt-5 rounded-lg border border-border bg-secondary/20 p-4 text-sm text-muted-foreground">
              {checkingAdmin ? "Checking admin access..." : status || "Login to load submitted data."}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Submitted Forms</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Data appears here only after a verified admin login.
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
              {!canShowDashboard ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                  Log in with an admin account to load submissions.
                </div>
              ) : submissions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                  No submissions yet.
                </div>
              ) : (
                submissions.map((submission) => (
                  <article key={submission.id} className="rounded-xl border border-border bg-secondary/20 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold">{submission.name}</h3>
                        <p className="text-sm text-muted-foreground">{submission.email}</p>
                        <p className="text-sm text-muted-foreground">Contact: {submission.contactNumber}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{submission.createdAtLabel}</span>
                    </div>
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-foreground/90">
                      {submission.message}
                    </p>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Admin;