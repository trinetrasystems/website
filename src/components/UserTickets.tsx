import { useState, useEffect, FormEvent } from "react";
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { type User } from "firebase/auth";
import { motion } from "framer-motion";
import { Plus, Tag, Clock, Activity, MessageSquare, Paperclip, ChevronRight, X, AlertCircle } from "lucide-react";
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
  replies: Array<{ message: string; role: string; timestamp: any }>;
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
      let docs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Ticket));
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

      toast.success("Your support ticket has been created with Ticket ID: ${generatedTicketNumber}. We'll reach out to you as soon as possible.");
      
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
    switch (status) {
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
              {tickets.map((ticket, index) => (
                <motion.div
                  key={ticket.id}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={index}
                  className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-all group"
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                        <span className="text-xs font-bold text-foreground bg-secondary/50 px-2 py-0.5 rounded border border-border/60">
                          {ticket.ticketNumber || ticket.id.slice(0,8)}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/30 px-2 py-0.5 rounded-md border border-border/50">
                          <Tag className="h-3 w-3" />
                          {ticket.category}
                        </span>
                      </div>
                      <h4 className="text-[15px] font-bold text-foreground">
                        {ticket.title}
                      </h4>
                      <p className="text-[13px] text-muted-foreground line-clamp-2 mt-1 w-full sm:w-[90%]">
                        {ticket.description}
                      </p>
                    </div>
                    
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 border-border/50 pt-3 sm:pt-0 mt-3 sm:mt-0">
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Created: {formatDate(ticket.createdAt)}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Activity className="h-3 w-3" />
                        Updated: {formatDate(ticket.updatedAt)}
                      </div>
                    </div>
                  </div>

                  {ticket.replies && ticket.replies.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border/60">
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Replies ({ticket.replies.length})
                      </h5>
                      <div className="space-y-3 pl-2 border-l-2 border-border">
                        {ticket.replies.map((reply, i) => (
                          <div key={i} className={`text-sm p-3 rounded-lg ${reply.role === 'admin' ? 'bg-primary/[0.05] border border-primary/10' : 'bg-secondary/40'}`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-xs font-bold ${reply.role === 'admin' ? 'text-primary' : 'text-foreground'}`}>
                                {reply.role === 'admin' ? 'Support Team' : 'You'}
                              </span>
                              <span className="text-[10px] text-muted-foreground">{formatDate(reply.timestamp)}</span>
                            </div>
                            <p className="text-[13px] text-foreground/90">{reply.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
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
      viewBox="0 24"
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
