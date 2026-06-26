import React from "react";
import { 
  Calculator, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  PieChart, 
  FileText, 
  Download, 
  Printer, 
  Search, 
  Filter,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Banknote,
  Percent,
  History
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TRANSACTIONS = [
  { id: "TX-1002", category: "Revenue", description: "Batch POS Settlement", amount: 4850.00, type: "Income", date: "2026-05-11", status: "Reconciled" },
  { id: "TX-1003", category: "Expense", description: "Supplier Payment", amount: 1200.00, type: "Outflow", date: "2026-05-11", status: "Pending" },
  { id: "TX-1004", category: "Payroll", description: "Staff Salary Payment", amount: 15400.00, type: "Outflow", date: "2026-05-10", status: "Reconciled" },
  { id: "TX-1005", category: "Taxes", description: "GRA Payment", amount: 2400.00, type: "Outflow", date: "2026-05-09", status: "Finalized" },
  { id: "TX-1006", category: "Revenue", description: "Online Store Sales", amount: 3200.00, type: "Income", date: "2026-05-08", status: "Reconciled" },
];

export default function AccountingPage() {
  return (
    <div className="p-6 sm:p-10 space-y-10 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <div className="h-5 w-1 bg-emerald-500 rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground italic text-emerald-500/80">Financial Reports</span>
           </div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase text-foreground leading-none">
             Business <span className="text-emerald-500 italic">Accounts</span>
           </h1>
        </div>
        <div className="flex gap-4">
           <Button 
             variant="outline" 
             onClick={() => toast.info("Opening reports...")}
             className="h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/5"
           >
              <FileText className="h-4 w-4" /> View Reports
           </Button>
           <Button 
             onClick={() => {
                toast.loading("Syncing your accounts...");
                setTimeout(() => toast.success("Accounts updated successfully"), 2000);
             }}
             className="h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-600 border-none text-black"
           >
              <Calculator className="h-4 w-4" /> Update Accounts
           </Button>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <Card className="md:col-span-2 border-none bg-slate-900 shadow-2xl rounded-[40px] p-1">
            <div className="bg-background/40 backdrop-blur-xl h-full w-full rounded-[38px] p-10 flex flex-col justify-between">
               <div className="flex justify-between items-start mb-10">
                  <div className="h-14 w-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                     <Banknote className="h-7 w-7" />
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-none uppercase text-[9px] px-3 font-black tracking-widest">Total Net Profit</Badge>
               </div>
               <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2 italic">Remaining Balance (May)</div>
                  <div className="text-6xl font-black italic tracking-tighter uppercase text-slate-100 mb-4 leading-none">GH₵ 34,250.00</div>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-widest">
                     <TrendingUp className="h-4 w-4" /> +15.2% vs previous period
                  </div>
               </div>
            </div>
         </Card>

         <Card className="border-none bg-white/[0.03] shadow-xl rounded-[35px] border border-white/5 p-8 flex flex-col justify-between">
            <div className="flex justify-between items-start">
               <div className="h-12 w-12 bg-white/5 rounded-xl flex items-center justify-center text-slate-400">
                  <PieChart className="h-5 w-5" />
               </div>
            </div>
            <div>
               <div className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Expenses</div>
               <div className="text-3xl font-black italic text-slate-200 tracking-tighter leading-none mb-4">GH₵ 12.8k</div>
               <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 w-[45%]" />
               </div>
            </div>
         </Card>

         <Card className="border-none bg-white/[0.03] shadow-xl rounded-[35px] border border-white/5 p-8 flex flex-col justify-between">
            <div className="flex justify-between items-start">
               <div className="h-12 w-12 bg-white/5 rounded-xl flex items-center justify-center text-slate-400">
                  <Percent className="h-5 w-5" />
               </div>
            </div>
            <div>
               <div className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Estimated Tax</div>
               <div className="text-3xl font-black italic text-slate-200 tracking-tighter leading-none mb-4">GH₵ 4.2k</div>
               <div className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Pending Tax Check</div>
            </div>
         </Card>
      </div>

      {/* Transactions */}
      <Card className="border-none bg-card/40 backdrop-blur-md shadow-2xl rounded-[50px] overflow-hidden border border-white/5">
        <div className="p-10 border-b border-white/5 flex flex-col md:flex-row gap-8 justify-between items-center">
           <div className="flex items-center gap-4">
              <h3 className="text-2xl font-black italic tracking-tighter uppercase text-slate-100">All Transactions</h3>
              <Badge variant="outline" className="bg-white/5 text-slate-500 border-none px-3 uppercase text-[9px]">Recent</Badge>
           </div>
           <div className="flex gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <Input 
                   className="h-12 pl-11 bg-white/5 border-none rounded-2xl italic font-bold" 
                   placeholder="Search entries..." 
                 />
              </div>
              <Button 
                variant="outline" 
                onClick={() => toast.info("Filter applied successfully")}
                className="h-12 px-6 rounded-2xl bg-white/5 border-white/5 font-black uppercase text-[10px] tracking-widest gap-2"
              >
                 <Filter className="h-4 w-4" /> Filter
              </Button>
           </div>
        </div>
        <CardContent className="p-0">
           <Table>
              <TableHeader className="bg-white/5">
                 <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="py-8 px-10 text-[9px] font-black uppercase tracking-widest italic text-slate-500">ID</TableHead>
                    <TableHead className="py-8 text-[9px] font-black uppercase tracking-widest italic text-slate-500">Category</TableHead>
                    <TableHead className="py-8 text-[9px] font-black uppercase tracking-widest italic text-slate-500">Description</TableHead>
                    <TableHead className="py-8 text-[9px] font-black uppercase tracking-widest italic text-slate-500">Amount</TableHead>
                    <TableHead className="py-8 text-[9px] font-black uppercase tracking-widest italic text-slate-500">Date</TableHead>
                    <TableHead className="py-8 text-[9px] font-black uppercase tracking-widest italic text-slate-500 text-center">Status</TableHead>
                    <TableHead className="py-8 px-10 text-right text-[9px] font-black uppercase tracking-widest italic text-slate-500">Action</TableHead>
                 </TableRow>
              </TableHeader>
              <TableBody>
                 {TRANSACTIONS.map((tx) => (
                    <TableRow key={tx.id} className="group hover:bg-white/[0.03] transition-all border-b border-white/5">
                       <TableCell className="px-10 py-10 font-black italic text-base text-slate-300 tracking-tight">{tx.id}</TableCell>
                       <TableCell>
                          <Badge className={cn(
                             "text-[9px] font-black uppercase border-none px-3 py-1",
                             tx.type === "Income" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                          )}>
                             {tx.category}
                          </Badge>
                       </TableCell>
                       <TableCell className="font-bold text-slate-400 italic text-sm">{tx.description}</TableCell>
                       <TableCell className={cn(
                          "font-black italic text-xl tracking-tighter",
                          tx.type === "Income" ? "text-slate-100" : "text-rose-400"
                       )}>
                          {tx.type === "Income" ? "+" : "-"} {tx.amount.toFixed(2)}
                       </TableCell>
                       <TableCell className="text-[10px] font-black text-slate-600 italic uppercase">{tx.date}</TableCell>
                       <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                             {tx.status === "Reconciled" ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                             ) : (
                                <AlertCircle className="h-4 w-4 text-amber-500" />
                             )}
                             <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{tx.status}</span>
                          </div>
                       </TableCell>
                       <TableCell className="text-right px-10">
                          <DropdownMenu>
                             <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:bg-primary hover:text-white rounded-xl transition-all">
                                   <MoreVertical className="h-5 w-5" />
                                </Button>
                             </DropdownMenuTrigger>
                             <DropdownMenuContent align="end" className="bg-slate-900 border-white/10 rounded-2xl p-2 w-64 shadow-2xl">
                                <DropdownMenuItem className="h-12 rounded-xl font-black uppercase tracking-widest text-[10px] gap-3 focus:bg-primary focus:text-white mb-1 transition-all">
                                   <History className="h-4 w-4" /> History
                                </DropdownMenuItem>
                                <DropdownMenuItem className="h-12 rounded-xl font-black uppercase tracking-widest text-[10px] gap-3 focus:bg-primary focus:text-white mb-1 transition-all">
                                   <Download className="h-4 w-4" /> Download Record
                                </DropdownMenuItem>
                                <DropdownMenuItem className="h-12 rounded-xl font-black uppercase tracking-widest text-[10px] gap-3 focus:bg-primary focus:text-white transition-all">
                                   <Printer className="h-4 w-4" /> Print
                                </DropdownMenuItem>
                             </DropdownMenuContent>
                          </DropdownMenu>
                       </TableCell>
                    </TableRow>
                 ))}
              </TableBody>
           </Table>
        </CardContent>
      </Card>

    </div>
  );
}
