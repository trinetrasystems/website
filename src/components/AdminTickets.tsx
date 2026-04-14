import { useState, useEffect } from "react";
import { collection, query, onSnapshot, doc, updateDoc, serverTimestamp, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Search, Filter, MessageSquare, AlertTriangle, CheckCircle, Clock, Paperclip, ChevronDown, Save, Send } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type Ticket = {
  id: string;
  ticketNumber?: string;
  userId: string;
  userEmail: string;
  userName: string;
  phone: string;
  category: string;
  title: string;
  description: string;
  status: string;
  severity: string;
  replies: Array<{ message: string; role: string; timestamp: any }>;
  createdAt: any;
  updatedAt: any;
};

const CATEGORIES = ["All", "System Down / No Alerts", "Detection Not Working", "New Feature Request", "Other / Not Listed"];
const STATUSES = ["All", "Active", "In Progress", "Solved"];
const SEVERITIES = ["All", "Low", "Medium", "High", "Critical"];

export default function AdminTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterSeverity, setFilterSeverity] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Actions
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "tickets"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ticket));
      // Client-side sort to avoid Firebase Index requirement
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
  }, []);

  const filteredTickets = tickets.filter(t => {
    if (filterCategory !== "All" && t.category !== filterCategory) return false;
    if (filterStatus !== "All" && t.status !== filterStatus) return false;
    if (filterSeverity !== "All" && (t.severity || "Medium") !== filterSeverity) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.id.toLowerCase().includes(q) ||
        (t.ticketNumber && t.ticketNumber.toLowerCase().includes(q)) ||
        t.userEmail.toLowerCase().includes(q) ||
        t.userId.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const updateTicket = async (ticketId: string, updates: Partial<Ticket>) => {
    try {
      await updateDoc(doc(db, "tickets", ticketId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
      toast.success("Ticket updated successfully");
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast.error("Failed to update ticket");
    }
  };

  const handleReply = async (ticketId: string) => {
    if (!replyMessage.trim()) return;
    setSendingReply(true);
    try {
      await updateDoc(doc(db, "tickets", ticketId), {
        replies: arrayUnion({
          message: replyMessage,
          role: "admin",
          timestamp: new Date()
        }),
        updatedAt: serverTimestamp()
      });
      setReplyMessage("");
      toast.success("Reply sent");
    } catch (error) {
      console.error("Error replying:", error);
      toast.error("Failed to send reply");
    } finally {
      setSendingReply(false);
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Low": return "text-emerald-500";
      case "Medium": return "text-blue-500";
      case "High": return "text-orange-500";
      case "Critical": return "text-red-500 font-bold";
      default: return "text-muted-foreground";
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp?.toDate && !(timestamp instanceof Date)) return "Just now";
    const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
    return format(date, "MMM d, yyyy • h:mm a");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Support Tickets</h2>
          <p className="text-sm text-muted-foreground">Manage user support requests</p>
        </div>
        
        <div className="flex items-center gap-2 pl-4 border-l border-border/50 hidden md:flex">
          <div className="text-center px-4">
            <p className="text-2xl font-bold text-blue-500">{tickets.filter(t => t.status === "Active").length}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active</p>
          </div>
          <div className="text-center px-4">
            <p className="text-2xl font-bold text-amber-500">{tickets.filter(t => t.status === "In Progress").length}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">In Progress</p>
          </div>
          <div className="text-center px-4">
            <p className="text-2xl font-bold text-emerald-500">{tickets.filter(t => t.status === "Solved").length}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Solved</p>
          </div>
        </div>
      </div>

      {/* Filters Overlay */}
      <div className="grid gap-4 md:grid-cols-4 rounded-xl border border-border bg-card p-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Filter className="h-3 w-3" /> Category
          </label>
          <select 
            value={filterCategory} 
            onChange={e => setFilterCategory(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/40"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</label>
          <select 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/40"
          >
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Severity</label>
          <select 
            value={filterSeverity} 
            onChange={e => setFilterSeverity(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/40"
          >
            {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Search className="h-3 w-3" /> Search
          </label>
          <input 
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="TKT-XXX, UID, email..."
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/40"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">Loading tickets...</div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
          <CheckCircle className="mx-auto h-8 w-8 mb-3 opacity-20" />
          No tickets found matching your criteria.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map(ticket => {
            const isExpanded = expandedTicket === ticket.id;
            return (
              <div key={ticket.id} className="rounded-xl border border-border bg-card overflow-hidden transition-all hover:border-border/80 shadow-sm">
                {/* Header / Summary */}
                <div 
                  className="p-4 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                  onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)}
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                      <span className={`text-[11px] font-bold flex items-center gap-1 ${getSeverityColor(ticket.severity || "Medium")}`}>
                        <AlertTriangle className="h-3 w-3" />
                        {ticket.severity || "Medium"}
                      </span>
                      <span className="text-[11px] font-bold text-foreground px-1.5 py-0.5 rounded bg-secondary/50 border border-border/60">
                        {ticket.ticketNumber || ticket.id.slice(0,8)}
                      </span>
                    </div>
                    <h3 className="font-bold text-[15px]">{ticket.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{ticket.userEmail}</span>
                      {ticket.phone && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <span>{ticket.phone}</span>
                        </>
                      )}
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span>{formatDate(ticket.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{ticket.category}</p>
                      <p className="text-xs text-muted-foreground flex items-center justify-end gap-1 mt-1">
                        <MessageSquare className="h-3 w-3" />
                        {ticket.replies?.length || 0}
                      </p>
                    </div>
                    <div className={`p-1.5 rounded-md transition-colors ${isExpanded ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                      <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-border bg-secondary/10 p-4 space-y-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 space-y-4">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Description</h4>
                          <div className="text-sm bg-background p-4 rounded-xl border border-border/50 text-foreground/90 whitespace-pre-wrap">
                            {ticket.description}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                            <MessageSquare className="h-3.5 w-3.5" />
                            Conversation History
                          </h4>
                          <div className="space-y-3 bg-background p-4 rounded-xl border border-border/50">
                            {(!ticket.replies || ticket.replies.length === 0) ? (
                              <p className="text-sm text-muted-foreground italic">No replies yet.</p>
                            ) : (
                              ticket.replies.map((reply, i) => (
                                <div key={i} className={`p-3 rounded-lg text-sm ${reply.role === 'admin' ? 'bg-primary/10 border border-primary/20 ml-6' : 'bg-secondary/50 border border-border/50 mr-6'}`}>
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className={`font-bold text-[11px] uppercase tracking-wider ${reply.role === 'admin' ? 'text-primary' : 'text-foreground'}`}>
                                      {reply.role === 'admin' ? 'Admin (You)' : 'User'}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">{formatDate(reply.timestamp)}</span>
                                  </div>
                                  <p className="text-foreground/90 leading-relaxed">{reply.message}</p>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Send Reply</h4>
                          <div className="flex gap-2">
                            <textarea 
                              value={replyMessage}
                              onChange={e => setReplyMessage(e.target.value)}
                              placeholder="Type your response here..."
                              className="flex-1 rounded-xl border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                              rows={2}
                            />
                            <button
                              onClick={() => handleReply(ticket.id)}
                              disabled={sendingReply || !replyMessage.trim()}
                              className="rounded-xl bg-primary px-4 py-2 text-primary-foreground font-bold transition hover:opacity-90 disabled:opacity-50 flex items-center justify-center h-fit"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Admin Actions */}
                      <div className="space-y-4">
                        <div className="bg-background rounded-xl border border-border/50 p-4 space-y-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b border-border/50 pb-2">
                            <Save className="h-3.5 w-3.5" />
                            Ticket Actions
                          </h4>
                          
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-foreground">Change Status</label>
                            <div className="grid grid-cols-1 gap-2">
                              <button
                                onClick={() => updateTicket(ticket.id, { status: "Active" })}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border text-left transition-colors ${ticket.status === "Active" ? "bg-blue-500/10 border-blue-500/30 text-blue-500 font-bold" : "bg-secondary/30 border-transparent hover:bg-secondary"}`}
                              >
                                Active
                              </button>
                              <button
                                onClick={() => updateTicket(ticket.id, { status: "In Progress" })}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border text-left transition-colors ${ticket.status === "In Progress" ? "bg-amber-500/10 border-amber-500/30 text-amber-500 font-bold" : "bg-secondary/30 border-transparent hover:bg-secondary"}`}
                              >
                                Mark In Progress
                              </button>
                              <button
                                onClick={() => updateTicket(ticket.id, { status: "Solved" })}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border text-left transition-colors flex items-center gap-1.5 ${ticket.status === "Solved" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 font-bold" : "bg-secondary/30 border-transparent hover:bg-secondary"}`}
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                                Mark Solved
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-border/50">
                            <label className="text-[11px] font-bold text-foreground">Change Severity</label>
                            <select
                              value={ticket.severity || "Medium"}
                              onChange={(e) => updateTicket(ticket.id, { severity: e.target.value })}
                              className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary/40"
                            >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                              <option value="Critical">Critical</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
