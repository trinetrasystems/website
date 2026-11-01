import { useState, useEffect, FormEvent } from "react";
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { notifyNewTicket } from "@/lib/notify";
import { hasUnread, normalizeTicketStatus, ticketNumberOf, useMarkOpenTicketRead, type LegacyReply } from "@/lib/tickets";
import TicketChat from "@/components/TicketChat";
import { type User } from "firebase/auth";
import { motion } from "framer-motion";
import { Plus, Tag, Clock, Activity, MessageSquare, ChevronDown, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface UserTicketsProps {
  user: User;
  username: string;
}

type Ticket = {
  id: string;
  ticketNumber: string;
  userId: string;
  title: string;
  category: string;
  status: string;
  createdAt: any;
  updatedAt: any;
  description: string;
  replies?: LegacyReply[];
  lastMessageFrom?: string;
  lastMessageAt?: any;
  userReadAt?: any;
};

const CATEGORIES = [
  "System Down / No Alerts",
  "Detection Not Working",
  "New Feature Request",
  "Other / Not Listed"
];

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function UserTickets({ user, username }: UserTicketsProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // New ticket form state
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [userProfile, setUserProfile] = useState<{ contactEmail?: string, contactMobile?: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [openTicketId, setOpenTicketId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    
    // Fetch user profile data
    const fetchProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserProfile({
            contactEmail: data.contactEmail || user.email || "",
            contactMobile: data.contactMobile || ""
          });
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
      }
    };
    fetchProfile();

    const q = query(
      collection(db, "tickets"),
      where("userId", "==", user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Set `id` from the doc id last so a persisted `id` field can't shadow it.
      let docs = snapshot.docs.map(doc => {
        // "estimate": just-written server timestamps show as now instead of null.
        const data = doc.data({ serverTimestamps: "estimate" });
        return { ...data, id: doc.id, ticketNumber: ticketNumberOf(data, doc.id) } as Ticket;
      });
      // Client-side sort to avoid Firebase Composite Index requirement
      docs.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA; 
      });
      setTickets(docs);
      setLoading(false);
    }, (error: any) => {
      console.error("Error fetching tickets:", error);
      toast.error(`Failed to load tickets: ${error?.message || "Unknown error"}`);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Opening a ticket — or a new message arriving while it is open — marks it read.
  useMarkOpenTicketRead(tickets, openTicketId, "user");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title || !description || !category) {
      toast.error("Please fill all required fields.");
      return;
    }
    
    setSubmitting(true);
    
    // Generate a generic 6-digit ticket number
    const generatedTicketNumber = "TKT-" + Math.floor(100000 + Math.random() * 900000).toString();

    try {
      const docRef = await addDoc(collection(db, "tickets"), {
        ticketNumber: generatedTicketNumber,
        userId: user.uid,
        userEmail: userProfile?.contactEmail || user.email || "",
        userName: username || user.email || "User",
        category,
        title,
        description,
        phone: userProfile?.contactMobile || "",
        status: "Active",
        severity: "Medium", // Default severity
        replies: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success(`Your support ticket has been created with Ticket ID: ${generatedTicketNumber}. We'll reach out to you as soon as possible.`);

      // Alert support@ right away. Best-effort: the ticket is already saved.
      notifyNewTicket(docRef.id).then((mail) => {
        if (!mail.ok) console.warn("Ticket saved, but the support email failed:", mail.error);
      });
      
      setTitle("");
      setDescription("");
      setCategory(CATEGORIES[0]);
      setShowForm(false);
    } catch (error: any) {
      console.error(error);
      toast.error(`Failed to create ticket: ${error?.message || "Unknown error"}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (normalizeTicketStatus(status)) {
      case "Active": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "In Progress": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "Solved": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      default: return "bg-secondary text-muted-foreground border-border";
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp?.toDate) return "Just now";
    return format(timestamp.toDate(), "MMM d, yyyy • h:mm a");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Support Tickets</h2>
          <p className="text-sm text-muted-foreground">Manage your support requests and issues</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            New Ticket
          </button>
        )}
      </div>

      {showForm && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-border bg-card shadow-lg p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/[0.03] rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Create Support Ticket
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="p-2 rounded-lg bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all text-sm"
                  required
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Title (Short) *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary of the issue"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide detailed information about your issue..."
                rows={4}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all text-sm resize-none"
                required
              />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl border border-border bg-secondary/50 hover:bg-secondary text-sm font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 text-sm font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
              >
                {submitting ? "Submitting..." : "Submit Ticket"}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {!showForm && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 border border-border border-dashed rounded-2xl text-muted-foreground">
               Loading tickets...
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-16 border border-border border-dashed rounded-2xl bg-secondary/20">
              <div className="mx-auto w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-4">
                <TicketIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">No tickets yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
                If you are experiencing any issues or have questions, feel free to create a support ticket.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/20 transition-all border border-primary/20"
              >
                <Plus className="h-4 w-4" />
                Create First Ticket
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {tickets.map((ticket) => {
                const isOpen = openTicketId === ticket.id;
                const unread = hasUnread(ticket, "user");
                const status = normalizeTicketStatus(ticket.status);
                const toggle = () => setOpenTicketId(isOpen ? null : ticket.id);
                return (
                  <motion.div
                    key={ticket.id}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    data-testid="user-ticket"
                    className={`rounded-xl border bg-card transition-all ${isOpen ? "border-primary/30 shadow-md" : "border-border hover:border-primary/30"}`}
                  >
                    <button
                      type="button"
                      onClick={toggle}
                      aria-expanded={isOpen}
                      className="w-full p-4 text-left sm:p-5"
                    >
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:gap-4">
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${getStatusColor(ticket.status)}`}>
                              {status}
                            </span>
                            <span className="rounded border border-border/60 bg-secondary/50 px-2 py-0.5 text-xs font-bold text-foreground">
                              {ticket.ticketNumber || ticket.id.slice(0, 8)}
                            </span>
                            <span className="flex items-center gap-1.5 rounded-md border border-border/50 bg-secondary/30 px-2 py-0.5 text-xs text-muted-foreground">
                              <Tag className="h-3 w-3" />
                              {ticket.category}
                            </span>
                            {unread && (
                              <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground" data-testid="ticket-unread">
                                New reply
                              </span>
                            )}
                          </div>
                          <h4 className="break-words text-[15px] font-bold text-foreground">{ticket.title}</h4>
                          {!isOpen && <p className="mt-1 line-clamp-2 break-words text-[13px] text-muted-foreground">{ticket.description}</p>}
                        </div>

                        <div className="flex shrink-0 flex-row items-center justify-between gap-3 border-t border-border/50 pt-3 sm:flex-col sm:items-end sm:justify-center sm:border-t-0 sm:pt-0">
                          <div className="space-y-1 text-[11px] text-muted-foreground">
                            <div className="flex items-center gap-1.5 sm:justify-end">
                              <Clock className="h-3 w-3" />
                              Created: {formatDate(ticket.createdAt)}
                            </div>
                            <div className="flex items-center gap-1.5 sm:justify-end">
                              <Activity className="h-3 w-3" />
                              Updated: {formatDate(ticket.updatedAt)}
                            </div>
                          </div>
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                            <MessageSquare className="h-3.5 w-3.5" />
                            {isOpen ? "Hide conversation" : "Open conversation"}
                            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                          </span>
                        </div>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="space-y-4 border-t border-border/60 p-4 sm:p-5">
                        <div>
                          <h5 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</h5>
                          <p className="whitespace-pre-wrap break-words text-sm text-foreground/90">{ticket.description}</p>
                        </div>
                        <div>
                          <h5 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <MessageSquare className="h-3.5 w-3.5" />
                            Conversation with Trinetra Support
                          </h5>
                          <TicketChat
                            ticketId={ticket.id}
                            replies={ticket.replies}
                            viewer="user"
                            author={{ uid: user.uid, name: username || "Customer" }}
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TicketIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" />
      <path d="M13 17v2" />
      <path d="M13 11v2" />
    </svg>
  );
}
