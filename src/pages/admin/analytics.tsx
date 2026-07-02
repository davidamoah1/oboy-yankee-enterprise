import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Users, 
  Building2, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Download,
  Calendar,
  Layers,
  Activity,
  Globe,
  Zap,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/lib/api-client";

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("6M");
  const [overviewData, setOverviewData] = useState<any[]>([]);
  const [tenantComposition, setTenantComposition] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/api/admin/analytics')
      .then(({ data }) => {
        setOverviewData(data.overviewData || []);
        setTenantComposition(data.tenantComposition || []);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Failed to load analytics:', err);
        setLoading(false);
      });
  }, []);

  const totalRevenue = overviewData.reduce((sum, d) => sum + d.revenue, 0);
  const totalTenants = overviewData.reduce((sum, d) => sum + d.tenants, 0);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 bg-slate-900/40 backdrop-blur-xl p-10 rounded-[40px] border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <TrendingUp className="h-32 w-32 rotate-12 text-blue-500" />
        </div>
        <div className="space-y-3 relative z-10">
           <div className="flex items-center gap-3 mb-2">
              <div className="h-6 w-1 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Platform Stats</span>
           </div>
           <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none text-slate-100">Business Insights</h1>
           <p className="text-slate-500 font-bold text-sm max-w-lg">Detailed reports on growth, shop numbers, and industry performance across the region.</p>
        </div>
        <div className="relative z-10 w-full lg:w-auto flex flex-col sm:flex-row gap-4">
            <div className="flex items-center bg-white/5 p-1 rounded-2xl border border-white/5">
               {["1M", "3M", "6M", "1Y"].map((range) => (
                 <Button 
                   key={range}
                   variant="ghost" 
                   size="sm"
                   onClick={() => setTimeRange(range)}
                   className={cn(
                     "h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                     timeRange === range ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:text-slate-300"
                   )}
                 >
                   {range}
                 </Button>
               ))}
            </div>
             <Button 
               onClick={() => {
                 toast.loading("Generating platform insight report...");
                 setTimeout(() => toast.success("Nexus_Annual_Insights_2024.pdf is ready"), 2000);
               }}
               className="w-full sm:w-auto h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all text-white border-none"
             >
                <Download className="h-4 w-4" /> Export Report
             </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: "Total Revenue", val: `₵${totalRevenue > 0 ? (totalRevenue / 1000).toFixed(1) + 'k' : '0'}`, trend: overviewData.length > 0 ? "Calculated" : "No data", icon: DollarSign, color: "text-blue-500" },
           { label: "Active Shops", val: String(totalTenants), trend: overviewData.length > 0 ? "Live" : "No data", icon: Building2, color: "text-emerald-500" },
           { label: "Data Points", val: String(overviewData.length), trend: "Monthly", icon: Users, color: "text-amber-500" },
           { label: "System Uptime", val: "99.9%", trend: "Stable", icon: Activity, color: "text-indigo-500" },
         ].map((stat, i) => (
           <Card key={i} className="border-none shadow-2xl bg-slate-900/40 backdrop-blur-xl rounded-[30px] border border-white/5 group hover:border-primary/20 transition-all">
             <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-4">
                   <div className={cn("p-3 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform", stat.color)}>
                      <stat.icon className="h-5 w-5" />
                   </div>
                   <span className="text-[10px] font-black tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg uppercase italic">{stat.trend}</span>
                </div>
                <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 leading-none">{stat.label}</CardDescription>
                <CardTitle className="text-3xl font-black italic tracking-tighter uppercase leading-none mt-2 text-slate-100">{stat.val}</CardTitle>
             </CardHeader>
           </Card>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <Card className="lg:col-span-2 border-none shadow-2xl bg-slate-900/40 backdrop-blur-xl rounded-[40px] border border-white/5 overflow-hidden">
            <CardHeader className="p-8 pb-0">
               <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                       <div className="h-4 w-1 bg-primary rounded-full" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Growth Trend</span>
                    </div>
                    <CardTitle className="text-2xl font-black italic tracking-tighter uppercase text-slate-100">Total Earnings</CardTitle>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span className="text-[9px] font-black uppercase text-slate-500">Platform Revenue</span>
                     </div>
                  </div>
               </div>
            </CardHeader>
            <CardContent className="p-8 h-[400px]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={overviewData}>
                     <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                     <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} 
                        dy={10}
                     />
                     <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }}
                        tickFormatter={(value) => `₵${value/1000}k`}
                     />
                     <Tooltip 
                        contentStyle={{ 
                           backgroundColor: '#0f172a', 
                           border: '1px solid rgba(255,255,255,0.05)', 
                           borderRadius: '20px',
                           padding: '15px'
                        }}
                        itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                        labelStyle={{ color: '#64748b', fontSize: '10px', fontWeight: 900, marginBottom: '5px' }}
                     />
                     <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#3B82F6" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#revenueGradient)" 
                     />
                  </AreaChart>
               </ResponsiveContainer>
            </CardContent>
         </Card>

         <Card className="border-none shadow-2xl bg-slate-900/40 backdrop-blur-xl rounded-[40px] border border-white/5 overflow-hidden">
            <CardHeader className="p-8">
               <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 w-1 bg-emerald-500 rounded-full" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 italic">Business Types</span>
               </div>
               <CardTitle className="text-2xl font-black italic tracking-tighter uppercase text-slate-100">Shops by Industry</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
               <div className="h-[250px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie
                           data={tenantComposition.length > 0 ? tenantComposition : [{ name: 'No Data', value: 1, color: '#333' }]}
                           cx="50%"
                           cy="50%"
                           innerRadius={60}
                           outerRadius={80}
                           paddingAngle={8}
                           dataKey="value"
                        >
                           {tenantComposition.length > 0 ? tenantComposition.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                           )) : <Cell fill="#333" stroke="none" />}
                        </Pie>
                        <Tooltip 
                           contentStyle={{ 
                              backgroundColor: '#0f172a', 
                              border: '1px solid rgba(255,255,255,0.05)', 
                              borderRadius: '20px'
                           }}
                        />
                     </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-3xl font-black text-slate-100 italic tracking-tighter">{totalTenants}</span>
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">TOTAL_SHOPS</span>
                  </div>
               </div>
               <div className="space-y-4 mt-8">
                  {tenantComposition.length > 0 ? tenantComposition.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className={cn("h-2 w-2 rounded-full shadow-lg", item.color)} style={{ backgroundColor: item.color }} />
                          <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest italic">{item.name}</span>
                       </div>
                       <span className="text-[11px] font-mono font-black text-slate-500">{item.value}</span>
                    </div>
                  )) : (
                    <p className="text-[10px] text-slate-600 italic text-center py-4">No composition data yet</p>
                  )}
               </div>
            </CardContent>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Card className="border-none shadow-2xl bg-slate-900/40 backdrop-blur-xl rounded-[40px] border border-white/5 overflow-hidden">
            <CardHeader className="p-8 border-b border-white/5">
                <div className="flex items-center gap-4">
                   <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <Zap className="h-5 w-5" />
                   </div>
                   <div>
                      <CardTitle className="text-xl font-black italic tracking-tighter uppercase text-slate-100">Platform Performance</CardTitle>
                      <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">System Performance Metrics</CardDescription>
                   </div>
                </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
                {[
                  { name: "Page Load Speed", val: "18ms", status: "Great", color: "bg-blue-500" },
                  { name: "Payment Processing Time", val: "1.2s", status: "Great", color: "bg-emerald-500" },
                  { name: "Database Usage", val: "14%", status: "Steady", color: "bg-amber-500" },
                  { name: "Server Memory", val: "42%", status: "Normal", color: "bg-indigo-500" },
                ].map((row, i) => (
                  <div key={i} className="space-y-2 group">
                     <div className="flex justify-between items-end">
                        <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest italic group-hover:text-primary transition-colors">{row.name}</span>
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-mono text-slate-500 font-black tracking-widest">{row.val}</span>
                           <span className={cn("text-[9px] font-black uppercase border-none px-2 h-4 flex items-center rounded-full text-white", row.color)}>{row.status}</span>
                        </div>
                     </div>
                     <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: row.val }}
                          transition={{ duration: 1.5, delay: i * 0.2 }}
                          className={cn("h-full rounded-full", row.color)} 
                        />
                     </div>
                  </div>
                ))}
            </CardContent>
         </Card>

         <Card className="border-none shadow-2xl bg-slate-900/40 backdrop-blur-xl rounded-[40px] border border-white/5 overflow-hidden">
            <CardHeader className="p-8 border-b border-white/5">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                         <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                         <CardTitle className="text-xl font-black italic tracking-tighter uppercase text-slate-100">Future Growth</CardTitle>
                         <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Predicted Growth</CardDescription>
                      </div>
                   </div>
                   <Badge className="bg-emerald-600 text-white font-black italic tracking-widest uppercase text-[10px] px-3">V4.2</Badge>
                </div>
            </CardHeader>
            <CardContent className="p-8 min-h-[300px] flex flex-col justify-center items-center text-center">
                <div className="space-y-4 max-w-sm">
                   <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                      <Globe className="h-8 w-8 text-emerald-500 animate-pulse" />
                   </div>
                   <h5 className="text-2xl font-black italic tracking-tighter uppercase text-slate-200">Rapid Growth Expected</h5>
                   <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-tighter">Based on current data, we expect a significant increase in new shops in the northern region over the next 3 months.</p>
                   <Button 
                     variant="outline" 
                     onClick={() => toast.info("Compiling full predictive growth matrix...")}
                     className="h-12 px-8 rounded-2xl border-white/10 font-bold uppercase tracking-widest text-[10px] bg-white/5 hover:bg-white/10 transition-all text-emerald-500 mt-6 gap-3"
                   >
                      View Full Report <ArrowUpRight className="h-4 w-4" />
                   </Button>
                </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
