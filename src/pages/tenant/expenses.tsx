import * as React from "react";
import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Edit2, 
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  TrendingDown,
  Calendar,
  MoreVertical,
  MoreHorizontal,
  Banknote,
  LayoutGrid,
  Zap,
  Clock,
  PieChart as PieChartIcon
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
import apiClient from "@/lib/api-client";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { 
  AreaChart, 
  Area, 
  ResponsiveContainer, 
  Tooltip as ChartTooltip 
} from "recharts";

type Expense = {
  id: string;
  category: "Inventory" | "Utilities" | "Rent" | "Salaries" | "Marketing" | "Other";
  description: string;
  amount: number;
  date: string;
  status: "paid" | "pending";
};

const MINI_CHART_DATA = [
  { val: 400 }, { val: 300 }, { val: 500 }, { val: 200 }, { val: 600 }, { val: 400 }, { val: 700 }
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });

  useEffect(() => {
    apiClient.get('/api/expenses')
      .then((response) => {
        const data = response.data || [];
        const mapped: Expense[] = data.map((e: any) => ({
          id: e.id,
          category: (e.category || 'Other') as Expense['category'],
          description: e.description || '',
          amount: Number(e.amount) || 0,
          date: e.date ? new Date(e.date).toISOString().split('T')[0] : '',
          status: (e.status || 'paid') as Expense['status'],
        }));
        setExpenses(mapped);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading expenses:', err);
        toast.error('Failed to load expenses');
        setLoading(false);
      });
  }, []);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleDelete = async () => {
    if (confirmModal.id) {
      try {
        await apiClient.delete(`/api/expenses/${confirmModal.id}`);
        setExpenses(prev => prev.filter(e => e.id !== confirmModal.id));
        toast.success("Expense record archived from systems");
      } catch (err: any) {
        toast.error(err.response?.data?.error || 'Failed to delete expense');
      }
      setConfirmModal({ isOpen: false, id: null });
    }
  };

  const filteredExpenses = expenses.filter(e => 
    e.description.toLowerCase().includes(search.toLowerCase()) || 
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 bg-card/40 backdrop-blur-xl p-10 rounded-[40px] border border-border/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Wallet className="h-32 w-32 rotate-12 text-primary" />
        </div>
        <div className="space-y-3 relative z-10">
           <div className="flex items-center gap-3 mb-2">
              <div className="h-6 w-1 bg-primary rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Fiscal Management</span>
           </div>
           <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Expense Ledger</h1>
           <p className="text-muted-foreground font-bold text-sm max-w-lg">Unified stream of operational overheads, procurement costs, and fiscal burn-rate analytics.</p>
        </div>
        <div className="relative z-10 w-full lg:w-auto flex flex-col sm:flex-row gap-4">
            <Button 
              variant="outline" 
              onClick={() => toast.info("Compiling operational overhead report (.pdf)")}
              className="w-full sm:w-auto h-14 px-8 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] gap-3 hover:bg-muted transition-all"
            >
               <Download className="h-4 w-4" /> Export Report
            </Button>
            <Button 
              onClick={() => toast.info("Expense logging requires treasury confirmation.")}
              className="w-full sm:w-auto h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3 shadow-2xl shadow-primary/30 bg-primary border-none hover:translate-y-[-4px] transition-all"
            >
               <Plus className="h-4 w-4" /> Log Expense
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <Card className="border-none shadow-2xl shadow-black/[0.02] bg-primary text-primary-foreground rounded-[32px] p-8 relative overflow-hidden group">
            <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Monthly Fiscal Burn</span>
                   <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center">
                      <TrendingDown className="h-4 w-4" />
                   </div>
                </div>
                <div>
                   <h3 className="text-3xl font-black italic tracking-tighter leading-none mt-1">₵ {totalExpenses.toLocaleString()}</h3>
                   <p className="text-[10px] font-bold mt-4 uppercase tracking-widest leading-none opacity-80 italic">{expenses.length} expense record(s) this period</p>
                </div>
            </div>
            <div className="absolute right-[-10px] bottom-[-10px] rotate-12 opacity-10">
               <Zap className="h-32 w-32 fill-current" />
            </div>
         </Card>

         <Card className="border-none shadow-2xl shadow-black/[0.02] bg-card/40 backdrop-blur-xl rounded-[32px] p-8 relative overflow-hidden group hover:bg-card/60 transition-all">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Pending Payouts</span>
                   <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <Clock className="h-4 w-4" />
                   </div>
                </div>
                <div>
                   <h3 className="text-3xl font-black italic tracking-tighter leading-none mt-1">₵ {expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-xs font-black uppercase not-italic opacity-40 italic tracking-tighter">Due</span></h3>
                   <p className="text-[10px] font-bold text-muted-foreground mt-4 uppercase tracking-widest leading-none">{expenses.filter(e => e.status === 'pending').length} pending payout(s) in current cycle</p>
                </div>
            </div>
         </Card>

         <Card className="border-none shadow-2xl shadow-black/[0.02] bg-card/40 backdrop-blur-xl rounded-[32px] p-8 relative overflow-hidden group hover:bg-card/60 transition-all">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Category Saturation</span>
                </div>
                <div className="flex items-center gap-6">
                   <div className="h-16 w-16">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={MINI_CHART_DATA}>
                            <Area type="monotone" dataKey="val" stroke="#3B82F6" strokeWidth={2} fill="rgba(59, 130, 246, 0.1)" />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
                   <div className="space-y-2">
                        <div className="flex items-center gap-2">
                           <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                           <span className="text-[10px] font-black uppercase tracking-widest italic">Procurement</span>
                        </div>
                        <div className="flex items-center gap-2 font-black italic opacity-40">
                           <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                           <span className="text-[10px] uppercase tracking-widest">OpEx</span>
                        </div>
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
                placeholder="Search by category or intent..." 
                className="h-12 pl-12 bg-muted/40 border-none rounded-2xl font-black italic placeholder:font-bold placeholder:italic transition-all focus-visible:ring-2 focus-visible:ring-primary/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4 w-full lg:w-auto">
               <Button variant="outline" className="flex-1 lg:flex-none h-12 rounded-xl border-2 font-black uppercase tracking-widest text-[10px] gap-3">
                  <Filter className="h-4 w-4" /> Segment
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
                  <TableHead className="h-16 px-6 text-[10px] font-black uppercase tracking-[0.2em] italic text-muted-foreground">Temporal Marker</TableHead>
                  <TableHead className="h-16 px-6 text-[10px] font-black uppercase tracking-[0.2em] italic text-muted-foreground">Intent / Resource</TableHead>
                  <TableHead className="h-16 px-6 text-[10px] font-black uppercase tracking-[0.2em] italic text-muted-foreground text-center">Category</TableHead>
                  <TableHead className="h-16 px-6 text-[10px] font-black uppercase tracking-[0.2em] italic text-muted-foreground text-right border-x border-white/5">Liquid Loss</TableHead>
                  <TableHead className="h-16 px-6 text-[10px] font-black uppercase tracking-[0.2em] italic text-muted-foreground">Status</TableHead>
                  <TableHead className="h-16 px-6 w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {filteredExpenses.map((expense, i) => (
                    <motion.tr 
                      key={expense.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-muted/20 transition-all border-b border-white/5 group relative"
                    >
                      <TableCell className="px-6 py-6 font-mono text-[9px] font-black text-muted-foreground/50 group-hover:text-primary transition-colors uppercase tracking-widest italic">
                        {expense.date}
                      </TableCell>
                      <TableCell className="px-6 py-6">
                        <div className="flex flex-col">
                           <span className="font-black italic text-sm tracking-tight">{expense.description}</span>
                           <span className="text-[8px] font-black uppercase text-muted-foreground tracking-[0.2em] italic">{expense.id}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-6 text-center">
                        <Badge variant="secondary" className="bg-muted/40 border-none px-4 py-1 rounded-full font-black uppercase tracking-widest text-[9px] italic grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                          {expense.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-6 text-right font-black text-sm border-x border-white/5 bg-red-500/5 group-hover:bg-red-500/10 transition-all text-red-500/80 group-hover:text-red-500">
                        ₵ {expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="px-6 py-6">
                        <div className="flex items-center gap-3">
                           <div className={cn(
                             "h-1.5 w-1.5 rounded-full",
                             expense.status === "paid" ? "bg-green-500" : "bg-amber-500 animate-pulse"
                           )} />
                           <span className={cn(
                             "text-[9px] font-black uppercase tracking-[0.23em] italic",
                             expense.status === "paid" ? "text-green-500" : "text-amber-500"
                           )}>{expense.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-64 p-3 rounded-2xl bg-[#111114] border-white/5 shadow-2xl backdrop-blur-3xl">
                            <DropdownMenuItem 
                              onClick={() => toast.info("Record modification requires manager signature.")}
                              className="h-12 rounded-xl focus:bg-primary/10 focus:text-primary transition-all gap-3 font-black uppercase tracking-widest text-[10px]"
                            >
                               <Edit2 className="h-4 w-4" /> Modify Record
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => toast.info("Fetching physical replica from cloud storage...")}
                              className="h-12 rounded-xl focus:bg-primary/10 focus:text-primary transition-all gap-3 font-black uppercase tracking-widest text-[10px]"
                            >
                               <Receipt className="h-4 w-4" /> Physical Replica
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/5 my-2" />
                            <DropdownMenuItem 
                              className="h-12 rounded-xl focus:bg-red-500/10 focus:text-red-500 transition-all gap-3 font-black uppercase tracking-widest text-[10px] text-red-500"
                              onClick={() => setConfirmModal({ isOpen: true, id: expense.id })}
                            >
                               <Trash2 className="h-4 w-4" /> Purge Entry
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
        </CardContent>
      </Card>

      <ConfirmAction 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Authorize Fiscal Deletion?"
        description="This will permanently nullify the expense record from the core ledger. This action is immutable and may impact fiscal parity."
        confirmText="Confirm Purge"
        variant="destructive"
      />
    </div>
  );
}
