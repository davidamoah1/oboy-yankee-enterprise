import { useState } from "react";
import { 
  Download, 
  Calendar, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  RefreshCcw,
  BarChart3,
  PieChart as PieChartIcon,
  Table as TableIcon,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Globe,
  Zap,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line
} from "recharts";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

const PERFORMANCE_DATA = [
  { name: "Mon", sales: 1200, expenses: 400, margin: 800 },
  { name: "Tue", sales: 3400, expenses: 800, margin: 2600 },
  { name: "Wed", sales: 2100, expenses: 500, margin: 1600 },
  { name: "Thu", sales: 4500, expenses: 1200, margin: 3300 },
  { name: "Fri", sales: 5200, expenses: 900, margin: 4300 },
  { name: "Sat", sales: 3800, expenses: 1100, margin: 2700 },
  { name: "Sun", sales: 1900, expenses: 600, margin: 1300 },
];

const CATEGORY_DATA = [
  { name: "Beverages", value: 400 },
  { name: "Snacks", value: 300 },
  { name: "Grains", value: 300 },
  { name: "Electronics", value: 200 },
];

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

export default function ReportsPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("Weekly");

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Dashboard updated");
    }, 1200);
  };

  const handleExport = () => {
    toast.info("Preparing your report...");
    setTimeout(() => toast.success("Report 'Monthly_Sales_Report.pdf' ready to download"), 2000);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 bg-card/40 backdrop-blur-xl p-10 rounded-[40px] border border-border/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Activity className="h-32 w-32 rotate-12" />
        </div>
        <div className="space-y-3 relative z-10">
           <div className="flex items-center gap-3 mb-2">
              <div className="h-6 w-1 bg-primary rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Business Reports</span>
           </div>
           <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Business Performance</h1>
           <p className="text-muted-foreground font-bold text-sm max-w-lg">Track your sales, profit, and stock health with clear charts and easy-to-read numbers.</p>
        </div>
        
        <div className="relative z-10 w-full lg:w-auto flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex bg-muted/40 p-1.5 rounded-2xl border border-border/50 w-full sm:w-auto">
               {["Daily", "Weekly", "Monthly"].map((range) => (
                 <button
                   key={range}
                   onClick={() => setTimeRange(range)}
                   className={cn(
                     "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all w-full sm:w-auto",
                     timeRange === range ? "bg-card text-white shadow-xl" : "text-muted-foreground hover:text-white"
                   )}
                 >
                   {range}
                 </button>
               ))}
            </div>
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing} className="w-full sm:w-auto h-14 px-8 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] gap-3 hover:bg-muted transition-all">
               <RefreshCcw className={cn("h-4 w-4", isRefreshing ? "animate-spin" : "")} /> Update Data
            </Button>
            <Button onClick={handleExport} className="w-full sm:w-auto h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3 shadow-2xl shadow-primary/30 bg-primary border-none hover:translate-y-[-4px] transition-all">
               <Download className="h-4 w-4" /> Download PDF
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         {[
           { label: "Profit Margin", val: "24.2%", trend: "+2.1%", positive: true, icon: Target, desc: "vs Previous period" },
           { label: "Avg Sale Value", val: "₵142.50", trend: "-₵12.00", positive: false, icon: Zap, desc: "Per Customer" },
           { label: "Stock Movement", val: "2.4x", trend: "Optimal", positive: true, icon: RefreshCcw, desc: "How fast stock sells" },
           { label: "Sales Growth", val: "+18.4%", trend: "+4.2%", positive: true, icon: Globe, desc: "Month over Month" },
         ].map((stat, i) => (
           <Card key={i} className="border-none shadow-2xl shadow-black/[0.03] bg-card/40 backdrop-blur-xl rounded-[32px] p-8 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
                <stat.icon className="h-12 w-12" />
             </div>
             <div className="space-y-6">
                <div className="space-y-1">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</span>
                   <h3 className="text-3xl font-black italic tracking-tighter leading-none">{stat.val}</h3>
                </div>
                <div className="flex flex-col gap-1">
                   <div className={cn(
                     "flex items-center gap-1 text-[10px] font-black uppercase tracking-widest leading-none",
                     stat.positive ? "text-primary" : "text-red-500"
                   )}>
                      {stat.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {stat.trend}
                   </div>
                   <span className="text-[9px] font-bold text-muted-foreground/40 italic uppercase tracking-widest">{stat.desc}</span>
                </div>
             </div>
           </Card>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <Card className="lg:col-span-2 border-none shadow-2xl shadow-black/[0.02] bg-card/60 backdrop-blur-xl rounded-[40px] overflow-hidden">
            <CardHeader className="p-10 pb-4 flex flex-row items-center justify-between">
               <div>
                  <CardTitle className="text-2xl font-black uppercase italic tracking-tighter">Sales & Expenses</CardTitle>
                  <CardDescription className="text-sm font-bold text-muted-foreground italic">See how much you earned vs how much you spent.</CardDescription>
               </div>
               <div className="flex items-center gap-4 bg-muted/30 p-2 rounded-2xl">
                  <div className="flex items-center gap-2 px-3">
                     <div className="h-2 w-2 rounded-full bg-primary" />
                     <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">Sales</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 border-l border-white/5">
                     <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                     <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Expenses</span>
                  </div>
               </div>
            </CardHeader>
            <CardContent className="h-[450px] p-6">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={PERFORMANCE_DATA}>
                     <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                           <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#1C1C1F" stopOpacity={0.2}/>
                           <stop offset="95%" stopColor="#1C1C1F" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                     <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fontWeight: '900', letterSpacing: '0.1em'}}
                        dy={10}
                     />
                     <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fontWeight: '900'}}
                        tickFormatter={(val) => `₵${val}`}
                        dx={-10}
                     />
                     <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#111114', 
                          borderRadius: '20px', 
                          border: '1px solid rgba(255,255,255,0.05)', 
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                          padding: '1.5rem',
                        }}
                        itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                        labelStyle={{ fontSize: '12px', fontWeight: '900', marginBottom: '0.5rem', fontStyle: 'italic' }}
                     />
                     <Area 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#3B82F6" 
                        strokeWidth={4} 
                        fillOpacity={1} 
                        fill="url(#colorSales)" 
                        animationDuration={2000}
                     />
                     <Area 
                        type="monotone" 
                        dataKey="expenses" 
                        stroke="#1C1C1F" 
                        strokeWidth={2} 
                        strokeDasharray="8 8" 
                        fillOpacity={1} 
                        fill="url(#colorExpense)" 
                        animationDuration={2000}
                     />
                  </AreaChart>
               </ResponsiveContainer>
            </CardContent>
         </Card>

         <Card className="border-none shadow-2xl shadow-black/[0.02] bg-card/60 backdrop-blur-xl rounded-[40px] flex flex-col">
            <CardHeader className="p-10 pb-6">
               <CardTitle className="text-2xl font-black uppercase italic tracking-tighter">Stock by Category</CardTitle>
               <CardDescription className="text-sm font-bold text-muted-foreground italic tracking-tight">Which items make up your stock.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center gap-10 p-10">
               <div className="h-[240px] relative">
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 leading-none mb-1">Total Value</span>
                     <span className="text-2xl font-black italic tracking-tighter italic">₵1.2k</span>
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie
                           data={CATEGORY_DATA}
                           cx="50%"
                           cy="50%"
                           innerRadius={75}
                           outerRadius={95}
                           paddingAngle={8}
                           dataKey="value"
                           stroke="none"
                        >
                           {CATEGORY_DATA.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} radius={12} />
                           ))}
                        </Pie>
                        <Tooltip />
                     </PieChart>
                  </ResponsiveContainer>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  {CATEGORY_DATA.map((item, i) => (
                     <div key={i} className="flex flex-col gap-2 p-4 bg-muted/20 border border-white/5 rounded-2xl group hover:bg-muted/30 transition-all">
                        <div className="flex items-center gap-2">
                           <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                           <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{item.name}</span>
                        </div>
                        <span className="text-sm font-black italic">₵{item.value}k</span>
                     </div>
                  ))}
               </div>
            </CardContent>
         </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
         <Card 
           onClick={() => toast.info("Opening stock health matrix...")}
           className="border-none shadow-2xl shadow-black/[0.02] bg-card/40 backdrop-blur-xl rounded-[32px] p-10 flex items-center justify-between group cursor-pointer hover:bg-primary/5 transition-all duration-500 border border-white/5"
         >
            <div className="flex items-center gap-8">
               <div className="h-20 w-20 rounded-[28px] bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500 shadow-2xl shadow-primary/10">
                  <TableIcon className="h-10 w-10" />
               </div>
               <div className="space-y-1">
                  <div className="flex items-center gap-3">
                     <h4 className="text-xl font-black italic tracking-tighter uppercase leading-none">Old Stock Report</h4>
                     <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase tracking-widest">Priority One</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-bold italic">Check which items have been on the shelf too long.</p>
               </div>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-primary group-hover:bg-primary/10 transition-all">
               <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </div>
         </Card>
         
         <Card 
           onClick={() => toast.info("Opening efficiency telemetry...")}
           className="border-none shadow-2xl shadow-black/[0.02] bg-card/40 backdrop-blur-xl rounded-[32px] p-10 flex items-center justify-between group cursor-pointer hover:bg-amber-500/5 transition-all duration-500 border border-white/5"
         >
            <div className="flex items-center gap-8">
               <div className="h-20 w-20 rounded-[28px] bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform duration-500 shadow-2xl shadow-amber-500/10">
                  <BarChart3 className="h-10 w-10" />
               </div>
               <div className="space-y-1">
                  <div className="flex items-center gap-3">
                     <h4 className="text-xl font-black italic tracking-tighter uppercase leading-none">Staff Performance</h4>
                     <Badge className="bg-amber-500/10 text-amber-500 border-none text-[8px] font-black uppercase tracking-widest">Efficiency</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-bold italic">See how much sales each staff member is making.</p>
               </div>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-amber-500 group-hover:bg-amber-500/10 transition-all">
               <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </div>
         </Card>
      </div>
    </div>
  );
}
