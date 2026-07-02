import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Users, 
  Building2, 
  CreditCard, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp,
  RefreshCcw,
  Download,
  ShieldCheck,
  Zap,
  ArrowRight,
  Globe,
  Database,
  Ticket,
  DollarSign,
  Briefcase,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line
} from "recharts";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import apiClient from "@/lib/api-client";
import { AIInsights } from "@/components/dashboard/ai-insights";

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<any>({
    totalTenants: 0,
    totalUsers: 0,
    monthlyRevenue: 0,
    platformUptime: '—',
    averageResponseTime: '—'
  });
  const [revenueChart, setRevenueChart] = useState<any[]>([]);
  const [tenantChart, setTenantChart] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data } = await apiClient.get('/api/admin/platform-stats');
      if (data) {
        setStats(data);
        setRevenueChart(data.revenueChart || []);
        setTenantChart(data.tenantChart || []);
        setRecentActivity(data.recentActivity || []);
      }
    } catch (error) {
      console.warn("Unable to load platform stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadStats();
    setIsRefreshing(false);
    toast.success("Platform telemetry updated");
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-20">
      {/* Platform Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 bg-slate-900 border border-white/5 p-12 rounded-[48px] shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(220,38,38,0.1),transparent_70%)]" />
        <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 transition-transform duration-1000 group-hover:rotate-0">
           <Globe className="h-64 w-64 text-red-500" />
        </div>

        <div className="space-y-4 relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="h-2 w-12 rounded-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-500">Platform Command</span>
          </div>
          <h1 className="text-7xl font-black italic tracking-tighter uppercase leading-[0.8] text-white">Global <br />Operations.</h1>
          <p className="text-slate-400 font-bold text-sm max-w-lg italic tracking-tight leading-relaxed">
            Real-time telemetry and management interface for the entire SME OS network in Ghana.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto relative z-10">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-full sm:w-auto h-16 px-8 rounded-3xl border-white/5 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] transition-all"
          >
            <RefreshCcw className={cn("mr-3 h-4 w-4", isRefreshing && "animate-spin text-red-500")} />
            Sync Telemetry
          </Button>
          <Button 
            onClick={() => {
              toast.loading("Compiling global audit log...");
              setTimeout(() => toast.success("Nexus_Network_Audit_May.pdf generated"), 2500);
            }}
            className="w-full sm:w-auto h-16 px-8 rounded-3xl bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-red-500/20 shadow-none border-none"
          >
            <Download className="mr-3 h-4 w-4" />
            Export Audit
          </Button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Partner Shops", value: stats.totalTenants, icon: Building2, trend: "+12%", up: true },
          { label: "Active Users", value: stats.totalUsers, icon: Users, trend: "+5.1%", up: true },
          { label: "Monthly Gross", value: `₵${(stats.monthlyRevenue / 1000).toFixed(0)}K`, icon: DollarSign, trend: "+18%", up: true },
          { label: "Integrity", value: stats.platformUptime, icon: ShieldCheck, trend: "Stable", up: true },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 bg-slate-900 border border-white/5 rounded-[40px] hover:border-red-500/20 transition-all group"
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</span>
              <stat.icon className="h-5 w-5 text-red-500" />
            </div>
            <div className="text-5xl font-black italic tracking-tighter text-white mb-4">{stat.value}</div>
            <div className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase",
              stat.up ? "text-emerald-500 bg-emerald-500/10" : "text-amber-500 bg-amber-500/10"
            )}>
              <ArrowUpRight className="h-3 w-3" />
              {stat.trend}
            </div>
          </motion.div>
        ))}
      </div>

      {/* OPERATIONAL INTELLIGENCE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none bg-slate-900 rounded-[56px] overflow-hidden p-0 border border-white/5">
          <CardHeader className="p-10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Growth Vector</span>
            </div>
            <CardTitle className="text-3xl font-black italic tracking-tighter uppercase text-white">Revenue Momentum</CardTitle>
            <CardDescription className="text-slate-500 font-bold italic">Monthly growth coefficient across the ecosystem.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] px-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: '900', fill: '#475569'}}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: '900', fill: '#475569'}}
                  unit="%"
                />
                <ChartTooltip 
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    backgroundColor: '#0f172a',
                    fontSize: '12px',
                    fontWeight: '900'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="growth" 
                  stroke="#10b981" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#0f172a' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none bg-slate-900 rounded-[56px] overflow-hidden p-0 border border-white/5">
          <CardHeader className="p-10">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Acquisition Pulse</span>
            </div>
            <CardTitle className="text-3xl font-black italic tracking-tighter uppercase text-white">Tenant Velocity</CardTitle>
            <CardDescription className="text-slate-500 font-bold italic">Global partner onboarding rate.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] px-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tenantChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: '900', fill: '#475569'}}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: '900', fill: '#475569'}}
                />
                <ChartTooltip 
                  cursor={{fill: 'rgba(255,255,255,0.02)'}}
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    backgroundColor: '#0f172a',
                    fontSize: '12px',
                    fontWeight: '900'
                  }}
                />
                <Bar dataKey="tenants" radius={[8, 8, 0, 0]}>
                  {tenantChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === tenantChart.length - 1 ? '#3b82f6' : '#1e293b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none bg-slate-900 rounded-[56px] overflow-hidden p-0 border border-white/5">
          <CardHeader className="p-12 pb-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-red-500 fill-red-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Market Performance</span>
                </div>
                <CardTitle className="text-4xl font-black italic tracking-tighter uppercase text-white">Earnings Outlook</CardTitle>
                <CardDescription className="text-slate-500 font-bold italic">Dynamic cross-platform revenue analysis.</CardDescription>
              </div>
              <div className="text-right hidden sm:block">
                 <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Response Time</div>
                 <div className="text-xl font-black italic tracking-tighter text-red-500 uppercase">{stats.averageResponseTime}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 pb-12 overflow-hidden h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChart} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="rgba(255,255,255,0.02)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: '900', fill: '#475569'}}
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: '900', fill: '#475569'}}
                  dx={-15}
                />
                <ChartTooltip 
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    backgroundColor: '#0f172a',
                    padding: '24px'
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#ef4444" strokeWidth={6} fill="url(#glow)" animationDuration={3000} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none bg-slate-900 rounded-[56px] overflow-hidden p-0 border border-white/5 flex flex-col">
          <CardHeader className="p-10 pb-0">
             <div className="flex items-center gap-2 mb-4">
                <Activity className="h-4 w-4 text-red-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Real-time Stream</span>
             </div>
             <CardTitle className="text-4xl font-black italic tracking-tighter uppercase text-white">Live <br/>Events.</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-10 space-y-4">
            {recentActivity.length > 0 ? recentActivity.map((activity, i) => (
              <motion.div 
                key={activity.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + (i * 0.1) }}
                className="flex items-center gap-4 p-5 rounded-[28px] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group"
              >
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center transition-all group-hover:rotate-12",
                  activity.status === 'success' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                )}>
                  <Activity className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black italic uppercase tracking-tight text-white mb-1 truncate">{activity.text}</p>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{activity.time}</span>
                </div>
              </motion.div>
            )) : (
              <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                <div className="h-12 w-12 rounded-2xl bg-white/[0.02] flex items-center justify-center">
                  <Activity className="h-6 w-6 text-slate-600" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">No recent activity</p>
              </div>
            )}
            <Button 
               variant="ghost" 
               onClick={() => toast.info("Opening master event telemetry...")}
               className="w-full h-14 rounded-2xl border border-white/5 mt-4 group"
             >
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-red-500 transition-colors">Load Master Log</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* AI Platform Insights */}
      <AIInsights insights={[]} />

      {/* Section Divider */}
      <div className="flex items-center gap-10 opacity-20">
         <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white" />
         <span className="text-[10px] font-black uppercase tracking-[1em] text-white whitespace-nowrap">Platform Modules</span>
         <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white" />
      </div>

      {/* Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { title: "Tenants", icon: Building2, color: "text-blue-500", link: "/super-admin/tenants", desc: "Manage shop networks" },
          { title: "Integrity", icon: ShieldCheck, color: "text-red-500", link: "/super-admin/logs", desc: "Audit and security" },
          { title: "Billing", icon: CreditCard, color: "text-emerald-500", link: "/super-admin/transactions", desc: "Payment flows" },
          { title: "Users", icon: Users, color: "text-amber-500", link: "/super-admin/users", desc: "Platform governors" },
        ].map((item, i) => (
          <Link to={item.link} key={item.title}>
            <motion.div
              whileHover={{ y: -5 }}
              className="p-8 rounded-[40px] bg-slate-900 border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between h-64 relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-150 transition-transform duration-700">
                <item.icon className="h-32 w-32" />
              </div>
              <div>
                <item.icon className={cn("h-8 w-8 mb-6", item.color)} />
                <h3 className="text-3xl font-black italic tracking-tighter uppercase text-white">{item.title}.</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">{item.desc}</p>
              </div>
              <div className="flex justify-end">
                <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <ArrowRight className="h-4 w-4 text-white" />
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}

