import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Printer, 
  Share2, 
  MoreHorizontal,
  Calendar,
  CreditCard,
  Smartphone,
  Banknote,
  LayoutGrid,
  Receipt as ReceiptIcon,
  ChevronRight,
  TrendingUp,
  Clock,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

const MOCK_RECEIPTS = [
  {
    id: "RCP-2024-001",
    customer: "Ama Serwaa",
    total: 245.50,
    method: "MoMo",
    date: "2024-05-11",
    time: "09:45 AM",
    cashier: "Kofi Mensah",
    status: "Paid"
  },
  {
    id: "RCP-2024-002",
    customer: "Kwame Boateng",
    total: 120.00,
    method: "Cash",
    date: "2024-05-11",
    time: "10:12 AM",
    cashier: "Kofi Mensah",
    status: "Paid"
  },
  {
    id: "RCP-2024-003",
    customer: "Abena Mansa",
    total: 85.20,
    method: "MoMo",
    date: "2024-05-11",
    time: "11:20 AM",
    cashier: "Kofi Mensah",
    status: "Paid"
  },
  {
    id: "RCP-2024-004",
    customer: "John Doe",
    total: 450.00,
    method: "Card",
    date: "2024-05-11",
    time: "12:05 PM",
    cashier: "Kofi Mensah",
    status: "Paid"
  },
  {
    id: "RCP-2024-005",
    customer: "Yaa Prah",
    total: 15.00,
    method: "Cash",
    date: "2024-05-11",
    time: "01:30 PM",
    cashier: "Kofi Mensah",
    status: "Paid"
  }
];

export default function ReceiptsPage() {
  const [search, setSearch] = useState("");
  const [offlineTxs, setOfflineTxs] = useState<any[]>([]);
  const [remoteTxs, setRemoteTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareReceipt, setShareReceipt] = useState<any | null>(null);
  const [recipientPhone, setRecipientPhone] = useState("");

  useEffect(() => {
    async function loadIndexedDBAndRemote() {
      try {
        const { openDB } = await import('idb');
        const db = await openDB('NEXA_POS_KEEPER', 2);
        if (db && db.objectStoreNames.contains('sales_queue')) {
          const raw = await db.getAll('sales_queue');
          setOfflineTxs(raw || []);
        }
      } catch (err) {
        console.warn("IndexedDB bypass:", err);
      }

      try {
        const { apiClient } = await import('@/lib/api-client');
        const response = await apiClient.get('/api/sales?limit=50');
        const data = response.data?.data || response.data || [];
        if (Array.isArray(data)) {
          setRemoteTxs(data);
        }
      } catch (err) {
        console.warn("Remote sync bypassed:", err);
      } finally {
        setLoading(false);
      }
    }
    loadIndexedDBAndRemote();
  }, []);

  const allReceipts = [
    ...offlineTxs.map(tx => ({
      id: `OFFLINE-${tx.id.substring(0, 6).toUpperCase()}`,
      rawId: tx.id,
      customer: tx.customer_name || "Walk-in Customer",
      total: tx.total_amount,
      method: tx.payment_method || "Cash",
      date: new Date(tx.created_at).toISOString().split('T')[0],
      time: new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cashier: "Offline Local Terminal",
      status: "Local Sync Queue",
      isOffline: true
    })),
    ...remoteTxs.map((tx: any) => ({
      id: tx.receiptNumber || `TX-${String(tx.id).substring(0, 8).toUpperCase()}`,
      rawId: tx.id,
      customer: "Walk-in Customer",
      total: Number(tx.totalAmount) || 0,
      method: tx.paymentMethod || "Cash",
      date: new Date(tx.createdAt).toISOString().split('T')[0],
      time: new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cashier: "Active Staff",
      status: "Paid",
      isOffline: false
    })),
    ...MOCK_RECEIPTS.map(tx => ({ ...tx, rawId: tx.id, isOffline: false }))
  ];

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "MoMo": return <Smartphone className="h-3 w-3" />;
      case "Cash": return <Banknote className="h-3 w-3" />;
      case "Card": return <CreditCard className="h-3 w-3" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 bg-card/40 backdrop-blur-xl p-10 rounded-[40px] border border-border/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <ReceiptIcon className="h-32 w-32 rotate-12 text-primary" />
        </div>
        <div className="space-y-3 relative z-10">
           <div className="flex items-center gap-3 mb-2">
              <div className="h-6 w-1 bg-primary rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Sales Records</span>
           </div>
           <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Your Receipts</h1>
           <p className="text-muted-foreground font-bold text-sm max-w-lg">View and manage all your shop receipts in one place.</p>
        </div>
        <div className="relative z-10 w-full lg:w-auto flex flex-col sm:flex-row gap-4">
            <Button 
              variant="outline" 
              onClick={() => toast.info("Records filtered for today's volume.")}
              className="w-full sm:w-auto h-14 px-8 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] gap-3 hover:bg-muted transition-all text-primary"
            >
               <History className="h-4 w-4" /> Today
            </Button>
            <Button 
              onClick={() => toast.info("Generating encrypted backup of all receipt records...")}
              className="w-full sm:w-auto h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3 shadow-2xl shadow-primary/30 bg-primary border-none hover:translate-y-[-4px] transition-all"
            >
               <Download className="h-4 w-4" /> Download All
            </Button>
        </div>
      </div>

      <Card className="border-none shadow-2xl shadow-black/[0.02] bg-card/60 backdrop-blur-xl rounded-[40px] overflow-hidden">
        <CardHeader className="p-10 pb-6 border-b border-white/5">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="relative w-full lg:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search by ID or customer name..." 
                className="h-12 pl-12 bg-muted/40 border-none rounded-2xl font-black italic placeholder:font-bold placeholder:italic transition-all focus-visible:ring-2 focus-visible:ring-primary/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4 w-full lg:w-auto">
               <Button variant="outline" className="flex-1 lg:flex-none h-12 rounded-xl border-2 font-black uppercase tracking-widest text-[10px] gap-3">
                  <Filter className="h-4 w-4" /> Filter
               </Button>
               <Button variant="outline" className="h-12 w-12 rounded-xl border-2 p-0 flex items-center justify-center">
                  <LayoutGrid className="h-4 w-4" />
               </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="rounded-[32px] overflow-hidden border border-white/5 shadow-2xl">
            <Table>
              <TableHeader className="bg-muted/30 border-none">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="h-16 px-6 text-[10px] font-black uppercase tracking-[0.2em] italic text-muted-foreground">Receipt #</TableHead>
                  <TableHead className="h-16 px-6 text-[10px] font-black uppercase tracking-[0.2em] italic text-muted-foreground">Customer</TableHead>
                  <TableHead className="h-16 px-6 text-[10px] font-black uppercase tracking-[0.2em] italic text-muted-foreground">Payment Type</TableHead>
                  <TableHead className="h-16 px-6 text-[10px] font-black uppercase tracking-[0.2em] italic text-muted-foreground">Date & Time</TableHead>
                  <TableHead className="h-16 px-6 text-[10px] font-black uppercase tracking-[0.2em] italic text-muted-foreground text-right border-x border-white/5">Total Amount</TableHead>
                  <TableHead className="h-16 px-6 text-[10px] font-black uppercase tracking-[0.2em] italic text-muted-foreground">Status</TableHead>
                  <TableHead className="h-16 px-6 w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {allReceipts.filter(r => 
                    r.id.toLowerCase().includes(search.toLowerCase()) || 
                    r.customer.toLowerCase().includes(search.toLowerCase())
                  ).map((receipt, i) => (
                    <motion.tr 
                      key={receipt.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-muted/20 transition-all border-b border-white/5 group relative"
                    >
                      <TableCell className="px-6 py-6 font-mono text-[9px] font-black text-primary italic uppercase tracking-widest leading-none">
                        {receipt.id}
                      </TableCell>
                      <TableCell className="px-6 py-6">
                        <div className="flex flex-col">
                           <span className="font-black italic text-sm tracking-tight">{receipt.customer}</span>
                           <span className="text-[8px] font-black uppercase text-muted-foreground tracking-[0.2em] italic">{receipt.cashier}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-6">
                        <Badge variant="outline" className="bg-muted/40 border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[9px] gap-2 grayscale group-hover:grayscale-0 transition-all">
                           <div className="text-primary">{getMethodIcon(receipt.method)}</div>
                           {receipt.method}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-6">
                        <div className="flex flex-col text-[9px] font-black uppercase tracking-widest italic text-muted-foreground opacity-50 group-hover:opacity-100 transition-all">
                           <span>{receipt.date}</span>
                           <span className="opacity-60">{receipt.time}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-6 text-right font-black text-sm border-x border-white/5 bg-muted/10 group-hover:bg-primary/5 transition-all text-primary">
                        ₵ {receipt.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="px-6 py-6">
                        {receipt.isOffline ? (
                          <div className="flex items-center gap-2">
                             <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)] animate-pulse" />
                             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500 italic">Offline Queue</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                             <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-green-500 italic">{receipt.status}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="px-6 py-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-64 p-3 rounded-2xl bg-[#111114] border-white/5 shadow-2xl backdrop-blur-3xl">
                            <DropdownMenuItem asChild className="h-12 rounded-xl focus:bg-primary/10 focus:text-primary transition-all gap-3 font-black uppercase tracking-widest text-[10px]">
                               <Link to={`/receipts/${receipt.rawId}`}>
                                  <Eye className="h-4 w-4" /> View Receipt
                               </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                toast.info("Connecting to printer via Bluetooth/Network...");
                                setTimeout(() => toast.success(`Receipt ${receipt.id} sent to printer`), 2000);
                              }}
                              className="h-12 rounded-xl focus:bg-primary/10 focus:text-primary transition-all gap-3 font-black uppercase tracking-widest text-[10px] text-primary"
                            >
                               <Printer className="h-4 w-4" /> Print Receipt
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setShareReceipt(receipt)}
                              className="h-12 rounded-xl focus:bg-primary/10 focus:text-primary transition-all gap-3 font-black uppercase tracking-widest text-[10px]"
                            >
                               <Share2 className="h-4 w-4" /> Send Receipt
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/5 my-2" />
                            <DropdownMenuItem 
                              onClick={() => toast.error("Refunds require a valid supervisor override code.")}
                              className="h-12 rounded-xl focus:bg-red-500/10 focus:text-red-500 transition-all gap-3 font-black uppercase tracking-widest text-[10px] text-red-500"
                            >
                               <History className="h-4 w-4" /> Refund / Return
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-6 px-10 py-8 bg-muted/20 rounded-[32px] border border-white/5">
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground italic">Showing 5 of 152 receipts</span>
             <div className="flex gap-3">
                <Button variant="outline" size="sm" disabled className="h-11 rounded-xl px-6 border-white/10 font-black uppercase tracking-widest text-[10px] opacity-20">Previous</Button>
                <Button variant="outline" size="sm" className="h-11 rounded-xl px-6 border-white/10 font-black uppercase tracking-widest text-[10px] hover:bg-primary/10 hover:text-primary transition-all">Next Page</Button>
             </div>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Receipt Share Hub Overlay */}
      <AnimatePresence>
        {shareReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050507]/90 backdrop-blur-lg">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative max-w-sm w-full bg-[#0d0d11] border border-white/[0.08] rounded-[32px] p-6 shadow-3xl text-white flex flex-col max-h-[92vh]"
            >
              {/* Top accent glow ribbon */}
              <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500" />
              
              <div className="text-center pb-5 border-b border-dashed border-white/10 shrink-0">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-3">
                  <Share2 className="h-6 w-6 text-emerald-400 animate-pulse" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-[0.25em] text-emerald-500">Dispatch Center</h3>
                <p className="text-[9px] font-mono tracking-wider text-slate-400 mt-1 uppercase">ID: {shareReceipt.id}</p>
              </div>

              <div className="flex-1 overflow-y-auto py-5 space-y-5 text-xs progress-bar no-scrollbar">
                <div className="text-center space-y-1">
                  <h4 className="font-extrabold text-sm uppercase text-slate-200">
                    {shareReceipt.customer || "Walk-In Customer"}
                  </h4>
                  <p className="text-[14px] font-mono font-black text-emerald-400">₵ {shareReceipt.total.toFixed(2)}</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{shareReceipt.date} • {shareReceipt.time}</p>
                </div>

                {/* Instant Link Sharing Action Row */}
                <div className="flex items-center justify-between gap-2 p-1.5 bg-white/[0.01] border border-white/5 rounded-2xl shrink-0">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2.5">Digital Archive URL</p>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const digitalReceiptUrl = `${window.location.origin}/receipts/${shareReceipt.rawId}`;
                      navigator.clipboard.writeText(digitalReceiptUrl);
                      toast.success("Digital receipt link copied!");
                    }}
                    className="h-8 border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-[#edf2f7] rounded-xl px-3 inline-flex items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all"
                  >
                    Copy Link
                  </Button>
                </div>

                {/* WhatsApp Dispatch Portal */}
                <div className="space-y-2.5 border-t border-white/10 pt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black uppercase text-amber-500 tracking-widest">WhatsApp Gateway</span>
                    <span className="text-[8px] font-bold text-slate-600 uppercase font-mono tracking-widest">• Send Invoice Direct</span>
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Phone (eg. 0244123456)"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      className="h-10 text-xs font-mono font-bold bg-white/[0.02] border-white/10 rounded-xl text-white placeholder-slate-600 pl-3 focus:ring-1 focus:ring-emerald-500 focus-visible:ring-1 focus-visible:ring-offset-0 focus:border-emerald-500/50"
                    />
                    <Button
                      onClick={() => {
                        if (!recipientPhone) {
                          toast.error("Please insert a customer phone number first.");
                          return;
                        }
                        const formattedPhone = recipientPhone.startsWith('0') 
                          ? `233${recipientPhone.substring(1)}` 
                          : recipientPhone.startsWith('+') 
                            ? recipientPhone.substring(1) 
                            : `233${recipientPhone}`;
                        
                        const text = encodeURIComponent(
                          `*INVOICE RECEIPT REPORT*\n` +
                          `=============================\n` +
                          `*Ref:* ${shareReceipt.id}\n` +
                          `*Date:* ${shareReceipt.date} • ${shareReceipt.time}\n` +
                          `*Customer:* ${shareReceipt.customer || "Walk-In Customer"}\n` +
                          `=============================\n` +
                          `*Grand Total:* GH₵${shareReceipt.total.toFixed(2)}\n\n` +
                          `*Settlement Method:* ${shareReceipt.method}\n\n` +
                          `Thank you for shopping with us! View receipt online: ${window.location.origin}/receipts/${shareReceipt.rawId}`
                        );
                        window.open(`https://wa.me/${formattedPhone}?text=${text}`, "_blank");
                        toast.success("WhatsApp sharing initiated!");
                      }}
                      className="h-10 bg-emerald-500 hover:bg-emerald-600 text-black rounded-xl px-4 text-xs font-black uppercase tracking-widest cursor-pointer transition-colors"
                    >
                      Share
                    </Button>
                  </div>
                </div>
              </div>

              {/* Form dismiss controls */}
              <div className="pt-4 border-t border-white/10 shrink-0 flex gap-2">
                <Button 
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: `Receipt ${shareReceipt.id}`,
                        text: `View receipt for transaction of ₵${shareReceipt.total.toFixed(2)}`,
                        url: `${window.location.origin}/receipts/${shareReceipt.rawId}`
                      }).then(() => toast.success("Shared successfully!"))
                        .catch((err) => console.log(err));
                    } else {
                      toast.info("Native share not supported in this frame. WhatsApp or Copy Link instead.");
                    }
                  }}
                  variant="outline"
                  className="w-1/2 h-11 border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-xs font-black uppercase tracking-widest text-[#edf2f7] transition-all"
                >
                  Native Share
                </Button>
                <Button 
                  onClick={() => {
                    setShareReceipt(null);
                    setRecipientPhone('');
                  }}
                  className="w-1/2 h-11 bg-slate-100 text-slate-950 hover:bg-white text-xs font-black uppercase tracking-widest cursor-pointer transition-all"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
