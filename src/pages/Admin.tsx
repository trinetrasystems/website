import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
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
import { Shield, LogIn, LogOut, RefreshCw, ArrowLeft, CheckCircle, Trash2, Eye, EyeOff, Key, Copy, Users, Phone, Mail, Search, FileText, Download } from "lucide-react";
import AppSidebar from "@/components/AppSidebar";
import UserDashboard from "@/components/UserDashboard";
import AdminTickets from "@/components/AdminTickets";
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
  contactEmail?: string;
  contactMobile?: string;
  role: "admin" | "member" | "user";
  isMember?: boolean;
  permissions?: string[];
  ipLink: string;
  createdAtLabel: string;
  updatedAtLabel: string;
};

type PasswordRecord = {
  uid: string;
  username: string;
  password: string;
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
// Auto-detect documents from public/docs folder using Vite's glob feature
const docModules = import.meta.glob('/public/docs/*.{html,pdf,txt,md}');

const ADMIN_DOCS = Object.keys(docModules).map((filePath) => {
  const filename = filePath.split('/').pop() || '';
  
  // Process the filename into a clean, readable title
  const title = filename
    .replace(/\.(html|pdf|txt|md)$/i, '')
    .split(/[-_]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Assets in the public folder are served at the root level ("/") 
  const servePath = filePath.replace('/public', '');

  return {
    id: filename,
    title: title,
    description: `Auto-detected file: ${filename}`,
    path: servePath,
  };
});


const AVAILABLE_TABS = [
  { id: "create", label: "Create User" },
  { id: "edit", label: "Edit User" },
  { id: "forms", label: "Submitted Forms" },
  { id: "contacts", label: "Users & Passwords" },
  { id: "tickets", label: "Support Tickets" },
  { id: "docs", label: "Documentation" }
];
const Admin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<"admin" | "member" | "user" | null>(null);
  const [loggedInUserPermissions, setLoggedInUserPermissions] = useState<string[]>([]);
  const [ipLink, setIpLink] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  const [newUserUsername, setNewUserUsername] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserContactEmail, setNewUserContactEmail] = useState("");
  const [newUserContactMobile, setNewUserContactMobile] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "member" | "user">("user");
  const [newUserPermissions, setNewUserPermissions] = useState<string[]>([]);
  const [newUserIpLink, setNewUserIpLink] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [contactSearch, setContactSearch] = useState("");
  const [activeTicketCount, setActiveTicketCount] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUserUsername, setSelectedUserUsername] = useState("");
  const [selectedUserContactEmail, setSelectedUserContactEmail] = useState("");
  const [selectedUserContactMobile, setSelectedUserContactMobile] = useState("");
  const [selectedUserRole, setSelectedUserRole] = useState<"admin" | "member" | "user">("user");
  const [selectedUserPermissions, setSelectedUserPermissions] = useState<string[]>([]);
  const [selectedUserIpLink, setSelectedUserIpLink] = useState("");
  const [updatingUser, setUpdatingUser] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);
  const [activeSection, setActiveSection] = useState<"create" | "edit" | "forms" | "tickets" | "contacts" | "docs">("tickets");
  const [selectedDoc, setSelectedDoc] = useState<{ id: string; title: string; description: string; path: string } | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [loggedInUsername, setLoggedInUsername] = useState("");
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const [passwordRecords, setPasswordRecords] = useState<PasswordRecord[]>([]);
  const [passwordSearch, setPasswordSearch] = useState("");
  const [revealedPasswords, setRevealedPasswords] = useState<Set<string>>(new Set());

  const hasPermission = (tabId: string) => {
    if (userRole === "admin") return true;
    if (userRole === "member") return loggedInUserPermissions.includes(tabId);
    return false;
  };

  const handlePasswordChange = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

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
      // Save new password to userPasswords registry
      await setDoc(
        doc(db, "userPasswords", user.uid),
        {
          uid: user.uid,
          username: loggedInUsername || user.email || "",
          password: newPassword,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setNewPassword("");
      setConfirmPassword("");
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

  const toggleRevealPassword = (uid: string) => {
    setRevealedPasswords((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) {
        next.delete(uid);
      } else {
        next.add(uid);
      }
      return next;
    });
  };

  const handleCopyPassword = (password: string) => {
    navigator.clipboard.writeText(password);
    toast.success("Password copied to clipboard");
  };

  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const canShowDashboard = useMemo(() => Boolean(user && (isAdmin || userRole === "member")), [user, isAdmin, userRole]);
  const selectedUser = users.find((profile) => profile.id === selectedUserId) || null;
  const pageTitle = (isAdmin || userRole === "member") ? "Admin Console" : userRole === "user" ? "User Dashboard" : "Access Portal";
  const pageSubtitle = (isAdmin || userRole === "member")
    ? "User Management"
    : userRole === "user"
      ? "Your account details"
      : "Sign in to continue";
  const filteredUsers = useMemo(() => {
    const searchValue = userSearch.trim().toLowerCase();
    const visibleUsers = userRole === "member" ? users.filter(u => u.role === "user" && !u.isMember && !u.username.toLowerCase().includes("admin")) : users;

    if (!searchValue) {
      return visibleUsers;
    }
    return visibleUsers.filter((profile) => {
      return (
        profile.username.toLowerCase().includes(searchValue) ||
        profile.authEmail.toLowerCase().includes(searchValue) ||
        profile.role.toLowerCase().includes(searchValue) ||
        profile.id.toLowerCase().includes(searchValue) ||
        profile.ipLink.toLowerCase().includes(searchValue)
      );
    });
  }, [users, userSearch, userRole]);

  const filteredPasswords = useMemo(() => {
    const searchValue = passwordSearch.trim().toLowerCase();
    if (!searchValue) {
      return passwordRecords;
    }
    return passwordRecords.filter((record) => {
      return record.username.toLowerCase().includes(searchValue);
    });
  }, [passwordRecords, passwordSearch]);

  const filteredContacts = useMemo(() => {
    const baseUsers = userRole === "member" ? users.filter(u => u.role === "user" && !u.isMember && !u.username.toLowerCase().includes("admin")) : users;
    if (!contactSearch.trim()) return baseUsers;
    const q = contactSearch.toLowerCase();
    return baseUsers.filter(user => 
      user.id.toLowerCase().includes(q) ||
      user.username.toLowerCase().includes(q) ||
      (user.contactEmail && user.contactEmail.toLowerCase().includes(q)) ||
      (user.contactMobile && user.contactMobile.toLowerCase().includes(q))
    );
  }, [users, contactSearch, userRole]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      setIsAdmin(false);
      setUserRole(null);
      setIpLink("");
      setLoggedInUsername("");
      setShowPasswordFields(false);
      setStatus("");
      setSubmissions([]);
      setUsers([]);
      setUserSearch("");
      setActiveTicketCount(0);
      setSelectedUserId("");
      setSelectedUserUsername("");
      setSelectedUserContactEmail("");
      setSelectedUserContactMobile("");
      setSelectedUserRole("user");
      setSelectedUserPermissions([]);
      setSelectedUserIpLink("");
      setActiveSection("tickets");
      setPasswordRecords([]);
      setPasswordSearch("");
      setRevealedPasswords(new Set());

      if (!currentUser) {
        setCheckingAdmin(false);
        return;
      }

      setCheckingAdmin(true);
      try {
        const profileDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (profileDoc.exists()) {
          const data = profileDoc.data();
          const role = (data.isMember || data.role === "member") ? "member" : 
                       (data.role === "admin" || (data.username && data.username.toLowerCase().includes("admin"))) ? "admin" : "user";
          setUserRole(role);
          setLoggedInUserPermissions(data.permissions || []);
          setLoggedInUsername(data.username || "");
          if (role === "admin" || role === "member") {
            setIsAdmin(role === "admin");
            setStatus(`${role === "admin" ? "Admin" : "Member"} access confirmed.`);
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
            contactEmail: data.contactEmail || "",
            contactMobile: data.contactMobile || "",
            role: (data.isMember || data.role === "member") ? "member" : 
                  (data.role === "admin" || (data.username && data.username.toLowerCase().includes("admin"))) ? "admin" : "user",
            isMember: data.isMember || data.role === "member",
            permissions: data.permissions || [],
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
            setSelectedUserContactEmail(selected.contactEmail || "");
            setSelectedUserContactMobile(selected.contactMobile || "");
            setSelectedUserRole(selected.role);
            setSelectedUserPermissions(selected.permissions || []);
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

    const unsubscribeTickets = onSnapshot(
      collection(db, "tickets"),
      (snapshot) => {
        const activeCount = snapshot.docs.filter(d => d.data().status === "Active").length;
        setActiveTicketCount(activeCount);
      },
      (error) => console.error("Could not load tickets count", error)
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

    const unsubscribePasswords = onSnapshot(
      collection(db, "userPasswords"),
      (snapshot) => {
        const records: PasswordRecord[] = snapshot.docs.map((pwDoc) => {
          const data = pwDoc.data();
          return {
            uid: pwDoc.id,
            username: data.username || pwDoc.id,
            password: data.password || "",
            updatedAtLabel: formatTimestamp(data.updatedAt),
          };
        });
        // Sort by username
        records.sort((a, b) => a.username.localeCompare(b.username));
        setPasswordRecords(records);
      },
      (error) => setStatus(error.message || "Could not load passwords.")
    );

    return () => {
      unsubscribeUsers();
      unsubscribeSubmissions();
      unsubscribePasswords();
      unsubscribeTickets();
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

    if (!password) {
      setStatus("Password is required.");
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
        setStatus("User not found. Please check your username or contact admin.");
        return;
      }

      await signInWithEmailAndPassword(auth, authEmailToUse, password);
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      const code = firebaseError.code || "";

      let friendlyMessage = "Could not sign in. Please try again.";

      switch (code) {
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
          friendlyMessage = "Incorrect username or password. Please try again.";
          break;
        case "auth/invalid-email":
          friendlyMessage = "Invalid email format. Please check your input.";
          break;
        case "auth/user-disabled":
          friendlyMessage = "This account has been disabled. Please contact admin.";
          break;
        case "auth/too-many-requests":
          friendlyMessage = "Too many failed attempts. Please wait a few minutes and try again.";
          break;
        case "auth/network-request-failed":
          friendlyMessage = "Network error. Please check your internet connection.";
          break;
        case "auth/internal-error":
          friendlyMessage = "An internal error occurred. Please try again later.";
          break;
        default:
          friendlyMessage = firebaseError.message || "Could not sign in. Please try again.";
          break;
      }

      setStatus(friendlyMessage);
    }
  };

  const handleCreateUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hasPermission("create")) {
      setStatus("Only admins or authorized members can create users.");
      return;
    }
    const normalizedUsername = normalizeUsername(newUserUsername);

    if (!normalizedUsername || !newUserPassword || !newUserContactEmail || !newUserContactMobile) {
      setStatus("Username, password, contact email, and mobile are strictly required.");
      toast.error("Please fill all mandatory fields.");
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
          contactEmail: newUserContactEmail.trim(),
          contactMobile: newUserContactMobile.trim(),
          role: newUserRole === "member" ? "admin" : newUserRole,
          isMember: newUserRole === "member",
          permissions: newUserRole === "member" ? newUserPermissions : [],
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
        // Save password to registry
        await setDoc(doc(db, "userPasswords", credential.user.uid), {
          uid: credential.user.uid,
          username: newUserUsername.trim(),
          password: newUserPassword,
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
      setNewUserContactEmail("");
      setNewUserContactMobile("");
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
    setSelectedUserContactEmail(profile.contactEmail || "");
    setSelectedUserContactMobile(profile.contactMobile || "");
    setSelectedUserRole(profile.role);
    setSelectedUserIpLink(profile.ipLink);
    setStatus(`Selected ${profile.username}.`);
  };

  const handleCancelSelectedUser = () => {
    setSelectedUserId("");
    setSelectedUserUsername("");
    setSelectedUserContactEmail("");
    setSelectedUserContactMobile("");
    setSelectedUserRole("user");
    setSelectedUserPermissions([]);
    setSelectedUserIpLink("");
    setStatus("Edit cancelled.");
  };

  const handleUpdateUser = async () => {
    if (!hasPermission("edit") || !selectedUserId) {
      setStatus("You lack permission or need to select a user first.");
      return;
    }

    if (userRole === "member" && selectedUserRole !== "user") {
      setStatus("Unauthorized: Members can only edit normal users.");
      toast.error("You cannot modify Admin or Member accounts.");
      return;
    }

    setUpdatingUser(true);
    setStatus("");

    try {
      const normalizedUsername = normalizeUsername(selectedUserUsername);

    if (!normalizedUsername || !selectedUserContactEmail || !selectedUserContactMobile) {
      setStatus("Username, contact email, and mobile are required.");
      toast.error("Please fill all mandatory fields.");
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
          contactEmail: selectedUserContactEmail.trim(),
          contactMobile: selectedUserContactMobile.trim(),
          role: selectedUserRole === "member" ? "admin" : selectedUserRole,
          isMember: selectedUserRole === "member",
          permissions: selectedUserRole === "member" ? selectedUserPermissions : [],
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
    if (!hasPermission("edit") || !selectedUserId) {
      setStatus("You lack permission or need to select a user first.");
      return;
    }

    if (userRole === "member" && selectedUserRole !== "user") {
      setStatus("Unauthorized: Members can only delete normal users.");
      toast.error("You cannot delete Admin or Member accounts.");
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
      // Also remove from password registry
      await deleteDoc(doc(db, "userPasswords", selectedUserId)).catch(() => undefined);
      setSelectedUserId("");
      setSelectedUserUsername("");
      setSelectedUserRole("user");
      setSelectedUserPermissions([]);
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
      setNewUserContactEmail("");
      setNewUserContactMobile("");
      setSelectedUserId("");
      setSelectedUserUsername("");
      setSelectedUserContactEmail("");
      setSelectedUserContactMobile("");
      setSelectedUserRole("user");
      setSelectedUserPermissions([]);
      setSelectedUserIpLink("");
      setPasswordRecords([]);
      setRevealedPasswords(new Set());
      setActiveSection("tickets");
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

  // Full-page user dashboard for non-admin users
  if (user && userRole === "user" && !checkingAdmin) {
    return (
      <>
        <AppSidebar />
        <UserDashboard
          user={user}
          username={loggedInUsername}
          ipLink={ipLink}
          onSignOut={handleSignOut}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 pt-24 lg:pt-28 pb-8 text-foreground md:px-8">
      <AppSidebar />
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
            <h2 className="text-3xl font-bold">
              {user ? `Welcome, ${(loggedInUsername || 'User').replace(/\d+$/, '') || loggedInUsername || 'User'}` : "Login"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {user ? "You are securely signed in." : "Sign in with your username and password."}
            </p>

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
                {status && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400">
                    {status}
                  </div>
                )}
              </form>
            ) : (isAdmin || userRole === "member") ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-lg border border-border bg-secondary/30 p-4 text-sm">
                  <p className="font-medium text-primary">{isAdmin ? "System Admin" : "Team Member"}</p>
                  <p className="mt-1 truncate text-muted-foreground">
                    {loggedInUsername || (user?.email)}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-secondary/20 p-4 text-sm text-muted-foreground">
                  Use the sections on the right to create users, edit users, and review submissions.
                </div>
              </div>
            ) : userRole === "user" ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-lg border border-border bg-secondary/30 p-4 text-sm">
                  <p className="font-medium text-primary">User Account</p>
                  <p className="mt-1 truncate text-muted-foreground">
                    {loggedInUsername || (user?.email)}
                  </p>
                </div>
                <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-5 text-sm">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider text-[10px]">Dashboard Access</p>
                      <div className={`h-2 w-2 rounded-full ${ipLink ? "bg-green-500 animate-pulse" : "bg-yellow-500"}`} />
                    </div>

                    {ipLink ? (
                      <a
                        href={ipLink.startsWith("http") ? ipLink : `http://${ipLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 hover:shadow-blue-500/40 active:scale-[0.98]"
                      >
                        <Eye className="h-4 w-4 transition-transform group-hover:scale-110" />
                        Click here to show live dashboard
                      </a>
                    ) : (
                      <div className="flex items-center gap-2 rounded-lg bg-background/50 p-3 italic text-muted-foreground">
                        <Shield className="h-4 w-4 opacity-50" />
                        No IP link assigned yet.
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-secondary/10 p-4">
                  {!showPasswordFields ? (
                    <button
                      type="button"
                      onClick={() => setShowPasswordFields(true)}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background py-2.5 text-sm font-semibold transition hover:bg-secondary/40"
                    >
                      <Shield className="h-4 w-4 text-primary" />
                      Reset Password
                    </button>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          Set New Password
                        </p>
                        <button
                          onClick={() => setShowPasswordFields(false)}
                          className="text-[10px] text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                      <form className="space-y-3" onSubmit={handlePasswordChange}>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-muted-foreground">New Password</label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/40"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-muted-foreground">Confirm Password</label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/40"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={updatingPassword}
                          className="w-full rounded-md bg-primary py-2.5 text-xs font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
                        >
                          {updatingPassword ? "Updating..." : "Update Password"}
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-500">
                Your account does not have proper role assignment.
              </div>
            )}

            {(checkingAdmin || (user && status && !canShowDashboard)) && (
              <div className="mt-5 rounded-lg border border-border bg-secondary/20 p-4 text-xs text-muted-foreground animate-pulse">
                {checkingAdmin ? "Verifying permissions..." : status}
              </div>
            )}

          </section>

          {canShowDashboard && (
            <div className="space-y-6">
              <section className="rounded-2xl border border-border bg-card p-6 shadow-lg">
                <div className="flex flex-wrap items-center gap-3">
                  {hasPermission("create") && (<button
                    type="button"
                    onClick={() => setActiveSection("create")}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${activeSection === "create"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background hover:bg-secondary/40"
                      }`}
                  >
                    Create User
                  </button>)}
                  {hasPermission("edit") && (<button
                    type="button"
                    onClick={() => setActiveSection("edit")}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${activeSection === "edit"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background hover:bg-secondary/40"
                      }`}
                  >
                    Edit User
                  </button>)}
                  {hasPermission("forms") && (<button
                    type="button"
                    onClick={() => setActiveSection("forms")}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition flex items-center gap-2 ${activeSection === "forms"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background hover:bg-secondary/40"
                      }`}
                  >
                    Submitted Forms
                    {submissions.filter(s => s.status === "pending").length > 0 && (
                      <span className={`inline-flex items-center justify-center rounded-full text-[10px] font-bold h-5 w-5 ${activeSection === "forms" ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground"}`}>
                        {submissions.filter(s => s.status === "pending").length}
                      </span>
                    )}
                  </button>)}
                  {hasPermission("contacts") && (<button
                    type="button"
                    onClick={() => setActiveSection("contacts")}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition ${activeSection === "contacts"
                      ? "bg-purple-500 text-white"
                      : "border border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20"
                      }`}
                  >
                    <Users className="h-3.5 w-3.5" />
                    Users & Passwords
                  </button>)}

                  {hasPermission("tickets") && (<button
                    type="button"
                    onClick={() => setActiveSection("tickets")}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition flex items-center gap-2 ${activeSection === "tickets"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background hover:bg-secondary/40"
                      }`}
                  >
                    Support Tickets
                    {activeTicketCount > 0 && (
                      <span className={`inline-flex items-center justify-center rounded-full text-[10px] font-bold h-5 w-5 ${activeSection === "tickets" ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground"}`}>
                        {activeTicketCount}
                      </span>
                    )}
                  </button>)}
                  {hasPermission("docs") && (<button
                    type="button"
                    onClick={() => setActiveSection("docs")}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${activeSection === "docs"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background hover:bg-secondary/40"
                      }`}
                  >
                    Documentation
                  </button>)}
                </div>
              </section>

              {activeSection === "create" && hasPermission("create") && (
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
                        <label className="text-sm font-medium">Contact Email *</label>
                        <input
                          type="email"
                          value={newUserContactEmail}
                          onChange={(event) => setNewUserContactEmail(event.target.value)}
                          className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-primary/40"
                          placeholder="User's real email"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Contact Mobile *</label>
                        <input
                          type="tel"
                          value={newUserContactMobile}
                          onChange={(event) => setNewUserContactMobile(event.target.value)}
                          className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-primary/40"
                          placeholder="User's mobile number"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Role</label>
                        <select
                          value={newUserRole}
                          onChange={(event) => setNewUserRole(event.target.value as "admin" | "member" | "user")}
                          className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-primary/40"
                        >
                          <option value="user">Normal User</option>
                          {userRole === "admin" && (
                            <>
                              <option value="member">Member</option>
                              <option value="admin">Admin</option>
                            </>
                          )}
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

                    {newUserRole === "member" && (
                      <div className="space-y-3">
                        <label className="text-sm font-medium">Member Permissions</label>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                          {AVAILABLE_TABS.map((tab) => (
                            <label key={tab.id} className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={newUserPermissions.includes(tab.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewUserPermissions((prev) => [...prev, tab.id]);
                                  } else {
                                    setNewUserPermissions((prev) => prev.filter((id) => id !== tab.id));
                                  }
                                }}
                                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                              />
                              {tab.label}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
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

              {activeSection === "edit" && hasPermission("edit") && (
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
                            className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${selectedUserId === profile.id
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
                            <div className="mt-1 flex items-center justify-between">
                              <p className="truncate text-xs text-muted-foreground">{profile.id}</p>
                              {profile.contactEmail && (
                                <p className="truncate text-xs text-muted-foreground break-keep">{profile.contactEmail}</p>
                              )}
                            </div>
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
                            <label className="text-sm font-medium">Contact Email *</label>
                            <input
                              type="email"
                              value={selectedUserContactEmail}
                              onChange={(event) => setSelectedUserContactEmail(event.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-primary/40"
                              placeholder="User's email"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Contact Mobile *</label>
                            <input
                              type="tel"
                              value={selectedUserContactMobile}
                              onChange={(event) => setSelectedUserContactMobile(event.target.value)}
                              className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-primary/40"
                              placeholder="User's mobile"
                            />
                          </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Role</label>
                            <select
                              value={selectedUserRole}
                              onChange={(event) => setSelectedUserRole(event.target.value as "admin" | "member" | "user")}
                              className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-primary/40"
                            >
                              <option value="user">Normal User</option>
                              {userRole === "admin" && (
                                <>
                                  <option value="member">Member</option>
                                  <option value="admin">Admin</option>
                                </>
                              )}
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

                        {selectedUserRole === "member" && (
                          <div className="space-y-3">
                            <label className="text-sm font-medium">Member Permissions</label>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                              {AVAILABLE_TABS.map((tab) => (
                                <label key={tab.id} className="flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={selectedUserPermissions.includes(tab.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedUserPermissions((prev) => [...prev, tab.id]);
                                      } else {
                                        setSelectedUserPermissions((prev) => prev.filter((id) => id !== tab.id));
                                      }
                                    }}
                                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                  />
                                  {tab.label}
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
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
                                disabled={updatingUser || (userRole === "member" && selectedUserRole !== "user")}
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
                                disabled={deletingUser || (userRole === "member" && selectedUserRole !== "user")}
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

              {activeSection === "forms" && hasPermission("forms") && (
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

              {activeSection === "tickets" && hasPermission("tickets") && (
                <section className="rounded-2xl border border-border bg-card p-6 shadow-lg">
                  <AdminTickets />
                </section>
              )}

              {activeSection === "docs" && hasPermission("docs") && (
                <section className="rounded-2xl border border-border bg-card p-6 shadow-lg relative overflow-hidden">
                  <div>
                    <h2 className="text-2xl font-bold">Admin Documentation</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Internal reference guides and configuration documentation.
                    </p>
                  </div>
                  
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {ADMIN_DOCS.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => setSelectedDoc(doc)}
                        className="group relative flex flex-col items-start gap-2 rounded-xl border border-border bg-secondary/10 p-5 text-left transition-all hover:bg-secondary/30 hover:border-primary/30 hover:shadow-md cursor-pointer"
                      >
                        <div className="flex w-full items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-2 text-primary transition-all group-hover:bg-primary/20">
                              <FileText className="h-5 w-5" />
                            </div>
                            <h3 className="font-semibold">{doc.title}</h3>
                          </div>
                          <a
                            href={doc.path}
                            download={doc.id}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded-lg p-2 text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
                            title="Download document"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </div>
                        {doc.description && (
                          <p className="text-sm text-muted-foreground mt-2">{doc.description}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {selectedDoc && (
                    <div className="fixed inset-0 z-[100] flex flex-col bg-background animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex items-center justify-between border-b border-border p-4 bg-card shadow-sm">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" /> 
                          {selectedDoc.title}
                        </h2>
                        <div className="flex items-center gap-3">
                          <a
                            href={selectedDoc.path}
                            download={selectedDoc.id}
                            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition hover:bg-secondary/80 flex items-center gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </a>
                          <button
                            type="button"
                            onClick={() => setSelectedDoc(null)}
                            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition hover:bg-secondary/80 focus:outline-none"
                          >
                            Close Fullscreen
                          </button>
                        </div>
                      </div>
                      <div className="flex-1 overflow-hidden relative bg-background">
                        <iframe
                          src={selectedDoc.path}
                          className="absolute inset-0 w-full h-full border-none"
                          title={selectedDoc.title}
                        />
                      </div>
                    </div>
                  )}
                </section>
              )}

              {activeSection === "contacts" && hasPermission("contacts") && (
                <section className="rounded-2xl border border-border bg-card p-6 shadow-lg">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold">User Contacts</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        View communication details for all your administrative records.
                      </p>
                    </div>
                    <div className="flex items-center w-full md:w-auto relative">
                      <Search className="h-4 w-4 absolute left-3 text-muted-foreground" />
                      <input 
                        type="text" 
                        placeholder="Search by ID, email, or username..." 
                        value={contactSearch}
                        onChange={(e) => setContactSearch(e.target.value)}
                        className="w-full md:w-64 rounded-xl border border-border bg-background py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                  </div>
                  <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-background shadow-sm">
                    <table className="w-full text-left text-sm text-foreground">
                      <thead className="bg-secondary/40 text-muted-foreground border-b border-border">
                        <tr>
                          <th className="px-4 py-3 font-medium uppercase tracking-wider text-[11px]">Username</th>
                          <th className="px-4 py-3 font-medium uppercase tracking-wider text-[11px]">Email Address</th>
                          <th className="px-4 py-3 font-medium uppercase tracking-wider text-[11px]">Mobile Number</th>
                          <th className="px-4 py-3 font-medium uppercase tracking-wider text-[11px]">Password</th>
                          <th className="px-4 py-3 font-medium uppercase tracking-wider text-[11px]">Role</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredContacts.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground border-dashed">No matching users found.</td>
                          </tr>
                        ) : (
                          filteredContacts.map((profile) => {
                            const pwdRecord = passwordRecords.find((r) => r.uid === profile.id || r.username === profile.username);
                            const isRevealed = revealedPasswords.has(profile.id);
                            
                            return (
                            <tr key={profile.id} className="hover:bg-secondary/20 transition-colors">
                              <td className="px-4 py-3 font-medium">{profile.username}</td>
                              <td className="px-4 py-3 select-all">{profile.contactEmail || <span className="italic text-muted-foreground">None</span>}</td>
                              <td className="px-4 py-3 select-all">{profile.contactMobile || <span className="italic text-muted-foreground">None</span>}</td>
                              <td className="px-4 py-3">
                                {pwdRecord ? (
                                  <div className="flex items-center gap-1">
                                    <code
                                      className={`rounded px-2 py-1 font-mono text-sm ${isRevealed
                                        ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                                        : "bg-secondary/50 tracking-widest text-muted-foreground select-none"
                                        }`}
                                    >
                                      {isRevealed ? pwdRecord.password : "••••••••"}
                                    </code>
                                    <button
                                      type="button"
                                      onClick={() => toggleRevealPassword(profile.id)}
                                      title={isRevealed ? "Hide password" : "Show password"}
                                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
                                    >
                                      {isRevealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                    {isRevealed && (
                                      <button
                                        type="button"
                                        onClick={() => handleCopyPassword(pwdRecord.password)}
                                        title="Copy password"
                                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
                                      >
                                        <Copy className="h-4 w-4" />
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-xs italic text-muted-foreground">None</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider whitespace-nowrap ${profile.role === 'admin' ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-500' : profile.role === 'member' ? 'bg-teal-500/10 border-teal-500/30 text-teal-600 dark:text-teal-500' : 'bg-secondary border-border/50 text-muted-foreground'}`}>
                                  {profile.role}
                                </span>
                              </td>
                            </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
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
