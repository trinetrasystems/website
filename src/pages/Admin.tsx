import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type Timestamp,
  updateDoc,
} from "firebase/firestore";
import { adminAuth, auth, db } from "@/lib/firebase";
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
  companyName?: string;
  email: string;
  contactNumber: string;
  message: string;
  createdAtLabel: string;
  status?: string;
};

type UserProfile = {
  id: string;
  username: string;
  usernameKey: string;
  authEmail: string;
  role: "admin" | "user";
  ipLink: string;
  createdAtLabel: string;
  updatedAtLabel: string;
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

const normalizeUsername = (value: string) => value.trim().toLowerCase();

const createAuthEmail = (value: string) => {
  const normalizedUsername = normalizeUsername(value);
  const safeUsername = normalizedUsername.replace(/[^a-z0-9._-]/g, "-");
  return `${safeUsername || "user"}@trinetra.local`;
};

const Admin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<"admin" | "user" | null>(null);
  const [ipLink, setIpLink] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  const [newUserUsername, setNewUserUsername] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "user">("user");
  const [newUserIpLink, setNewUserIpLink] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUserUsername, setSelectedUserUsername] = useState("");
  const [selectedUserRole, setSelectedUserRole] = useState<"admin" | "user">("user");
  const [selectedUserIpLink, setSelectedUserIpLink] = useState("");
  const [updatingUser, setUpdatingUser] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);
  const [activeSection, setActiveSection] = useState<"create" | "edit" | "forms">("create");

  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const canShowDashboard = useMemo(() => Boolean(user && isAdmin), [user, isAdmin]);
  const selectedUser = users.find((profile) => profile.id === selectedUserId) || null;
  const pageTitle = isAdmin ? "Admin Console" : userRole === "user" ? "User Dashboard" : "Access Portal";
  const pageSubtitle = isAdmin
    ? "User Management"
    : userRole === "user"
      ? "Your account details and IP link"
      : "Sign in to continue";
  const filteredUsers = useMemo(() => {
    const searchValue = userSearch.trim().toLowerCase();

    if (!searchValue) {
      return users;
    }

    return users.filter((profile) => {
      return (
        profile.username.toLowerCase().includes(searchValue) ||
        profile.authEmail.toLowerCase().includes(searchValue) ||
        profile.role.toLowerCase().includes(searchValue) ||
        profile.id.toLowerCase().includes(searchValue) ||
        profile.ipLink.toLowerCase().includes(searchValue)
      );
    });
  }, [users, userSearch]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      setIsAdmin(false);
      setUserRole(null);
      setIpLink("");
      setStatus("");
      setSubmissions([]);
      setUsers([]);
      setUserSearch("");
      setSelectedUserId("");
      setSelectedUserUsername("");
      setSelectedUserRole("user");
      setSelectedUserIpLink("");
      setActiveSection("create");

      if (!currentUser) {
        setCheckingAdmin(false);
        return;
      }

      setCheckingAdmin(true);
      try {
        const profileDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (profileDoc.exists()) {
          const data = profileDoc.data();
          const role = (data.role || "user") as "admin" | "user";
          setUserRole(role);
          if (role === "admin") {
            setIsAdmin(true);
            setStatus("Admin access confirmed.");
          } else {
            setIpLink(data.ip_link || "");
            setStatus("User logged in successfully.");
          }
        } else {
          setStatus("User profile not found.");
        }
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Could not check user access.");
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

    const unsubscribeUsers = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const nextUsers = snapshot.docs.map((userDoc) => {
          const data = userDoc.data();
          return {
            id: userDoc.id,
            username: data.username || data.email || "No username",
            usernameKey: data.usernameKey || normalizeUsername(data.username || data.email || ""),
            authEmail: data.authEmail || data.email || "",
            role: (data.role || "user") as "admin" | "user",
            ipLink: data.ip_link || "",
            createdAtLabel: formatTimestamp(data.createdAt),
            updatedAtLabel: formatTimestamp(data.updatedAt),
          };
        });

        setUsers(nextUsers);

        if (selectedUserId) {
          const selected = nextUsers.find((profile) => profile.id === selectedUserId);
          if (selected) {
            setSelectedUserUsername(selected.username);
            setSelectedUserRole(selected.role);
            setSelectedUserIpLink(selected.ipLink);
          }
        }
      },
      (error) => setStatus(error.message || "Could not load users.")
    );

    const submissionsQuery = query(
      collection(db, "publicSubmissions"),
      orderBy("createdAt", "desc"),
      limit(100)
    );

    const unsubscribeSubmissions = onSnapshot(
      submissionsQuery,
      (snapshot) => {
        setSubmissions(
          snapshot.docs.map((entryDoc) => {
            const data = entryDoc.data();
            return {
              id: entryDoc.id,
              name: data.name || "Anonymous",
              companyName: data.companyName || "No company name",
              email: data.email || "No email",
              contactNumber: data.contactNumber || "No contact number",
              message: data.message || "",
              createdAtLabel: formatTimestamp(data.createdAt),
              status: data.status || "pending",
            };
          })
        );
      },
      (error) => setStatus(error.message || "Could not load submissions.")
    );

    return () => {
      unsubscribeUsers();
      unsubscribeSubmissions();
    };
  }, [canShowDashboard, selectedUserId]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("");

    const loginInput = username.trim();
    const normalizedUsername = normalizeUsername(loginInput);

    if (!normalizedUsername) {
      setStatus("Username is required.");
      return;
    }

    try {
      if (loginInput.includes("@")) {
        await signInWithEmailAndPassword(auth, loginInput, password);
        return;
      }

      let authEmailToUse = "";

      const loginIndexDoc = await getDoc(doc(db, "loginIndex", normalizedUsername));
      if (loginIndexDoc.exists()) {
        const data = loginIndexDoc.data();
        authEmailToUse = data.authEmail || "";
      }

      if (!authEmailToUse) {
        setStatus("User not found. Ask admin to create login index for this username.");
        return;
      }

      await signInWithEmailAndPassword(auth, authEmailToUse, password);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not sign in.");
    }
  };

  const handleCreateUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAdmin) {
      setStatus("Only admins can create users.");
      return;
    }
    const normalizedUsername = normalizeUsername(newUserUsername);

    if (!normalizedUsername || !newUserPassword) {
      setStatus("Username and password are required.");
      return;
    }

    setCreatingUser(true);
    setStatus("");

    try {
      const existingLoginIndex = await getDoc(doc(db, "loginIndex", normalizedUsername));

      if (existingLoginIndex.exists()) {
        setStatus("Username already exists.");
        toast.error("Username already exists.");
        return;
      }

      const authEmail = createAuthEmail(normalizedUsername);
      const credential = await createUserWithEmailAndPassword(adminAuth, authEmail, newUserPassword);

      try {
        await setDoc(doc(db, "users", credential.user.uid), {
          username: newUserUsername.trim(),
          usernameKey: normalizedUsername,
          authEmail,
          email: authEmail,
          role: newUserRole,
          ip_link: newUserRole === "user" ? newUserIpLink : "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        await setDoc(doc(db, "loginIndex", normalizedUsername), {
          authEmail,
          userId: credential.user.uid,
          username: newUserUsername.trim(),
          usernameKey: normalizedUsername,
          updatedAt: serverTimestamp(),
        });
      } catch (profileError) {
        await deleteUser(credential.user);
        throw profileError;
      } finally {
        await signOut(adminAuth).catch(() => undefined);
      }

      setNewUserUsername("");
      setNewUserPassword("");
      setNewUserRole("user");
      setNewUserIpLink("");
      setStatus("User created successfully.");
      toast.success("User created successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not create user.";
      setStatus(message);
      toast.error(message);
    } finally {
      setCreatingUser(false);
    }
  };

  const handleSelectUser = (profile: UserProfile) => {
    setSelectedUserId(profile.id);
    setSelectedUserUsername(profile.username);
    setSelectedUserRole(profile.role);
    setSelectedUserIpLink(profile.ipLink);
    setStatus(`Selected ${profile.username}.`);
  };

  const handleCancelSelectedUser = () => {
    setSelectedUserId("");
    setSelectedUserUsername("");
    setSelectedUserRole("user");
    setSelectedUserIpLink("");
    setStatus("Edit cancelled.");
  };

  const handleUpdateUser = async () => {
    if (!isAdmin || !selectedUserId) {
      setStatus("Select a user first.");
      return;
    }

    setUpdatingUser(true);
    setStatus("");

    try {
      const normalizedUsername = normalizeUsername(selectedUserUsername);

      if (!normalizedUsername) {
        setStatus("Username is required.");
        return;
      }

      const existingLoginIndex = await getDoc(doc(db, "loginIndex", normalizedUsername));
      if (existingLoginIndex.exists() && existingLoginIndex.data()?.userId !== selectedUserId) {
        setStatus("Username already exists.");
        toast.error("Username already exists.");
        return;
      }

      const selectedUserAuthEmail = selectedUser?.authEmail || createAuthEmail(normalizedUsername);

      await setDoc(
        doc(db, "users", selectedUserId),
        {
          username: selectedUserUsername.trim(),
          usernameKey: normalizedUsername,
          authEmail: selectedUserAuthEmail,
          email: selectedUserAuthEmail,
          role: selectedUserRole,
          ip_link: selectedUserRole === "user" ? selectedUserIpLink : "",
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      await setDoc(doc(db, "loginIndex", normalizedUsername), {
        authEmail: selectedUserAuthEmail,
        userId: selectedUserId,
        username: selectedUserUsername.trim(),
        usernameKey: normalizedUsername,
        updatedAt: serverTimestamp(),
      });
      setStatus("User updated successfully.");
      toast.success("User updated successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not update user.";
      setStatus(message);
      toast.error(message);
    } finally {
      setUpdatingUser(false);
    }
  };

  const handleDeleteSelectedUser = async () => {
    if (!isAdmin || !selectedUserId) {
      setStatus("Select a user first.");
      return;
    }

    setDeletingUser(true);
    setStatus("");

    try {
      const deletedUser = selectedUser;
      await deleteDoc(doc(db, "users", selectedUserId));
      if (deletedUser?.usernameKey) {
        await deleteDoc(doc(db, "loginIndex", deletedUser.usernameKey));
      }
      setSelectedUserId("");
      setSelectedUserUsername("");
      setSelectedUserRole("user");
      setSelectedUserIpLink("");
      setActiveSection("edit");
      setStatus("User deleted successfully.");
      toast.success("User deleted successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not delete user.";
      setStatus(message);
      toast.error(message);
    } finally {
      setDeletingUser(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setStatus("Signed out.");
      setIsAdmin(false);
      setUserRole(null);
      setIpLink("");
      setSubmissions([]);
      setUsers([]);
      setUserSearch("");
      setUsername("");
      setNewUserUsername("");
      setSelectedUserId("");
      setSelectedUserUsername("");
      setSelectedUserRole("user");
      setSelectedUserIpLink("");
      setActiveSection("create");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not sign out.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "publicSubmissions", id));
      toast.success("Submission deleted");
    } catch (error) {
      toast.error("Failed to delete submission: " + (error instanceof Error ? error.message : "Access Denied"));
    }
  };

  const handleComplete = async (id: string, currentStatus?: string) => {
    try {
      const newStatus = currentStatus === "completed" ? "pending" : "completed";
      await updateDoc(doc(db, "publicSubmissions", id), { status: newStatus });
      toast.success(`Marked as ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status: " + (error instanceof Error ? error.message : "Access Denied"));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-4 py-8 text-foreground md:px-8">
        <div className="mx-auto max-w-6xl rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground shadow-lg">
          Loading admin page...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 text-foreground md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card px-5 py-4 shadow-lg">
          <div>
            <p className="text-sm text-muted-foreground">
              {isAdmin ? "Admin Console" : userRole === "user" ? "User Portal" : "Access Portal"}
            </p>
            <h1 className="text-2xl font-bold">{pageTitle}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{pageSubtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary/40 hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            {user && (
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-secondary/40"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            )}
          </div>
        </div>

        <div className={`grid gap-6 ${canShowDashboard ? "lg:grid-cols-[380px_minmax(0,1fr)]" : "max-w-md mx-auto"}`}>
          <section className="h-fit rounded-2xl border border-border bg-card p-6 shadow-lg">
            <h2 className="text-3xl font-bold">Login</h2>
            <p className="mt-2 text-sm text-muted-foreground">Sign in with your username and password.</p>

            {!user ? (
              <form className="mt-6 space-y-4" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    autoComplete="username"
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-primary/40"
                    placeholder="Enter your username"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-primary/40"
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
            ) : isAdmin ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-lg border border-border bg-secondary/30 p-4 text-sm">
                  <p className="font-medium text-primary">System Admin</p>
                  <p className="mt-1 truncate text-muted-foreground">{user.email}</p>
                </div>
                <div className="rounded-lg border border-border bg-secondary/20 p-4 text-sm text-muted-foreground">
                  Use the sections on the right to create users, edit users, and review submissions.
                </div>
              </div>
            ) : userRole === "user" ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-lg border border-border bg-secondary/30 p-4 text-sm">
                  <p className="font-medium text-primary">User Account</p>
                  <p className="mt-1 truncate text-muted-foreground">{user.email}</p>
                </div>
                <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4 text-sm">
                  <p className="font-medium text-blue-600 dark:text-blue-400">IP Link</p>
                  {ipLink ? (
                    <p className="mt-2 rounded bg-background/50 p-2 font-mono text-xs break-all text-muted-foreground">
                      {ipLink}
                    </p>
                  ) : (
                    <p className="mt-1 italic text-muted-foreground">No IP link assigned yet.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-500">
                Your account does not have proper role assignment.
              </div>
            )}

            {(checkingAdmin || (status && !canShowDashboard)) && (
              <div className="mt-5 rounded-lg border border-border bg-secondary/20 p-4 text-xs text-muted-foreground animate-pulse">
                {checkingAdmin ? "Verifying permissions..." : status}
              </div>
            )}

            {user && (
              <button
                type="button"
                onClick={handleSignOut}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 font-semibold transition-all hover:bg-secondary/40 active:scale-[0.98]"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            )}
          </section>

          {canShowDashboard && (
            <div className="space-y-6">
              <section className="rounded-2xl border border-border bg-card p-6 shadow-lg">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveSection("create")}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                      activeSection === "create"
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-background hover:bg-secondary/40"
                    }`}
                  >
                    Create User
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSection("edit")}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                      activeSection === "edit"
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-background hover:bg-secondary/40"
                    }`}
                  >
                    Edit User
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSection("forms")}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                      activeSection === "forms"
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-background hover:bg-secondary/40"
                    }`}
                  >
                    Submitted Forms
                  </button>
                </div>
              </section>

              {activeSection === "create" && (
                <section className="rounded-2xl border border-border bg-card p-6 shadow-lg">
                  <div>
                    <h2 className="text-2xl font-bold">Create User</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Create a Firebase Auth account and save the Firestore profile.
                    </p>
                  </div>
                  <form className="mt-6 space-y-4" onSubmit={handleCreateUser}>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Username</label>
                      <input
                        type="text"
                        value={newUserUsername}
                        onChange={(event) => setNewUserUsername(event.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-primary/40"
                        placeholder="New username"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Password</label>
                      <input
                        type="password"
                        value={newUserPassword}
                        onChange={(event) => setNewUserPassword(event.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-primary/40"
                        placeholder="New user password"
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Role</label>
                        <select
                          value={newUserRole}
                          onChange={(event) => setNewUserRole(event.target.value as "admin" | "user")}
                          className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-primary/40"
                        >
                          <option value="user">Normal User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">IP Link</label>
                        <input
                          type="text"
                          value={newUserIpLink}
                          onChange={(event) => setNewUserIpLink(event.target.value)}
                          className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-primary/40"
                          placeholder="Optional IP link"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={creatingUser}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Shield className="h-4 w-4" />
                      {creatingUser ? "Creating..." : "Create User"}
                    </button>
                  </form>
                </section>
              )}

              {activeSection === "edit" && (
                <section className="rounded-2xl border border-border bg-card p-6 shadow-lg">
                  <div>
                    <h2 className="text-2xl font-bold">Edit User</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Select a profile to view, update, or delete it.
                    </p>
                  </div>
                  <div className="mt-6 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Search Users</label>
                      <input
                        type="text"
                        value={userSearch}
                        onChange={(event) => setUserSearch(event.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-primary/40"
                        placeholder="Search by username, auth email, role, UID, or IP link"
                      />
                    </div>
                    <div className="max-h-60 space-y-2 overflow-y-auto rounded-xl border border-border bg-secondary/10 p-3 pr-1">
                      {filteredUsers.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No users found.</p>
                      ) : (
                        filteredUsers.map((profile) => (
                          <button
                            key={profile.id}
                            type="button"
                            onClick={() => handleSelectUser(profile)}
                            className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                              selectedUserId === profile.id
                                ? "border-primary bg-primary/10"
                                : "border-border bg-background hover:bg-secondary/30"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="truncate font-medium">{profile.username}</span>
                              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                                {profile.role}
                              </span>
                            </div>
                            <p className="mt-1 truncate text-xs text-muted-foreground">{profile.id}</p>
                          </button>
                        ))
                      )}
                    </div>

                    {selectedUserId ? (
                      <form className="space-y-4 rounded-xl border border-border bg-secondary/20 p-4">
                        <div>
                          <p className="text-sm font-semibold">Selected User</p>
                          <p className="mt-1 break-all text-xs text-muted-foreground">UID: {selectedUserId}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Username</label>
                          <input
                            type="text"
                            value={selectedUserUsername}
                            onChange={(event) => setSelectedUserUsername(event.target.value)}
                            className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-primary/40"
                            placeholder="User username"
                          />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Role</label>
                            <select
                              value={selectedUserRole}
                              onChange={(event) => setSelectedUserRole(event.target.value as "admin" | "user")}
                              className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-primary/40"
                            >
                              <option value="user">Normal User</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">IP Link</label>
                            <input
                              type="text"
                              value={selectedUserIpLink}
                              onChange={(event) => setSelectedUserIpLink(event.target.value)}
                              disabled={selectedUserRole === "admin"}
                              className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
                              placeholder="User IP link"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={handleCancelSelectedUser}
                            disabled={updatingUser || deletingUser}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 font-semibold transition-all hover:bg-secondary/40 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Cancel
                          </button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                type="button"
                                disabled={updatingUser}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <Shield className="h-4 w-4" />
                                {updatingUser ? "Saving..." : "Save Changes"}
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Save updated details?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will update the selected user profile with the current form values.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleUpdateUser}>Save</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                type="button"
                                disabled={deletingUser}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-destructive px-4 py-3 font-semibold text-destructive transition-all hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <Trash2 className="h-4 w-4" />
                                {deletingUser ? "Deleting..." : "Delete User"}
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete this user?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. The selected user profile will be removed from the database.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleDeleteSelectedUser}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Created: {selectedUser?.createdAtLabel || "Unknown"}
                          <br />
                          Updated: {selectedUser?.updatedAtLabel || "Unknown"}
                        </p>
                      </form>
                    ) : (
                      <div className="rounded-xl border border-dashed border-border p-8 text-sm text-muted-foreground">
                        Select a user to edit them.
                      </div>
                    )}
                  </div>
                </section>
              )}

              {activeSection === "forms" && (
                <section className="rounded-2xl border border-border bg-card p-6 shadow-lg">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold">Submitted Forms</h2>
                      <p className="mt-1 text-sm text-muted-foreground">Real-time requests from the website.</p>
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
                          className={`rounded-xl border border-border bg-secondary/20 p-5 transition-all ${submission.status === "completed" ? "opacity-60 grayscale-[0.5]" : ""}`}
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
                              <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                                <p><span className="font-medium text-foreground">Email:</span> {submission.email}</p>
                                <p><span className="font-medium text-foreground">Company Name:</span> {submission.companyName}</p>
                                <p><span className="font-medium text-foreground">Mobile Number:</span> {submission.contactNumber}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleComplete(submission.id, submission.status)}
                                className={`rounded-lg p-2 transition-colors ${submission.status === "completed" ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" : "text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-500"}`}
                                title={submission.status === "completed" ? "Mark as Pending" : "Mark as Completed"}
                              >
                                <CheckCircle className="h-5 w-5" />
                              </button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button
                                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                    title="Remove Request"
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the submission from {submission.name}.
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
                              <span className="ml-2 whitespace-nowrap text-xs text-muted-foreground">{submission.createdAtLabel}</span>
                            </div>
                          </div>
                          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-foreground/90">
                            <span className="font-medium text-foreground">Query:</span> {submission.message}
                          </p>
                        </article>
                      ))
                    )}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
