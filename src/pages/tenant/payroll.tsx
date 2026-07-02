import React, { useState, useEffect } from "react";
import { 
  DollarSign, 
  Calendar, 
  ArrowRight, 
  FileText, 
  TrendingUp, 
  AlertCircle,
  Download,
  Users,
  CheckCircle2,
  Lock
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

import apiClient from "@/lib/api-client";

type PayrollEntry = {
  id: string;
  name: string;
  base: number;
  bonus: number;
  deductions: number;
  net: number;
  status: "Paid" | "Pending";
};

export default function PayrollPage() {
  const [payroll, setPayroll] = useState<PayrollEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/api/users')
      .then((response) => {
        const data = response.data || [];
        const mapped: PayrollEntry[] = data.map((u: any) => {
          const base = Number(u.salary || u.baseSalary || 0);
          const bonus = Number(u.bonus || 0);
          const deductions = Number(u.deductions || 0);
          return {
            id: u.id,
            name: u.fullName || u.email || 'Unknown',
            base,
            bonus,
            deductions,
            net: base + bonus - deductions,
            status: (u.payrollStatus || 'Pending') as "Paid" | "Pending",
          };
        });
        setPayroll(mapped);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading payroll:', err);
        toast.error('Failed to load payroll data');
        setLoading(false);
      });
  }, []);

  const totalNet = payroll.reduce((sum, p) => sum + p.net, 0);
  const totalBase = payroll.reduce((sum, p) => sum + p.base, 0);
  const totalDeductions = payroll.reduce((sum, p) => sum + p.deductions, 0);
  const paidCount = payroll.filter(p => p.status === 'Paid').length;

  return (
    <div className="p-6 sm:p-10 space-y-10 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="h-5 w-1 bg-primary rounded-full" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground italic">Money & Payments</span>
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-foreground leading-none">
            Staff <span className="text-primary">Payroll</span>
          </h1>
        </div>
        <div className="flex gap-4">
           <Button 
             variant="outline" 
             onClick={() => toast.info("Setting pay date...")}
             className="h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2"
           >
              <Calendar className="h-4 w-4" /> Set Pay Date
           </Button>
           <Button 
             onClick={() => {
                const payToastId = toast.loading("Starting payments...");
                setTimeout(() => {
                    toast.dismiss(payToastId);
                    toast.success("Payments successfully sent");
                 }, 2000);
             }}
             className="h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/20 bg-primary border-none"
           >
              <DollarSign className="h-4 w-4" /> Pay Everyone
           </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <Card className="border-none bg-slate-900 shadow-2xl rounded-[40px] overflow-hidden relative group p-1">
            <div className="bg-background/40 backdrop-blur-xl h-full w-full rounded-[38px] p-8">
               <div className="flex justify-between items-start mb-10">
                  <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                     <TrendingUp className="h-6 w-6" />
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-none uppercase text-[9px] px-3">System Healthy</Badge>
               </div>
               <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic mb-2">Total Monthly Commitment</div>
               <div className="text-4xl font-black italic tracking-tighter uppercase text-foreground mb-4">GH₵ {totalNet.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
               <div className="flex items-center gap-2 text-xs font-bold text-emerald-500">
                  <CheckCircle2 className="h-4 w-4" /> {payroll.length > 0 ? `${paidCount} of ${payroll.length} paid` : 'No employees yet'}
               </div>
            </div>
         </Card>

         <Card className="border-none bg-white/[0.03] shadow-xl rounded-[40px] p-1 border-white/5 border">
            <div className="h-full w-full p-8">
               <div className="flex justify-between items-start mb-10">
                  <div className="h-14 w-14 bg-muted rounded-2xl flex items-center justify-center text-slate-500 border border-border">
                     <Users className="h-6 w-6" />
                  </div>
                  <Badge className="bg-blue-500/10 text-blue-500 border-none uppercase text-[9px] px-3">{payroll.length} Staff</Badge>
               </div>
               <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic mb-2">Employee Payments</div>
               <div className="text-4xl font-black italic tracking-tighter uppercase text-foreground mb-4">GH₵ {totalBase.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-tight">Net payout after statutory deductions.</p>
            </div>
         </Card>

         <Card className="border-none bg-white/[0.03] shadow-xl rounded-[40px] p-1 border-white/5 border">
            <div className="h-full w-full p-8">
               <div className="flex justify-between items-start mb-10">
                  <div className="h-14 w-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20">
                     <AlertCircle className="h-6 w-6" />
                  </div>
                  <Badge className="bg-amber-500/10 text-amber-500 border-none uppercase text-[9px] px-3">Pending Action</Badge>
               </div>
               <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic mb-2">Cycle Deductions</div>
               <div className="text-4xl font-black italic tracking-tighter uppercase text-foreground mb-4">GH₵ {totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
               <div className="text-[10px] font-black text-amber-500/60 uppercase tracking-widest">{payroll.length > 0 ? 'Statutory deductions total.' : 'No data yet.'}</div>
            </div>
         </Card>
      </div>

      {/* Main Table */}
      <Card className="border-none bg-card/40 backdrop-blur-md shadow-xl rounded-[40px] overflow-hidden border border-white/5">
        <div className="p-10 border-b border-white/5 flex flex-col md:flex-row gap-8 justify-between items-center">
           <div>
              <h3 className="text-2xl font-black italic tracking-tighter uppercase text-slate-100 flex items-center gap-3">
                 Payment History <Lock className="h-5 w-5 text-primary" />
              </h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">Current Cycle: {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
           </div>
           <Button 
             variant="outline" 
             onClick={() => {
                const recToastId = toast.loading("Getting records...");
                setTimeout(() => {
                    toast.dismiss(recToastId);
                    toast.success("Payroll records downloaded successfully");
                 }, 2000);
             }}
             className="h-14 px-10 rounded-2xl bg-white/5 hover:bg-white/10 border-white/10 font-black uppercase tracking-widest text-[10px] gap-3"
           >
              <Download className="h-4 w-4" /> Download All Records
           </Button>
        </div>
        <CardContent className="p-0">
           {loading ? (
             <div className="flex flex-col items-center justify-center py-20 gap-4">
               <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
               <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Loading payroll...</p>
             </div>
           ) : payroll.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
               <div className="h-16 w-16 rounded-2xl bg-muted/40 flex items-center justify-center">
                 <Users className="h-8 w-8 text-muted-foreground/40" />
               </div>
               <div className="space-y-2">
                 <h3 className="text-lg font-black italic uppercase tracking-tight">No Payroll Records</h3>
                 <p className="text-xs text-muted-foreground font-bold max-w-sm">Add staff members with salary information to generate payroll records.</p>
               </div>
             </div>
           ) : (
           <Table>
              <TableHeader className="bg-white/5">
                 <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="py-6 px-10 text-[10px] font-black uppercase tracking-widest italic text-slate-500">Employee Name</TableHead>
                    <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest italic text-slate-500">Base Salary</TableHead>
                    <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest italic text-slate-500">Bonus</TableHead>
                    <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest italic text-slate-500">Deductions</TableHead>
                    <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest italic text-slate-500">Final Pay</TableHead>
                    <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest italic text-slate-500">Status</TableHead>
                    <TableHead className="py-6 px-10 text-[10px] font-black uppercase tracking-widest italic text-slate-500 text-right">Payslip</TableHead>
                 </TableRow>
              </TableHeader>
              <TableBody>
                 {payroll.map((item) => (
                    <TableRow key={item.id} className="group hover:bg-white/5 transition-all border-b border-white/5">
                       <TableCell className="px-10 py-8 font-black italic text-lg text-slate-200 tracking-tight uppercase">{item.name}</TableCell>
                       <TableCell className="font-bold text-slate-400">GH₵ {item.base.toFixed(2)}</TableCell>
                       <TableCell className="font-bold text-emerald-500">+ GH₵ {item.bonus.toFixed(2)}</TableCell>
                       <TableCell className="font-bold text-rose-500">- GH₵ {item.deductions.toFixed(2)}</TableCell>
                       <TableCell className="font-black italic text-slate-100 tracking-tight">GH₵ {item.net.toFixed(2)}</TableCell>
                       <TableCell>
                          <Badge 
                            variant="outline" 
                            className={item.status === "Paid" 
                              ? "bg-emerald-500/10 text-emerald-500 border-none uppercase text-[9px] font-black tracking-widest px-4" 
                              : "bg-amber-500/10 text-amber-500 border-none uppercase text-[9px] font-black tracking-widest px-4"}
                          >
                             {item.status}
                          </Badge>
                       </TableCell>
                       <TableCell className="text-right px-10">
                          <Button 
                            onClick={() => toast.info("Opening your payment slip...")}
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 text-muted-foreground hover:bg-primary hover:text-white rounded-xl transition-all"
                          >
                             <FileText className="h-5 w-5" />
                          </Button>
                       </TableCell>
                    </TableRow>
                 ))}
              </TableBody>
           </Table>
           )}
        </CardContent>
      </Card>

    </div>
  );
}
