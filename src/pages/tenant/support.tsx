import { useState, useEffect } from "react";
import { 
  LifeBuoy, 
  MessageSquare, 
  Phone, 
  Mail, 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  HelpCircle,
  ExternalLink,
  ChevronDown,
  Loader2,
  Ticket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'responded' | 'resolved';
  createdAt: string;
  description: string;
  messages: Array<{
    sender: 'user' | 'admin';
    senderName: string;
    content: string;
    timestamp: string;
  }>;
}

const FAQS = [
  {
    question: "How do I print receipts directly from the POS?",
    answer: "You can use the browser's standard print dialogue (Ctrl+P or Cmd+P) to print receipts to any connected thermal or standard printer."
  },
  {
    question: "Can I manage sales when the physical internet goes out?",
    answer: "Yes! Our system features an Offline Engine. You can continue scanning barcodes and logging cash transactions. Once your browser detects a cellular or Wi-Fi signal, all stored sales are automatically synchronized to the cloud."
  },
  {
    question: "What is Mobile Money (MoMo) integration?",
    answer: "We support automated push payments in Ghana (MTN MoMo and Telecel Cash). In the POS checkout, select 'Mobile Money'. Enter your customer's wallet number and name to trigger a payment request on their phone. Once verified, the cash register validates the inventory decrease automatically."
  },
  {
    question: "How do I adjust low stock alert levels for products?",
    answer: "Navigate to the 'Products & Stock' menu inside the sidebar. Click the 'Add Product' modal or edit an existing row to set a custom 'Low Stock Threshold'. If inventory level falls below that specific amount, a dynamic banner and glowing notification badge alert you promptly."
  }
];

export default function SupportPage() {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'request' | 'tickets' | 'faq'>('request');
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  
  // Ticket states
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  
  // Form states
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("POS & Printers");
  const [priority, setPriority] = useState<SupportTicket['priority']>("medium");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reply states
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  const storageKey = 'oboy_yankee_support_tickets';

  // Load tickets on mount
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setTickets(JSON.parse(saved));
      } catch (e) {
        setTickets([]);
      }
    }
  }, [storageKey]);

  // Handle support ticket submit
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      toast.error("Please fill in the subject and description fields.");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const newTicket: SupportTicket = {
      id: `NEX-TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: subject.trim(),
      category,
      priority,
      status: "open",
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      description: description.trim(),
      messages: [
        {
          sender: "user",
          senderName: user?.fullName || "Store Team Member",
          content: description.trim(),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
        }
      ]
    };

    const updatedTickets = [newTicket, ...tickets];
    setTickets(updatedTickets);
    localStorage.setItem(storageKey, JSON.stringify(updatedTickets));
    
    // Reset form
    setSubject("");
    setDescription("");
    setIsSubmitting(false);
    
    toast.success("Support Ticket Queued Successfully!", {
      description: `Ticket ${newTicket.id} has been registered and assigned to administrators.`,
    });
    
    setActiveTab('tickets');
  };

  // Submit chat reply message in ticket
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    setIsReplying(true);
    await new Promise(resolve => setTimeout(resolve, 600));

    const updatedMessages = [
      ...selectedTicket.messages,
      {
        sender: "user" as const,
        senderName: user?.fullName || "Store Representative",
        content: replyText.trim(),
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
      }
    ];

    // Simulate auto AI/admin response after 2 seconds
    const targetId = selectedTicket.id;
    setTimeout(() => {
      const liveSaved = localStorage.getItem(storageKey);
      if (liveSaved) {
        try {
          const liveTickets: SupportTicket[] = JSON.parse(liveSaved);
          const found = liveTickets.find(t => t.id === targetId);
          if (found && found.status !== 'resolved') {
            const adminReply = {
              sender: 'admin' as const,
              senderName: "Support Team",
              content: `Hello! I have recorded your latest message regarding: "${found.subject}". A representative will review this shortly. Thank you for your patience!`,
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
            };
            const autoUpdated = liveTickets.map(t => {
              if (t.id === targetId) {
                return {
                  ...t,
                  status: 'responded' as const,
                  messages: [...t.messages, adminReply]
                };
              }
              return t;
            });
            localStorage.setItem(storageKey, JSON.stringify(autoUpdated));
            setTickets(autoUpdated);
            if (selectedTicket?.id === targetId) {
              setSelectedTicket(prev => prev ? {
                ...prev,
                status: 'responded',
                messages: [...prev.messages, adminReply]
              } : null);
            }
          }
        } catch (err) {
          console.error(err);
        }
      }
    }, 1800);

    const updatedTickets = tickets.map(t => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          status: 'open' as const,
          messages: updatedMessages
        };
      }
      return t;
    });

    setTickets(updatedTickets);
    localStorage.setItem(storageKey, JSON.stringify(updatedTickets));
    setSelectedTicket(prev => prev ? { ...prev, status: 'open', messages: updatedMessages } : null);
    setReplyText("");
    setIsReplying(false);
  };

  const handleWhatsAppClick = () => {
    // Standard WhatsApp link for Ghana business support
    window.open("https://wa.me/233241234567?text=Hello%20OBOY%20YANKEE%20Support%2C%20I%20need%20assistance%20with%20my%20store%20dashboard.", "_blank");
  };

  const getPriorityBadgeColor = (p: SupportTicket['priority']) => {
    switch (p) {
      case 'critical': return "bg-red-500/20 text-red-500 border-red-500/30";
      case 'high': return "bg-amber-500/20 text-amber-500 border-amber-500/30";
      case 'medium': return "bg-emerald-500/20 text-emerald-500 border-emerald-500/30";
      default: return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  };

  const getStatusBadgeColor = (s: SupportTicket['status']) => {
    switch (s) {
      case 'open': return "bg-red-500 text-white";
      case 'responded': return "bg-emerald-500 text-black";
      default: return "bg-slate-800 text-slate-300";
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Premium Page Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-6 w-1 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">Service Center</span>
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white leading-none">Help & Support Desk</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px] mt-2 italic">Station: CONNECT-CENTER</p>
        </div>

        {/* Tab switcher buttons with high contrast styling */}
        <div className="flex gap-2 bg-slate-900 border border-white/5 p-1 rounded-2xl md:self-end shrink-0">
          {[
            { id: 'request', label: 'Submit Ticket' },
            { id: 'tickets', label: 'My Tickets' },
            { id: 'faq', label: 'FAQ Accordion' }
          ].map(tab => (
            <button
              type="button"
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSelectedTicket(null);
              }}
              className={cn(
                "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === tab.id
                  ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.2)] font-black"
                  : "text-slate-500 hover:text-slate-350"
              )}
            >
              {tab.label}
              {tab.id === 'tickets' && tickets.filter(t => t.status !== 'resolved').length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 rounded bg-red-500 text-white text-[9px] font-black">
                  {tickets.filter(t => t.status !== 'resolved').length}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Main Support Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column (2-grid of Active Activity) or Full depending on screen */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'request' && (
              <motion.div
                key="submit-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className="bg-slate-900/60 border-white/5 backdrop-blur-xl rounded-[32px] overflow-hidden">
                  <CardHeader className="p-8 border-b border-white/5 relative">
                    <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-emerald-500/0 via-emerald-500/40 to-emerald-500/0" />
                    <CardTitle className="text-xl font-black italic tracking-tighter uppercase text-white flex items-center gap-3">
                      <LifeBuoy className="h-5 w-5 text-emerald-500" />
                      Open a Tech Support Ticket
                    </CardTitle>
                    <CardDescription className="text-slate-500 font-bold uppercase tracking-widest text-[9px] italic mt-1">Our Engineers reply within 30 minutes during shop hours.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <form onSubmit={handleSubmitTicket} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Ticket Subject / Title</label>
                        <Input 
                          placeholder="e.g., POS checkout lag or custom receipt layout issue" 
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="h-14 bg-black/40 border-white/5 rounded-2xl px-6 font-bold text-white placeholder:text-slate-700 focus:border-emerald-500/30"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Inquiry Category</label>
                          <select 
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full h-14 bg-black/40 border border-white/5 rounded-2xl px-6 font-bold text-white text-sm outline-none focus:border-emerald-500/30"
                          >
                            <option value="POS & Printers" className="bg-slate-950">POS & Printers Hardware</option>
                            <option value="Payment & Subscription" className="bg-slate-950">Payments & Plan Billing</option>
                            <option value="Inventory & Stock" className="bg-slate-950">Inventory & Stock Adjustment</option>
                            <option value="General Question" className="bg-slate-950">General System Setup</option>
                          </select>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Priority Level</label>
                          <select 
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as any)}
                            className="w-full h-14 bg-black/40 border border-white/5 rounded-2xl px-6 font-bold text-white text-sm outline-none focus:border-emerald-500/30"
                          >
                            <option value="low" className="bg-slate-950 text-slate-300">Low - Routine Question</option>
                            <option value="medium" className="bg-slate-950 text-emerald-400">Medium - Important</option>
                            <option value="high" className="bg-slate-950 text-amber-500">High - Urgent Response</option>
                            <option value="critical" className="bg-slate-950 text-red-500">Critical - Core Shop Interrupted</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Describe the Issue / Assistance Request</label>
                        <Textarea 
                          placeholder="Please provide diagnostic details. Included device names, any error descriptions, or helpful references..." 
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={6}
                          className="bg-black/40 border-white/5 rounded-2xl p-6 font-bold text-white placeholder:text-slate-700 focus:border-emerald-500/30 resize-none"
                          required
                        />
                      </div>

                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black uppercase tracking-[0.25em] font-black text-[11px] font-bold shadow-xl shadow-emerald-500/10 gap-3"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Registering Support Case...
                          </>
                        ) : (
                          <>
                            <LifeBuoy className="h-4 w-4" />
                            Launch Support Ticket
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'tickets' && !selectedTicket && (
              <motion.div
                key="tickets-list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {tickets.length === 0 ? (
                  <div className="bg-slate-900/40 p-12 border border-dashed border-white/5 rounded-[32px] text-center">
                    <Ticket className="h-10 w-10 text-slate-700 mx-auto mb-4" />
                    <p className="text-white font-black uppercase text-xs tracking-widest leading-none mb-1">No Active Tickets</p>
                    <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest font-mono">Any submitted technical tickets will be tracked right here.</p>
                  </div>
                ) : (
                  tickets.map((ticket) => (
                    <div 
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className="group p-6 bg-slate-900 border border-white/5 hover:border-emerald-500/20 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 cursor-pointer transition-all hover:translate-x-1"
                    >
                      <div className="space-y-2 min-w-0">
                        <div className="flex items-center gap-2">
                          <code className="text-[10px] font-black font-mono text-emerald-500 bg-emerald-500/5 px-2.5 py-1 rounded border border-emerald-500/10">{ticket.id}</code>
                          <Badge variant="outline" className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-0.5", getPriorityBadgeColor(ticket.priority))}>
                            {ticket.priority} priority
                          </Badge>
                          <span className="text-slate-500 font-bold text-[9px] font-mono leading-none italic">{ticket.createdAt}</span>
                        </div>
                        <h3 className="text-sm font-black italic uppercase text-white truncate max-w-lg group-hover:text-emerald-400 transition-colors">{ticket.subject}</h3>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{ticket.category} • Messages ({ticket.messages.length})</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        <Badge className={cn("px-2.5 py-1 font-black uppercase tracking-widest text-[8px] border-none rounded-md rounded-br-none", getStatusBadgeColor(ticket.status))}>
                          {ticket.status}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-slate-700 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'tickets' && selectedTicket && (
              <motion.div
                key="ticket-chat"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-6"
              >
                {/* Back Link */}
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:underline flex items-center gap-1.5"
                >
                  ← Return to Tickets Dashboard
                </button>

                {/* Chat Container */}
                <Card className="bg-slate-900/60 border-white/5 rounded-[32px] overflow-hidden">
                  <header className="p-8 border-b border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-black/20">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-black font-mono text-emerald-500 bg-emerald-500/5 px-2.5 py-1 rounded border border-emerald-500/10">{selectedTicket.id}</code>
                        <Badge className={cn("px-2.5 py-1 font-black uppercase tracking-widest text-[8px] border-none", getStatusBadgeColor(selectedTicket.status))}>
                          {selectedTicket.status}
                        </Badge>
                      </div>
                      <h2 className="text-lg font-black italic uppercase text-white leading-tight mt-1">{selectedTicket.subject}</h2>
                      <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest leading-none">Inquiry Desk: {selectedTicket.category}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={cn("text-[9px] font-black uppercase tracking-widest px-3 py-1", getPriorityBadgeColor(selectedTicket.priority))}>
                        {selectedTicket.priority}
                      </Badge>
                    </div>
                  </header>

                  <CardContent className="p-8 space-y-6">
                    {/* Thread messaging views */}
                    <div className="space-y-4 max-h-[350px] overflow-y-auto no-scrollbar pr-1">
                      {selectedTicket.messages.map((msg, idx) => (
                        <div 
                          key={idx}
                          className={cn(
                            "flex flex-col max-w-[85%] p-4 rounded-2xl text-xs font-bold leading-relaxed",
                            msg.sender === "admin"
                              ? "bg-slate-800 text-slate-100 rounded-bl-none border border-white/5 mr-auto"
                              : "bg-emerald-500/10 text-emerald-400 rounded-br-none border border-emerald-500/10 ml-auto"
                          )}
                        >
                          <div className="flex items-center justify-between gap-4 mb-2">
                            <span className={cn(
                              "text-[8px] font-black uppercase tracking-widest",
                              msg.sender === "admin" ? "text-emerald-500" : "text-white/60"
                            )}>{msg.senderName}</span>
                            <span className="text-[8px] text-slate-500 leading-none">{msg.timestamp}</span>
                          </div>
                          <div>{msg.content}</div>
                        </div>
                      ))}
                    </div>

                    {/* Chat Reply Area */}
                    <form onSubmit={handleSendReply} className="border-t border-white/5 pt-6 flex gap-3">
                      <Input 
                        placeholder="Type updates or add diagnostic follow-up notes..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        disabled={selectedTicket.status === 'resolved'}
                        className="flex-1 h-14 bg-black/40 border-white/5 rounded-2xl px-6 font-bold text-white placeholder:text-slate-700 focus:border-emerald-500/30 text-sm"
                        required
                      />
                      <Button 
                        type="submit" 
                        disabled={isReplying || selectedTicket.status === 'resolved'}
                        className="h-14 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black uppercase tracking-widest font-black text-[10px]"
                      >
                        {isReplying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'faq' && (
              <motion.div
                key="faq-accordions"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-4"
              >
                {FAQS.map((faq, idx) => (
                  <div 
                    key={idx} 
                    className="bg-slate-900 border border-white/5 hover:border-white/10 rounded-2xl overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left gap-4"
                    >
                      <span className="text-xs font-black italic uppercase tracking-wider text-white flex items-center gap-3">
                        <HelpCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                        {faq.question}
                      </span>
                      <ChevronDown className={cn("h-4 w-4 text-slate-500 transition-transform shrink-0", faqOpen === idx && "rotate-180 text-white")} />
                    </button>
                    
                    <AnimatePresence>
                      {faqOpen === idx && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                        >
                          <div className="px-6 pb-6 pt-1 text-slate-400 font-bold text-xs leading-relaxed border-t border-white/[0.02]">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column (Standard Contacts & Fast Dial Info) */}
        <div className="space-y-6">
          <Card className="bg-slate-900/60 border-white/5 backdrop-blur-xl rounded-[32px] overflow-hidden">
            <CardHeader className="p-8 border-b border-white/5 relative bg-black/10">
              <CardTitle className="text-md font-black italic tracking-tighter uppercase text-white">Fast-Dial Helpdesks</CardTitle>
              <CardDescription className="text-slate-500 font-bold uppercase tracking-widest text-[8px] italic leading-none mt-1">Resolve issues immediately via support hotlines in Ghana.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              
              {/* WhatsApp Premium Contact Card */}
              <div 
                onClick={handleWhatsAppClick}
                className="group p-5 rounded-2xl bg-emerald-500/[0.03] hover:bg-emerald-500/[0.06] border border-emerald-500/10 hover:border-emerald-500/20 cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-emerald-400 leading-none mb-1">WhatsApp Live Support</h4>
                    <p className="text-slate-500 font-bold text-[9px] uppercase tracking-tighter leading-none">Instant Help over WhatsApp</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-emerald-500 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Direct Voice Line Card */}
              <a 
                href="tel:+233241234567"
                className="group p-5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-white shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-200 leading-none mb-1">Ghana Phone Helpline</h4>
                    <p className="text-slate-500 font-bold text-[9px] uppercase tracking-tighter leading-none">+233 241 234 567</p>
                  </div>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-slate-500 group-hover:text-white transition-colors" />
              </a>

              {/* Email Support Card */}
              <a 
                href="mailto:support@oboyyankee.com"
                className="group p-5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-white shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-200 leading-none mb-1">Standard Email Ticket</h4>
                    <p className="text-slate-500 font-bold text-[9px] uppercase tracking-tighter leading-none">support@oboyyankee.com</p>
                  </div>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-slate-500 group-hover:text-white transition-colors" />
              </a>

              <div className="pt-4 border-t border-white/[0.03] space-y-2">
                <div className="flex items-center gap-2 text-slate-500 text-[9px] font-black uppercase tracking-widest font-mono">
                  <Clock className="h-3.5 w-3.5 text-emerald-500" />
                  Hours: Mon - Sat (8am - 8pm UTC)
                </div>
                <p className="text-slate-600 font-bold text-[9px] uppercase tracking-tighter italic">Emergency critical server reports are continuously triaged 24/7/365.</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Support Notice badge */}
          <div className="p-6 bg-slate-900/30 rounded-2xl border border-white/5 text-center space-y-2">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Platform Guard SEC-1</h5>
            <p className="text-slate-500 font-bold text-[9px] uppercase tracking-wider leading-relaxed">All support channels transmit via secure encrypted tunnels protecting inventory balance reports and checkout logs.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
