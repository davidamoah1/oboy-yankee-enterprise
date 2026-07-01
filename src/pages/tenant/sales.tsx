import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal, 
  Eye, 
  Printer, 
  Trash2, 
  Calendar,
  Smartphone,
  CreditCard,
  Banknote,
  ChevronRight,
  TrendingUp,
  Receipt as ReceiptIcon,
  ArrowUpRight,
  ShoppingBag,
  Clock,
  LayoutGrid,
  FileSpreadsheet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { 
  AreaChart, 
  Area, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip as ChartTooltip,
  CartesianGrid 
} from "recharts";

type Sale = {
  id: string;
  customer: string;
  items: number;
  amount: number;
  method: "Cash" | "MoMo" | "Card";
  timestamp: string;
  status: "Completed" | "Voided";
};

const INITIAL_SALES: Sale[] = [
  { id: "S-9021", customer: "Walk-in Customer", items: 4, amount: 450.50, method: "Cash", timestamp: "2024-05-11 15:30", status: "Completed" },
  { id: "S-9022", customer: "David Amoah", items: 2, amount: 1200.00, method: "MoMo", timestamp: "2024-05-11 14:45", status: "Completed" },
  { id: "S-9023", customer: "Mary Appiah", items: 12, amount: 890.20, method: "Card", timestamp: "2024-05-11 13:20", status: "Completed" },
  { id: "S-9024", customer: "Walk-in Customer", items: 1, amount: 25.00, method: "Cash", timestamp: "2024-05-11 12:15", status: "Completed" },
  { id: "S-9025", customer: "Kwame Nkrumah", items: 6, amount: 3450.00, method: "MoMo", timestamp: "2024-05-11 11:00", status: "Completed" },
];

const MINI_CHART_DATA = [
  { val: 100 }, { val: 300 }, { val: 200 }, { val: 500 }, { val: 400 }, { val: 600 }, { val: 800 }
];

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);
  const [search, setSearch] = useState("");
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });

  const totalRevenue = sales.filter(s => s.status === 'Completed').reduce((sum, s) => sum + s.amount, 0);

  const handleDelete = () => {
    if (confirmModal.id) {
      setSales(prev => prev.map(s => s.id === confirmModal.id ? { ...s, status: "Voided" as const } : s));
      toast.success("Transaction voided successfully");
      setConfirmModal({ isOpen: false, id: null });
    }
  };

  const filteredSales = sales.filter(s => 
    s.id.toLowerCase().includes(search.toLowerCase()) || 
    s.customer.toLowerCase().includes(search.toLowerCase())
  );

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "MoMo": return <Smartphone className="h-3 w-3" />;
      case "Card": return <CreditCard className="h-3 w-3" />;
      case "Cash": return <Banknote className="h-3 w-3" />;
      default: return null;
    }
  };

  const handleExportCSV = () => {
    try {
      if (filteredSales.length === 0) {
        toast.error("No transactions to export");
        return;
      }
      
      const headers = ["Transaction ID", "Customer", "Items Count", "Amount (GHS)", "Payment Method", "Timestamp", "Status"];
      const rows = filteredSales.map(s => [
        s.id,
        s.customer,
        s.items,
        Number(s.amount).toFixed(2),
        s.method,
        s.timestamp,
        s.status
      ]);
      
      const csvStr = [
        headers.join(","),
        ...rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
      ].join("\n");
      
      const blob = new Blob([csvStr], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `sales_ledger_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Transaction ledger exported successfully! Ready for Excel or WhatsApp share.");
    } catch (err: any) {
      toast.error("Export failed: " + err.message);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 bg-card/40 backdrop-blur-xl p-10 rounded-[40px] border border-border/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <ReceiptIcon className="h-32 w-32 rotate-12" />
        </div>
        <div className="space-y-3 relative z-10">
           <div className="flex items-center gap-3 mb-2">
              <div className="h-6 w-1 bg-primary rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Transaction Ledger</span>
           </div>
           <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Sales History</h1>
           <p className="text-muted-foreground font-bold text-sm max-w-lg">Unified stream of shop-front liquidity, receipt archival, and transaction verification.</p>
        </div>
        <div className="relative z-10 w-full lg:w-auto flex flex-col sm:flex-row gap-4">
            <Button 
              variant="outline" 
              onClick={handleExportCSV}
              className="w-full sm:w-auto h-14 px-8 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] gap-3 hover:bg-muted transition-all"
            >
               <Download className="h-4 w-4" /> Export Ledger
            </Button>
            <Button 
                className="w-full sm:w-auto h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3 shadow-2xl shadow-primary/30 bg-primary border-none hover:translate-y-[-4px] transition-all" 
                asChild
              >
                <Link to="/pos">Initialize POS</Link>
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <Card className="border-none shadow-2xl shadow-black/[0.02] bg-card/40 backdrop-blur-xl rounded-[32px] p-8 relative overflow-hidden group">
            <div className="space-y-6">
                <div>
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Daily Gross Velocity</span>
                   <h3 className="text-3xl font-black italic tracking-tighter leading-none mt-1">₵ {totalRevenue.toLocaleString()}</h3>
                </div>
                <div className="h-12 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={MINI_CHART_DATA}>
                         <Area type="monotone" dataKey="val" stroke="#3B82F6" strokeWidth={2} fill="rgba(59, 130, 246, 0.1)" />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                   <TrendingUp className="h-3 w-3" /> Peak Performance Detected
                </div>
            </div>
         </Card>

         <Card className="border-none shadow-2xl shadow-black/[0.02] bg-card/40 backdrop-blur-xl rounded-[32px] p-8 relative overflow-hidden group">
            <div className="space-y-6">
                <div>
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Total Units Processed</span>
                   <h3 className="text-3xl font-black italic tracking-tighter leading-none mt-1">{sales.length} Transactions</h3>
                </div>
                <div className="flex items-center gap-4 bg-muted/30 p-3 rounded-2xl">
                   <div className="h-10 w-10 rounded-xl bg-card flex items-center justify-center text-primary shadow-lg">
                      <ShoppingBag className="h-5 w-5" />
                   </div>
                   <div className="space-y-0.5">
                      <p className="text-[11px] font-black uppercase italic italic leading-none">Checkout Velocity</p>
                      <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest leading-none italic">14.2 ops / hour</p>
                   </div>
                </div>
            </div>
         </Card>

         <Card className="border-none shadow-2xl shadow-black/[0.02] bg-card/40 backdrop-blur-xl rounded-[32px] p-8 relative overflow-hidden group">
            <div className="space-y-6">
                <div>
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Basket Amplitude</span>
                   <h3 className="text-3xl font-black italic tracking-tighter leading-none mt-1">₵ {(totalRevenue / (sales.length || 1)).toFixed(2)}</h3>
                </div>
                <div className="space-y-3">
                   <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground italic">Target Alpha</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-primary italic">₵850.00</span>
                   </div>
                   <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: '68%' }} />
                   </div>
                </div>
            </div>
         </Card>
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
                  <Calendar className="h-4 w-4" /> Segment
               </Button>
               <Button variant="outline" className="flex-1 lg:flex-none h-12 rounded-xl border-2 font-black uppercase tracking-widest text-[10px] gap-3">
                  <Filter className="h-4 w-4" /> Logic
               </Button>
               <Button variant="outline" className="h-12 w-12 rounded-xl border-2 p-0 flex items-center justify-center">
                  <LayoutGrid className="h-4 w-4" />
               </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-[32px] overflow-hidden border border-border/50 shadow-md">
            <Table>
              <TableHeader className="bg-muted/30 border-none">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="h-16 px-6 text-[10px] font-black uppercase tracking-[0.2em] italic text-muted-foreground">Sale Identifier</TableHead>
                  <TableHead className="h-16 px-6 text-[10px] font-black uppercase tracking-[0.2em] italic text-muted-foreground">Entity Identifier</TableHead>
                  <TableHead className="h-16 px-6 text-[10px] font-black uppercase tracking-[0.2em] italic text-muted-foreground text-center">Unit Count</TableHead>
                  <TableHead className="h-16 px-6 text-[10px] font-black uppercase tracking-[0.2em] italic text-muted-foreground text-right border-x border-border/50">Liquid Value</TableHead>
                  <TableHead className="h-16 px-6 text-[10px] font-black uppercase tracking-[0.2em] italic text-muted-foreground">Gateway</TableHead>
                  <TableHead className="h-16 px-6 text-[10px] font-black uppercase tracking-[0.2em] italic text-muted-foreground text-right">System Time</TableHead>
                  <TableHead className="h-16 px-6 w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {filteredSales.map((sale, i) => (
                    <motion.tr 
                      key={sale.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-muted/20 transition-all border-b border-border/30 group relative"
                    >
                      <TableCell className="px-6 py-6 font-mono text-[10px] font-black text-primary italic">
                         <div className="flex items-center gap-3">
                            <div className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              sale.status === 'Completed' ? "bg-primary animate-pulse" : "bg-red-500"
                            )} />
                            {sale.id}
                         </div>
                      </TableCell>
                      <TableCell className="px-6 py-6">
                        <div className="flex flex-col">
                           <span className="font-black italic text-sm tracking-tight text-foreground">{sale.customer}</span>
                           {sale.status === 'Voided' && <span className="text-[8px] font-black uppercase text-red-500 italic tracking-[0.2em]">VOIDED TRANSACTION</span>}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-6 text-center font-black text-xs text-muted-foreground">
                        {sale.items} units
                      </TableCell>
                      <TableCell className="px-6 py-6 text-right font-black text-sm border-x border-border/50 bg-muted/10 group-hover:bg-primary/5 transition-all">
                        ₵ {sale.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="px-6 py-6">
                        <Badge className="bg-secondary border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[9px] gap-2 text-foreground">
                          <div className="text-primary">{getMethodIcon(sale.method)}</div>
                          {sale.method}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-6 text-right font-mono text-[9px] text-muted-foreground font-black uppercase tracking-widest italic grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                        {sale.timestamp}
                      </TableCell>
                      <TableCell className="px-6 py-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                                <MoreHorizontal className="h-5 w-5" />
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-64 p-3 rounded-2xl bg-card border-border/50 shadow-2xl backdrop-blur-3xl">
                            <DropdownMenuItem
                              asChild
                              className="h-12 rounded-xl focus:bg-primary/10 focus:text-primary transition-all gap-3 font-black uppercase tracking-widest text-[10px]"
                            >
                                <Link to={`/receipts/${sale.id}`}>
                                  <ReceiptIcon className="h-4 w-4 text-primary" /> Digital Archive
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => toast.info("Re-synchronizing local printer mesh...")}
                              className="h-12 rounded-xl focus:bg-primary/10 focus:text-primary transition-all gap-3 font-black uppercase tracking-widest text-[10px] text-primary"
                            >
                               <Printer className="h-4 w-4" /> Re-synchronize Printer
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => toast.info("Opening matrix visualization for this node...")}
                              className="h-12 rounded-xl focus:bg-primary/10 focus:text-primary transition-all gap-3 font-black uppercase tracking-widest text-[10px]"
                            >
                               <Eye className="h-4 w-4 text-muted-foreground" /> Intel Matrix
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border/50 my-2" />
                            <DropdownMenuItem 
                              disabled={sale.status === 'Voided'}
                              className="h-12 rounded-xl focus:bg-red-500/10 focus:text-red-500 transition-all gap-3 font-black uppercase tracking-widest text-[10px] text-red-500"
                              onClick={() => setConfirmModal({ isOpen: true, id: sale.id })}
                            >
                               <Trash2 className="h-4 w-4" /> Void Ledger Entry
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

          {/* Mobile Card View */}
          <div className="block md:hidden space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredSales.map((sale, i) => (
                <motion.div
                  key={sale.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    "p-5 rounded-3xl border border-border/60 bg-card/30 backdrop-blur-md transition-all flex flex-col gap-4 relative overflow-hidden",
                    sale.status === 'Voided' && "bg-red-500/[0.01] border-red-500/15"
                  )}
                >
                  {/* ID, Status, Method Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-black text-primary bg-primary/5 border border-primary/10 px-2.5 py-1 rounded-lg">
                        #{sale.id}
                      </span>
                      <Badge className={cn(
                        "text-[8px] font-black uppercase tracking-widest h-5 px-2 border-none",
                        sale.status === 'Completed' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                      )}>
                        {sale.status}
                      </Badge>
                    </div>

                    <Badge className="bg-secondary border-none px-3 py-1 rounded-full font-black uppercase tracking-widest text-[8px] gap-1.5 text-foreground">
                      <div className="text-primary">{getMethodIcon(sale.method)}</div>
                      {sale.method}
                    </Badge>
                  </div>

                  {/* Customer, Date & Quantity Row */}
                  <div className="space-y-1">
                    <div className="flex flex-col">
                       <span className="font-black italic text-base tracking-tight text-foreground">
                         {sale.customer}
                       </span>
                       {sale.status === 'Voided' && (
                         <span className="text-[8px] font-black uppercase text-red-500 italic tracking-[0.2em] mt-0.5">
                           VOIDED TRANSACTION
                         </span>
                       )}
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-muted-foreground/60">
                      <span className="font-bold">{sale.timestamp}</span>
                      <span>•</span>
                      <span className="font-black text-emerald-500 uppercase">{sale.items} Units</span>
                    </div>
                  </div>

                  {/* Pricing Box & Dropdown Actions Row */}
                  <div className="flex items-center justify-between bg-muted/25 p-3.5 rounded-2xl border border-border/40 mt-1">
                    <div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 block mb-0.5">
                        LIQUID VALUE
                      </span>
                      <span className="text-xl font-black italic tracking-tighter text-emerald-500">
                        ₵ {sale.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-10 rounded-xl text-[9px] font-black uppercase tracking-widest px-3 border-border bg-card">
                          Actions <MoreHorizontal className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64 p-3 rounded-2xl bg-card border-border/50 shadow-2xl backdrop-blur-3xl">
                        <DropdownMenuItem
                          asChild
                          className="h-12 rounded-xl focus:bg-primary/10 focus:text-primary transition-all gap-3 font-black uppercase tracking-widest text-[10px]"
                        >
                            <Link to={`/receipts/${sale.id}`}>
                              <ReceiptIcon className="h-4 w-4 text-primary" /> Digital Archive
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => toast.info("Re-synchronizing local printer mesh...")}
                          className="h-12 rounded-xl focus:bg-primary/10 focus:text-primary transition-all gap-3 font-black uppercase tracking-widest text-[10px] text-primary"
                        >
                           <Printer className="h-4 w-4" /> Re-synchronize Printer
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => toast.info("Opening matrix visualization for this node...")}
                          className="h-12 rounded-xl focus:bg-primary/10 focus:text-primary transition-all gap-3 font-black uppercase tracking-widest text-[10px]"
                        >
                           <Eye className="h-4 w-4 text-muted-foreground" /> Intel Matrix
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border/50 my-2" />
                        <DropdownMenuItem 
                          disabled={sale.status === 'Voided'}
                          className="h-12 rounded-xl focus:bg-red-500/10 focus:text-red-500 transition-all gap-3 font-black uppercase tracking-widest text-[10px] text-red-500"
                          onClick={() => setConfirmModal({ isOpen: true, id: sale.id })}
                        >
                           <Trash2 className="h-4 w-4" /> Void Ledger Entry
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      <ConfirmAction 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Authorize Transaction Voiding?"
        description="This will execute a protocol reversal of the liquid value, inventory state, and fiscal ledger. This action is immutable."
        confirmText="Confirm Void"
        variant="destructive"
      />
    </div>
  );
}
