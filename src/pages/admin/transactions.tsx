import { useState, useMemo } from "react";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  AlertTriangle, 
  CheckCircle2, 
  Smartphone, 
  CreditCard, 
  Banknote, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Download,
  ShieldCheck,
  Zap,
  Globe,
  Plus,
  ArrowUpDown,
  Calendar
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
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { PlatformTransaction } from "@/types/super-admin";

const INITIAL_TRANSACTIONS: PlatformTransaction[] = [
  { id: "TX-9021", tenantName: "Accra Mart", tenantId: "1", amount: 1540.00, currency: "GHS", status: "success", type: "commission", timestamp: "2024-05-11 10:30", reference: "MTN-99238" },
  { id: "TX-9022", tenantName: "Kumasi Elec", tenantId: "2", amount: 24500.50, currency: "GHS", status: "success", type: "subscription", timestamp: "2024-05-11 11:15", reference: "VISA-1120" },
  { id: "TX-9023", tenantName: "Tamale Fashion", tenantId: "3", amount: 450.00, currency: "GHS", status: "flagged", type: "commission", timestamp: "2024-05-11 11:45", reference: "CASH-442" },
  { id: "TX-9024", tenantName: "Accra Mart", tenantId: "1", amount: 89.90, currency: "GHS", status: "pending", type: "commission", timestamp: "2024-05-11 12:00", reference: "MTN-10211" },
  { id: "TX-9025", tenantName: "Adisadel Books", tenantId: "5", amount: 1200.00, currency: "GHS", status: "success", type: "subscription", timestamp: "2024-05-11 12:30", reference: "MAST-8821" },
];

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<PlatformTransaction[]>(INITIAL_TRANSACTIONS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PlatformTransaction["status"] | "all">("all");
  const [typeFilter, setTypeFilter] = useState<PlatformTransaction["type"] | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const handleFlag = (id: string) => {
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, status: "flagged" } : tx));
    toast.warning("Transaction flagged for security review");
  };

  const handleExport = () => {
    toast.info("Preparing transaction records...");
    setTimeout(() => toast.success("Statement downloaded successfully"), 1500);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchSearch = tx.id.toLowerCase().includes(search.toLowerCase()) ||
                          tx.tenantName.toLowerCase().includes(search.toLowerCase()) ||
                          tx.reference.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || tx.status === statusFilter;
      const matchType = typeFilter === 'all' || tx.type === typeFilter;
      
      return matchSearch && matchStatus && matchType;
    });
  }, [transactions, search, statusFilter, typeFilter]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 bg-slate-900/40 backdrop-blur-xl p-10 rounded-[40px] border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Globe className="h-32 w-32 rotate-12 text-blue-500" />
        </div>
        <div className="space-y-3 relative z-10">
           <div className="flex items-center gap-3 mb-2">
              <div className="h-6 w-1 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Platform Earnings</span>
           </div>
           <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none text-slate-100">Transaction History</h1>
           <p className="text-slate-500 font-bold text-sm max-w-lg">View and manage all payments, subscriptions, and commissions across the platform.</p>
        </div>
        <div className="relative z-10 w-full lg:w-auto flex flex-col sm:flex-row gap-4">
            <Button variant="outline" onClick={handleExport} className="w-full sm:w-auto h-14 px-8 rounded-2xl border-white/10 font-black uppercase tracking-widest text-[10px] gap-3 bg-white/5 hover:bg-white/10 transition-all text-slate-300">
               <Download className="h-4 w-4" /> Download Statement
            </Button>
            <Button 
              onClick={() => {
                toast.loading("Analyzing cross-tenant integrity...");
                setTimeout(() => toast.success("All platform nodes verified (99.8%)"), 2000);
              }}
              className="w-full sm:w-auto h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all text-white border-none"
            >
               <ShieldCheck className="h-4 w-4" /> Verify Records
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: "Total Volume", val: "₵ 128,430", trend: "+14.2%", icon: TrendingUp, positive: true },
           { label: "Flagged Payments", val: "₵ 2,850", trend: "4 Flags", icon: AlertTriangle, positive: false },
           { label: "Total Commissions", val: "₵ 15,220", trend: "+8.1%", icon: Zap, positive: true },
           { label: "Success Rate", val: "99.2%", trend: "Optimal", icon: CheckCircle2, positive: true },
         ].map((stat, i) => (
           <Card key={i} className="border-none shadow-2xl bg-slate-900/40 backdrop-blur-xl rounded-[30px] border border-white/5 group hover:border-primary/20 transition-all overflow-hidden relative">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                <stat.icon className="h-12 w-12" />
             </div>
             <CardHeader className="pb-4">
                <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">{stat.label}</CardDescription>
                <CardTitle className={cn("text-3xl font-black italic tracking-tighter uppercase leading-none mt-1 text-slate-100", !stat.positive && "text-red-500")}>{stat.val}</CardTitle>
             </CardHeader>
             <CardContent>
                <div className={cn("flex items-center gap-2 text-[10px] font-black uppercase tracking-widest", stat.positive ? "text-green-500" : "text-red-500")}>
                   {stat.trend} Over Period
                </div>
             </CardContent>
           </Card>
         ))}
      </div>

      <Card className="border-none shadow-2xl bg-slate-900/40 backdrop-blur-xl rounded-[40px] border border-white/5 overflow-hidden">
        <CardHeader className="p-8 border-b border-white/5 bg-slate-900/20">
          <div className="flex flex-col xl:flex-row items-center justify-between gap-6">
            <div className="relative w-full xl:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
              <Input 
                placeholder="Search by reference, shop, or ID..." 
                className="h-12 pl-12 bg-black/40 border-white/5 text-slate-200 placeholder:text-slate-700 font-bold italic tracking-wide rounded-2xl focus-visible:ring-primary/20"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-12 px-6 rounded-2xl border-white/10 font-bold text-[10px] uppercase tracking-widest gap-3 bg-white/5 hover:bg-white/10 transition-all text-slate-400">
                      <Filter className="h-4 w-4" /> {statusFilter === 'all' ? 'Status' : statusFilter.toUpperCase()}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-slate-900 border-white/5 text-slate-200">
                    <DropdownMenuItem onClick={() => setStatusFilter('all')}>All Statuses</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('success')} className="text-green-500">Success</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('pending')} className="text-amber-500">Pending</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('flagged')} className="text-red-500">Flagged</DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>

               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-12 px-6 rounded-2xl border-white/10 font-bold text-[10px] uppercase tracking-widest gap-3 bg-white/5 hover:bg-white/10 transition-all text-slate-400">
                      <Zap className="h-4 w-4" /> {typeFilter === 'all' ? 'Type' : typeFilter.toUpperCase()}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-slate-900 border-white/5 text-slate-200">
                    <DropdownMenuItem onClick={() => setTypeFilter('all')}>All Types</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTypeFilter('subscription')}>Subscription</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTypeFilter('commission')}>Commission</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTypeFilter('withdrawal')}>Withdrawal</DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>

               <Button variant="outline" className="h-12 px-4 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-slate-400">
                  <Calendar className="h-4 w-4" />
               </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white/[0.02] border-b border-white/5">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="h-14 px-8 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500">Reference ID</TableHead>
                  <TableHead className="h-14 px-8 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500">Shop Name</TableHead>
                  <TableHead className="h-14 px-8 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 text-right">Payment Type</TableHead>
                  <TableHead className="h-14 px-8 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 text-right">Amount</TableHead>
                  <TableHead className="h-14 px-8 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 text-center">Status</TableHead>
                  <TableHead className="h-14 px-8 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 text-right">Timestamp</TableHead>
                  <TableHead className="h-14 w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {paginatedTransactions.map((tx, i) => (
                    <motion.tr 
                      key={tx.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-white/5 last:border-none group hover:bg-white/[0.02] transition-colors"
                    >
                      <TableCell className="px-8 py-6">
                        <span className="font-mono text-[11px] font-black text-primary italic uppercase tracking-widest bg-primary/5 px-2 py-1 rounded-md">
                          {tx.id}
                        </span>
                      </TableCell>
                      <TableCell className="px-8 py-6">
                        <div className="flex flex-col">
                           <span className="font-black italic text-slate-100 uppercase tracking-tight">{tx.tenantName}</span>
                           <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{tx.reference}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-8 py-6 text-right">
                        <Badge variant="outline" className="font-black text-[10px] uppercase tracking-widest bg-white/5 border-none px-3 h-6 rounded-full text-slate-400 italic">
                          {tx.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-8 py-6 text-right">
                        <span className="font-black text-sm text-slate-100 italic tracking-tighter uppercase">
                          ₵ {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </TableCell>
                      <TableCell className="px-8 py-6 text-center">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "font-black uppercase tracking-[0.2em] text-[9px] border-none px-3 h-5 rounded-full",
                            tx.status === "success" ? "bg-green-600 text-white" :
                            tx.status === "flagged" ? "bg-red-600 text-white" :
                            "bg-amber-600 text-white"
                          )}
                        >
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-8 py-6 text-right font-mono text-[10px] text-slate-500 font-black italic tracking-widest uppercase">
                        {tx.timestamp}
                      </TableCell>
                      <TableCell className="px-8 py-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 group-hover:scale-110 transition-transform">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl bg-slate-900 border-white/5 backdrop-blur-xl">
                            <DropdownMenuItem 
                              onClick={() => toast.info("Initializing deep-node inspection...")}
                              className="gap-3 h-11 rounded-xl font-black uppercase tracking-widest text-[10px] focus:bg-primary focus:text-white transition-all"
                            >
                               <ExternalLink className="h-4 w-4" /> View Payment Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => toast.info("Syncing with external gateway reference...")}
                              className="gap-3 h-11 rounded-xl font-black uppercase tracking-widest text-[10px] focus:bg-primary focus:text-white transition-all"
                            >
                               <CheckCircle2 className="h-4 w-4" /> Check Reference
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/5" />
                            <DropdownMenuItem 
                              className="text-red-500 gap-3 h-11 rounded-xl font-black uppercase tracking-widest text-[10px] focus:bg-red-600 focus:text-white transition-all"
                              onClick={() => handleFlag(tx.id)}
                            >
                               <AlertTriangle className="h-4 w-4" /> Flag for Review
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
          
          {/* Pagination */}
          <div className="p-8 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">
                Showing {Math.min(filteredTransactions.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filteredTransactions.length, currentPage * itemsPerPage)} of {filteredTransactions.length} Transactions
             </p>
             <div className="flex items-center gap-2">
                <Button 
                   variant="outline" 
                   size="icon" 
                   className="h-10 w-10 rounded-xl border-white/5 bg-white/5"
                   onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                   disabled={currentPage === 1}
                >
                   <ChevronLeft className="h-4 w-4" />
                </Button>
                {[...Array(totalPages)].map((_, i) => (
                  <Button 
                    key={i}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    className={cn("h-10 w-10 rounded-xl font-black text-[10px] border-white/5", currentPage === i + 1 ? "bg-primary" : "bg-white/5")}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button 
                   variant="outline" 
                   size="icon" 
                   className="h-10 w-10 rounded-xl border-white/5 bg-white/5"
                   onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                   disabled={currentPage === totalPages || totalPages === 0}
                >
                   <ChevronRight className="h-4 w-4" />
                </Button>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
