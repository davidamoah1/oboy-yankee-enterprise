import { useState, useMemo } from "react";
import { 
  Search, 
  Filter, 
  MessageSquare, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertCircle,
  MoreHorizontal,
  ChevronRight,
  Send,
  UserPlus,
  Trash2,
  Inbox,
  History as HistoryIcon,
  LifeBuoy,
  Plus,
  ArrowUpDown,
  Lock,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { Ticket, TicketMessage, TicketPriority, TicketStatus } from "@/types/super-admin";

const INITIAL_TICKETS: Ticket[] = [
  { 
    id: "TKT-441", 
    tenant: "Accra Mart", 
    tenantId: "1",
    subject: "MoMo Payment integration failing on POS-02", 
    priority: "critical", 
    status: "open", 
    assignee: null, 
    lastUpdate: "10 mins ago",
    createdAt: "2024-05-11 10:00",
    messages: [
      { id: "m1", senderId: "u1", senderName: "Kofi Mensah", senderRole: "user", content: "We are trying to process MoMo payments but it keeps timing out on POS-02.", timestamp: "2024-05-11 10:00" }
    ]
  },
  { 
    id: "TKT-432", 
    tenant: "Kumasi Elec", 
    tenantId: "2",
    subject: "Request for higher SKUs limit in Business Plan", 
    priority: "medium", 
    status: "responded", 
    assignee: "Kofi Admin", 
    lastUpdate: "2 hours ago",
    createdAt: "2024-05-11 08:30",
    messages: [
      { id: "m1", senderId: "u2", senderName: "Ama Serwaa", senderRole: "user", content: "Can we increase our SKU limit? We are hitting the Business plan cap.", timestamp: "2024-05-11 08:30" },
      { id: "m2", senderId: "a1", senderName: "Kofi Admin", senderRole: "admin", content: "I'll check with the product team on this.", timestamp: "2024-05-11 08:45" }
    ]
  },
  { 
    id: "TKT-415", 
    tenant: "Tamale Fashion", 
    tenantId: "3",
    subject: "Dispute over last monthly subscription charge", 
    priority: "high", 
    status: "open", 
    assignee: null, 
    lastUpdate: "5 hours ago",
    createdAt: "2024-05-11 05:00",
    messages: [
      { id: "m1", senderId: "u3", senderName: "Ibrahim Ali", senderRole: "user", content: "We were charged twice for the month of April.", timestamp: "2024-05-11 05:00" }
    ]
  },
  { 
    id: "TKT-390", 
    tenant: "Adisadel Books", 
    tenantId: "5",
    subject: "Unable to export inventory CSV", 
    priority: "low", 
    status: "resolved", 
    assignee: "Ama Admin", 
    lastUpdate: "1 day ago",
    createdAt: "2024-05-10 14:00",
    messages: [
      { id: "m1", senderId: "u4", senderName: "John Doe", senderRole: "user", content: "The CSV export button isn't downloading anything.", timestamp: "2024-05-10 14:00" },
      { id: "m2", senderId: "a2", senderName: "Ama Admin", senderRole: "admin", content: "This was a known bug, we've pushed a fix.", timestamp: "2024-05-10 14:15" },
      { id: "m3", senderId: "u4", senderName: "John Doe", senderRole: "user", content: "Confirmed, it works now. Thanks!", timestamp: "2024-05-10 14:20" }
    ]
  },
];

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all');
  
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; ticketId: string | null; action: string }>({ 
    isOpen: false, 
    ticketId: null, 
    action: "" 
  });

  const handleResolve = (id: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: "resolved" } : t));
    toast.success("Support ticket marked as resolved");
  };

  const handleAssign = (id: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, assignee: "Support Agent", status: "responded" } : t));
    toast.success("Ticket successfully assigned to you");
  };

  const handleDelete = () => {
    if (confirmModal.ticketId) {
      setTickets(prev => prev.filter(t => t.id !== confirmModal.ticketId));
      toast.success("Ticket deleted successfully");
      setConfirmModal({ isOpen: false, ticketId: null, action: "" });
    }
  };

  const handleSendReply = () => {
    if (!selectedTicket || !replyText.trim()) return;

    const newMessage: TicketMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: "support-admin",
      senderName: "Support Admin",
      senderRole: "admin",
      content: replyText,
      timestamp: new Date().toLocaleString(),
      isInternal: isInternal
    };

    setTickets(prev => prev.map(t => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          status: isInternal ? t.status : "responded",
          lastUpdate: "Just now",
          messages: [...t.messages, newMessage]
        };
      }
      return t;
    }));

    // Update the local selected ticket to show the new message
    setSelectedTicket(prev => prev ? {
      ...prev,
      messages: [...prev.messages, newMessage]
    } : null);

    setReplyText("");
    setIsInternal(false);
    toast.success(isInternal ? "Internal note added" : "Reply sent to shop owner");
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchSearch = t.subject.toLowerCase().includes(search.toLowerCase()) || 
                          t.tenant.toLowerCase().includes(search.toLowerCase()) ||
                          t.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      
      return matchSearch && matchStatus && matchPriority;
    });
  }, [tickets, search, statusFilter, priorityFilter]);

  const stats = useMemo(() => ([
    { label: "Urgent Response", val: tickets.filter(t => t.priority === 'critical' && t.status === 'open').length.toString(), color: "text-red-500", icon: AlertCircle },
    { label: "Active Queue", val: tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length.toString(), color: "text-primary", icon: Inbox },
    { label: "Resolved Today", val: tickets.filter(t => t.status === 'resolved').length.toString(), color: "text-green-500", icon: CheckCircle2 },
    { label: "Avg. Response Time", val: "14m", color: "text-blue-500", icon: Clock },
  ]), [tickets]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 bg-slate-900/40 backdrop-blur-xl p-10 rounded-[40px] border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <LifeBuoy className="h-32 w-32 rotate-12 text-primary" />
        </div>
        <div className="space-y-3 relative z-10">
           <div className="flex items-center gap-3 mb-2">
              <div className="h-6 w-1 bg-primary rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Response Speed</span>
           </div>
           <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none text-slate-100">Customer Support</h1>
           <p className="text-slate-500 font-bold text-sm max-w-lg">Manage support tickets, technical issues, and shop owner requests.</p>
        </div>
         <div className="relative z-10 w-full lg:w-auto flex flex-col sm:flex-row gap-4">
             <Button 
               variant="outline" 
               onClick={() => toast.info("Deep-archive support logs are synchronizing...")}
               className="w-full sm:w-auto h-14 px-8 rounded-2xl border-white/10 font-black uppercase tracking-widest text-[10px] gap-3 bg-white/5 hover:bg-white/10 transition-all text-slate-300"
             >
                <HistoryIcon className="h-4 w-4" /> Support History
             </Button>
             <Button 
               onClick={() => toast.info("Ticket generation protocol is active")}
               className="w-full sm:w-auto h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all text-white border-none"
             >
                <Plus className="h-4 w-4" /> Open New Ticket
             </Button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {stats.map((stat, i) => (
           <Card key={i} className="border-none shadow-2xl bg-slate-900/40 backdrop-blur-xl rounded-[30px] border border-white/5 group hover:border-primary/20 transition-all overflow-hidden relative">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                <stat.icon className="h-12 w-12" />
             </div>
             <CardHeader className="pb-6">
                <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">{stat.label}</CardDescription>
                <CardTitle className={cn("text-3xl font-black italic tracking-tighter uppercase leading-none mt-1", stat.color)}>{stat.val}</CardTitle>
             </CardHeader>
           </Card>
         ))}
      </div>

      <Card className="border-none shadow-2xl bg-slate-900/40 backdrop-blur-xl rounded-[40px] border border-white/5 overflow-hidden">
        <CardHeader className="p-8 border-b border-white/5 bg-slate-900/20">
          <div className="flex flex-col xl:flex-row items-center justify-between gap-6">
            <div className="relative w-full xl:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
              <Input 
                placeholder="Search for support tickets..." 
                className="h-12 pl-12 bg-black/40 border-white/5 text-slate-200 placeholder:text-slate-700 font-bold italic tracking-wide rounded-2xl focus-visible:ring-primary/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-12 px-6 rounded-2xl border-white/10 font-bold text-[10px] uppercase tracking-widest gap-3 bg-white/5 hover:bg-white/10 transition-all text-slate-400">
                      <Filter className="h-4 w-4" /> {priorityFilter === 'all' ? 'Priority' : priorityFilter.toUpperCase()}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-slate-900 border-white/5 text-slate-200">
                    <DropdownMenuItem onClick={() => setPriorityFilter('all')}>All Priorities</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPriorityFilter('critical')} className="text-red-500">Critical</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPriorityFilter('high')} className="text-amber-500">High</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPriorityFilter('medium')} className="text-blue-500">Medium</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPriorityFilter('low')} className="text-slate-500">Low</DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>

               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-12 px-6 rounded-2xl border-white/10 font-bold text-[10px] uppercase tracking-widest gap-3 bg-white/5 hover:bg-white/10 transition-all text-slate-400">
                      <Globe className="h-4 w-4" /> {statusFilter === 'all' ? 'Status' : statusFilter.toUpperCase()}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-slate-900 border-white/5 text-slate-200">
                    <DropdownMenuItem onClick={() => setStatusFilter('all')}>All Statuses</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('open')} className="text-red-500">Open</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('responded')} className="text-blue-500">Responded</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('resolved')} className="text-green-500">Resolved</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('closed')} className="text-slate-700">Closed</DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>

               <Button variant="outline" className="h-12 px-4 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-slate-400">
                  <ArrowUpDown className="h-4 w-4" />
               </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-8">
          <div className="space-y-4">
             <AnimatePresence mode="popLayout">
              {filteredTickets.map((ticket, i) => (
                <motion.div 
                  key={ticket.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group flex flex-col xl:flex-row items-start xl:items-center justify-between p-6 rounded-[30px] border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-primary/20 transition-all gap-6"
                >
                  <div className="flex items-start gap-6 flex-1 min-w-0 cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
                     <div className={cn(
                        "mt-1 p-4 rounded-2xl shrink-0 transition-transform group-hover:scale-110",
                        ticket.priority === 'critical' ? 'bg-red-500/10 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]' :
                        ticket.priority === 'high' ? 'bg-amber-500/10 text-amber-500' :
                        ticket.priority === 'medium' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-slate-500/10 text-slate-500'
                     )}>
                        <AlertCircle className="h-6 w-6" />
                     </div>
                     <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                           <span className="text-[11px] font-black font-mono text-primary italic uppercase tracking-widest leading-none bg-primary/5 px-2 py-1 rounded-md">{ticket.id}</span>
                           <span className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500">/ {ticket.tenant}</span>
                           <Badge variant="outline" className={cn(
                              "text-[9px] uppercase font-black italic tracking-widest border-none px-3 h-5 rounded-full",
                              ticket.status === 'open' ? 'bg-red-600 text-white' :
                              ticket.status === 'responded' ? 'bg-blue-600 text-white' :
                              'bg-green-600 text-white'
                           )}>
                              {ticket.status}
                           </Badge>
                        </div>
                        <h4 className="font-black italic text-lg text-slate-100 tracking-tight leading-tight group-hover:text-primary transition-colors">{ticket.subject}</h4>
                        <div className="flex flex-wrap items-center gap-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                           <span className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-primary" /> Updated {ticket.lastUpdate}</span>
                           <span className="flex items-center gap-2"><User className="h-3.5 w-3.5 text-primary" /> {ticket.assignee || "Unassigned"}</span>
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0 self-end xl:self-center">
                    <Button 
                       variant="outline" 
                       size="sm" 
                       className="h-11 px-6 rounded-xl gap-3 font-black uppercase tracking-widest text-[9px] border-white/10 hover:bg-primary hover:text-white transition-all hover:border-transparent group/btn"
                       onClick={(e) => { e.stopPropagation(); handleAssign(ticket.id); }}
                       disabled={!!ticket.assignee}
                    >
                       <UserPlus className="h-4 w-4 group-hover/btn:scale-110 transition-transform" /> Assign
                    </Button>
                    <Button 
                       variant="outline" 
                       size="sm" 
                       className="h-11 px-6 rounded-xl font-black border-white/10 hover:bg-green-600 hover:text-white transition-all hover:border-transparent group/btn"
                       onClick={(e) => { e.stopPropagation(); handleResolve(ticket.id); }}
                       disabled={ticket.status === 'resolved'}
                    >
                       <CheckCircle2 className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                    </Button>
                    <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl bg-white/5 hover:bg-white/10" onClick={(e) => e.stopPropagation()}>
                             <MoreHorizontal className="h-4 w-4" />
                          </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl bg-slate-900 border-white/5 backdrop-blur-xl">
                          <DropdownMenuItem className="gap-3 h-11 rounded-xl font-black uppercase tracking-widest text-[10px] focus:bg-primary focus:text-white transition-all" onClick={() => setSelectedTicket(ticket)}>
                             <ChevronRight className="h-4 w-4" /> View Thread
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-3 h-11 rounded-xl font-black uppercase tracking-widest text-[10px] focus:bg-primary focus:text-white transition-all" onClick={() => { setSelectedTicket(ticket); setIsInternal(true); }}>
                             <Send className="h-4 w-4" /> Internal Note
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/5" />
                          <DropdownMenuItem 
                            className="text-red-500 gap-3 h-11 rounded-xl font-black uppercase tracking-widest text-[10px] focus:bg-red-600 focus:text-white transition-all"
                            onClick={() => { setConfirmModal({ isOpen: true, ticketId: ticket.id, action: "delete" }); }}
                          >
                             <Trash2 className="h-4 w-4" /> Delete Ticket
                          </DropdownMenuItem>
                       </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ))}
              {filteredTickets.length === 0 && (
                <div className="py-24 text-center">
                  <Inbox className="h-16 w-16 mx-auto text-slate-700 mb-4 opacity-20" />
                  <p className="text-slate-500 font-black uppercase tracking-widest text-xs italic">No tickets found matching your search</p>
                </div>
              )}
             </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Ticket Thread Sheet */}
      <Sheet open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl bg-slate-950 border-white/5 p-0 flex flex-col overflow-hidden">
          {selectedTicket && (
            <>
              <SheetHeader className="p-8 border-b border-white/5 bg-slate-900/40">
                <div className="flex items-center gap-3 mb-2">
                   <span className="text-[10px] font-black font-mono text-primary italic uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-md">{selectedTicket.id}</span>
                   <Badge variant="outline" className={cn(
                      "text-[9px] uppercase font-black italic tracking-widest border-none px-3 h-5 rounded-full",
                      selectedTicket.status === 'open' ? 'bg-red-600 text-white' :
                      selectedTicket.status === 'responded' ? 'bg-blue-600 text-white' :
                      'bg-green-600 text-white'
                   )}>
                      {selectedTicket.status}
                   </Badge>
                </div>
                <SheetTitle className="text-2xl font-black italic tracking-tighter uppercase text-slate-100">{selectedTicket.subject}</SheetTitle>
                <SheetDescription className="text-slate-500 font-bold">
                  Issued by {selectedTicket.tenant} • Opened {selectedTicket.createdAt}
                </SheetDescription>
              </SheetHeader>

              <ScrollArea className="flex-1 p-8">
                <div className="space-y-8 pb-10">
                  {selectedTicket.messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={cn(
                        "flex flex-col gap-2 max-w-[85%]",
                        msg.senderRole === "admin" ? "ml-auto items-end" : "items-start",
                        msg.isInternal && "w-full max-w-full"
                      )}
                    >
                      {msg.isInternal && (
                        <div className="w-full bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 mb-2">
                          <div className="flex items-center gap-2 mb-3 text-amber-500">
                            <Lock className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Internal Note</span>
                          </div>
                          <p className="text-sm font-bold text-amber-200/80 leading-relaxed italic">
                            {msg.content}
                          </p>
                          <div className="mt-4 text-[9px] font-black text-amber-500/40 uppercase tracking-widest">
                            LOGGED BY {msg.senderName.toUpperCase()} @ {msg.timestamp}
                          </div>
                        </div>
                      )}

                      {!msg.isInternal && (
                        <>
                          <div className={cn(
                            "px-6 py-4 rounded-[24px] text-sm font-medium leading-relaxed shadow-xl",
                            msg.senderRole === "admin" 
                              ? "bg-primary text-white rounded-tr-none" 
                              : "bg-slate-900 border border-white/5 text-slate-200 rounded-tl-none"
                          )}>
                            {msg.content}
                          </div>
                          <div className="px-2 flex items-center gap-3 text-[9px] font-black text-slate-500 uppercase tracking-widest italic">
                            <span>{msg.senderName}</span>
                            <span>•</span>
                            <span>{msg.timestamp}</span>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-8 border-t border-white/5 bg-slate-900/60 backdrop-blur-2xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <Button 
                         variant="ghost" 
                         className={cn(
                           "h-8 px-4 rounded-full text-[10px] font-black uppercase tracking-widest gap-2 transition-all",
                           !isInternal ? "bg-primary text-white" : "text-slate-500"
                         )}
                         onClick={() => setIsInternal(false)}
                       >
                         Public Reply
                       </Button>
                       <Button 
                         variant="ghost" 
                         className={cn(
                           "h-8 px-4 rounded-full text-[10px] font-black uppercase tracking-widest gap-2 transition-all",
                           isInternal ? "bg-amber-600 text-white" : "text-slate-500"
                         )}
                         onClick={() => setIsInternal(true)}
                       >
                         Internal Note
                       </Button>
                    </div>
                  </div>
                  <div className="relative">
                    <Textarea 
                      placeholder={isInternal ? "Write a private note..." : "Send a message to the shop owner..."}
                      className="min-h-[120px] bg-black/40 border-white/5 text-slate-200 placeholder:text-slate-700 font-bold italic tracking-wide rounded-2xl resize-none p-6 focus-visible:ring-primary/20"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                    <Button 
                      className={cn(
                        "absolute bottom-4 right-4 h-12 w-12 rounded-xl shadow-2xl transition-all",
                        isInternal ? "bg-amber-600 hover:bg-amber-500" : "bg-primary hover:bg-primary/90"
                      )}
                      size="icon"
                      onClick={handleSendReply}
                      disabled={!replyText.trim()}
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmAction 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, ticketId: null, action: "" })}
        onConfirm={handleDelete}
        title="Delete Support Ticket?"
        description="This will permanently remove this support ticket. Use this only for spam or duplicate tickets."
        confirmText="Delete Ticket"
        variant="destructive"
      />
    </div>
  );
}
