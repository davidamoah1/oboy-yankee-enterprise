import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  TrendingUp, 
  Package, 
  Users, 
  History,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Plus,
  ArrowRight,
  Filter,
  Download,
  Calendar,
  Layers,
  Sparkles,
  Zap,
  HelpCircle,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertTriangle,
  AlertCircle,
  Receipt
} from "lucide-react";
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
  Cell 
} from 'recharts';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { offlinePOS } from "@/features/pos/services/offline-pos";

const defaultSalesData = [
  { name: 'Sun', total: 0, orders: 0 },
  { name: 'Mon', total: 0, orders: 0 },
  { name: 'Tue', total: 0, orders: 0 },
  { name: 'Wed', total: 0, orders: 0 },
  { name: 'Thu', total: 0, orders: 0 },
  { name: 'Fri', total: 0, orders: 0 },
  { name: 'Sat', total: 0, orders: 0 },
];

export default function TenantDashboard() {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [stats, setStats] = useState<any>({
    todaySales: 0,
    todaySalesCount: 0,
    todayProfit: 0,
    monthSales: 0,
    monthSalesCount: 0,
    monthProfit: 0,
    monthExpenses: 0,
    netProfit: 0,
    totalCustomers: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    todayExpenses: 0,
    activeStaff: 0,
    creditOutstanding: 0,
  });
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [salesData, setSalesData] = useState(defaultSalesData);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [paymentBreakdown, setPaymentBreakdown] = useState({ cash: 0, momo: 0, card: 0, credit: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const checkPending = async () => {
      const pending = await offlinePOS.getPendingTransactions();
      setPendingCount(pending.length);
    };
    
    async function fetchDashboardIntelligence() {
      try {
        const [statsRes, prodRes] = await Promise.all([
          apiClient.get('/api/dashboard/stats'),
          apiClient.get('/api/products')
        ]);

        const dashData = statsRes.data || {};
        const prodData = prodRes.data?.data || prodRes.data || [];

        setStats({
          todaySales: dashData.todaySales || 0,
          todaySalesCount: dashData.todaySalesCount || 0,
          todayProfit: dashData.todayProfit || 0,
          monthSales: dashData.monthSales || 0,
          monthSalesCount: dashData.monthSalesCount || 0,
          monthProfit: dashData.monthProfit || 0,
          monthExpenses: dashData.monthExpenses || 0,
          netProfit: dashData.netProfit || 0,
          totalCustomers: dashData.totalCustomers || 0,
          totalProducts: dashData.totalProducts || 0,
          lowStockProducts: dashData.lowStockProducts || 0,
          todayExpenses: dashData.todayExpenses || 0,
          activeStaff: dashData.activeStaff || 0,
          creditOutstanding: dashData.creditOutstanding || 0,
        });

        if (dashData.weeklyChart && dashData.weeklyChart.length > 0) {
          setSalesData(dashData.weeklyChart);
        }
        if (dashData.topProducts) setTopProducts(dashData.topProducts);
        if (dashData.recentSales) setRecentSales(dashData.recentSales);
        if (dashData.paymentBreakdown) setPaymentBreakdown(dashData.paymentBreakdown);

        let allProducts: any[] = Array.isArray(prodData) ? prodData : [];
        const lowStockItems = allProducts.filter((p: any) => {
          const threshold = p.lowStockThreshold !== null && p.lowStockThreshold !== undefined
            ? Number(p.lowStockThreshold)
            : 10;
          return Number(p.stockQuantity) <= threshold;
        });
        setLowStock(lowStockItems);

      } catch (err) {
        console.error("Dashboard Intelligence Failure:", err);
      } finally {
        setLoading(false);
      }
    }
    
    checkPending();
    fetchDashboardIntelligence();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="space-y-6 sm:space-y-10 pb-20 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 sm:gap-10">
        <div className="flex flex-col md:flex-row justify-between flex-1 gap-4 w-full">
          <div className="space-y-2">
            <h1 className="text-3xl xs:text-5xl sm:text-7xl font-black tracking-tighter uppercase italic py-1 leading-none text-foreground">
              Shop <span className="opacity-35">Dashboard</span>
            </h1>
          </div>

          <div className="flex items-center gap-4 lg:justify-end">
            <div className="flex flex-col items-start md:items-end">
               <Badge variant="outline" className={cn(
                 "rounded-full h-8 px-4 font-black uppercase tracking-widest text-[9px] gap-2 border-border/80 bg-background",
                 isOnline ? "text-emerald-500 bg-emerald-500/10" : "text-red-500 bg-red-500/10"
               )}>
                 {isOnline ? (
                   <><div className="h-1 w-1 rounded-full bg-current" /> Online Mode</>
                 ) : (
                   <><div className="h-1 w-1 rounded-full bg-current" /> Offline Mode</>
                 )}
               </Badge>
               {pendingCount > 0 && (
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-amber-500 mt-2 animate-pulse">{pendingCount} Sales Waiting to Sync</span>
               )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <Button 
            data-tour="start-selling"
            className="w-full sm:w-auto rounded-2xl h-12 sm:h-14 px-6 sm:px-8 gap-3 font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/10 bg-emerald-500 hover:bg-emerald-400 text-black group transition-all" 
            onClick={() => navigate('/pos')}
          >
            <Zap className="h-5 w-5 fill-current" />
            Start Selling
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            variant="outline" 
            className="w-full sm:w-auto rounded-2xl h-12 sm:h-14 px-6 sm:px-8 gap-3 font-black uppercase tracking-widest text-xs border-border/80 bg-card hover:bg-muted font-bold transition-all" 
            onClick={() => navigate('/inventory')}
          >
            <Package className="h-5 w-5 text-muted-foreground" />
            Check Stock & Products
          </Button>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStock.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-[2.2rem] border border-red-500/20 bg-red-950/10 backdrop-blur-xl p-6 sm:p-8 space-y-6"
        >
          {/* Subtle Ambient Red Glow */}
          <div className="absolute inset-x-0 top-0 h-[100px] bg-gradient-to-b from-red-500/10 to-transparent pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 pb-2 border-b border-white/[0.03]">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0 border border-red-500/20">
                <AlertTriangle className="h-6 w-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter italic text-red-400">
                    Low Stock Attention Required
                  </h2>
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,1)]" />
                </div>
                <p className="text-xs font-semibold text-muted-foreground/80 tracking-wider">
                  You have <span className="text-red-400 font-black">{lowStock.length} product(s)</span> that have reached or dropped below their low stock threshold.
                </p>
              </div>
            </div>
            
            <Button
              onClick={() => navigate('/inventory')}
              className="rounded-2xl h-12 px-6 sm:px-8 gap-3 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-500/10 bg-red-500 hover:bg-red-400 text-black group transition-all shrink-0 cursor-pointer active:scale-95"
            >
              <Package className="h-4 w-4" />
              Restock Inventory
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 relative z-10">
            {lowStock.slice(0, 6).map((prod) => {
              const threshold = prod.low_stock_threshold !== null && prod.low_stock_threshold !== undefined
                ? prod.low_stock_threshold
                : 10;
              const isCriticallyEmpty = prod.stock_quantity <= 0;
              return (
                <div 
                  key={prod.id} 
                  onClick={() => navigate('/inventory')}
                  className="group relative flex items-center justify-between p-4 rounded-2xl border border-white/[0.03] bg-black/20 hover:bg-black/30 hover:border-red-500/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border",
                      isCriticallyEmpty 
                        ? "bg-red-500/10 text-red-500 border-red-500/20" 
                        : "bg-amber-500/5 text-amber-500 border-amber-500/20"
                    )}>
                      {isCriticallyEmpty ? <AlertCircle className="h-5 w-5" /> : <Package className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-black text-xs uppercase tracking-widest text-foreground group-hover:text-red-400 transition-colors truncate">
                        {prod.name}
                      </div>
                      <div className="text-[9px] text-muted-foreground font-semibold uppercase tracking-widest mt-0.5 truncate">
                        Limit: {threshold} • SKU: {prod.sku || "N/A"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn(
                      "text-xs font-black italic tracking-tighter leading-none mb-1",
                      isCriticallyEmpty ? "text-red-500" : "text-amber-500"
                    )}>
                      {prod.stock_quantity} Left
                    </p>
                    <Badge className={cn(
                      "text-[8px] h-4 font-black uppercase tracking-widest border-none px-1.5 leading-none",
                      isCriticallyEmpty 
                        ? "bg-red-500/10 text-red-500" 
                        : "bg-amber-500/10 text-amber-500"
                    )}>
                      {isCriticallyEmpty ? "Empty" : "Low"}
                    </Badge>
                  </div>
                </div>
              );
            })}
            {lowStock.length > 6 && (
              <div 
                onClick={() => navigate('/inventory')}
                className="group relative flex items-center justify-center p-4 rounded-2xl border border-dashed border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-all cursor-pointer h-full"
              >
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-400">+{lowStock.length - 6} More Items</p>
                  <p className="text-[8px] text-muted-foreground font-semibold uppercase mt-0.5">Click to view whole list</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <div data-tour="quick-actions" className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'New Sale', icon: Zap, href: '/pos', color: 'text-emerald-500' },
          { label: 'Add Product', icon: Package, href: '/inventory', color: 'text-blue-500' },
          { label: 'View Receipts', icon: Receipt, href: '/receipts', color: 'text-purple-500' },
          { label: 'Reports', icon: TrendingUp, href: '/reports', color: 'text-amber-500' },
        ].map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => navigate(action.href)}
            className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-[2.2rem] bg-card/40 backdrop-blur-xl border border-border hover:bg-muted/80 transition-all group gap-3 sm:gap-4 shadow-sm"
          >
            <div className={cn("h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform", action.color)}>
              <action.icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground transition-colors text-center">{action.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Key Stats */}
      <div data-tour="kpi-cards" className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Today's Sales", value: `₵ ${stats.todaySales.toLocaleString()}`, trend: `${stats.todaySalesCount} orders`, status: 'optimal', icon: TrendingUp, href: '/sales' },
          { label: "Today's Profit", value: `₵ ${stats.todayProfit.toLocaleString()}`, trend: stats.todayProfit > 0 ? 'Profit' : 'No profit', status: 'positive', icon: ArrowUpRight, href: '/profit-analysis' },
          { label: 'Products in Stock', value: stats.totalProducts.toString(), trend: `${stats.lowStockProducts} low stock`, status: stats.lowStockProducts > 0 ? 'neutral' : 'positive', icon: Package, href: '/inventory' },
          { label: 'Unpaid Credit', value: `₵ ${stats.creditOutstanding.toLocaleString()}`, trend: stats.creditOutstanding > 0 ? 'Outstanding' : 'All cleared', status: stats.creditOutstanding > 0 ? 'neutral' : 'positive', icon: ArrowDownRight, href: '/credit-sales' },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative cursor-pointer"
            onClick={() => navigate(kpi.href)}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-br from-emerald-500/20 to-emerald-900/10 rounded-[2.2rem] opacity-0 group-hover:opacity-100 transition duration-500" />
            <Card className="border-border shadow-md relative overflow-hidden bg-card/40 backdrop-blur-xl p-5 sm:p-6 rounded-[2.2rem] hover:translate-y-[-4px] transition-all duration-300 min-w-0">
              <div className="flex justify-between items-start mb-4 sm:mb-6 gap-2">
                 <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-border shrink-0">
                   <kpi.icon className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
                 </div>
                 <Badge className={cn(
                   "text-[9px] font-black uppercase tracking-widest h-6 border-none shrink-0",
                   kpi.status === 'optimal' ? "bg-emerald-500/10 text-emerald-500" :
                   kpi.status === 'positive' ? "bg-blue-500/10 text-blue-500" :
                   "bg-muted text-muted-foreground"
                 )}>
                   {kpi.trend}
                 </Badge>
              </div>
              <div className="space-y-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 truncate">{kpi.label}</p>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black italic tracking-tighter text-foreground truncate">{kpi.value}</h3>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="space-y-6 sm:space-y-10">
          <Card data-tour="sales-chart" className="border-border shadow-md overflow-hidden flex flex-col p-3 sm:p-4 min-h-[400px] sm:min-h-[500px] bg-card/40 backdrop-blur-xl rounded-[2.2rem] sm:rounded-[2.5rem] min-w-0">
            <CardHeader className="px-4 sm:px-8 pt-4 sm:pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1 sm:space-y-2">
                <CardTitle className="text-xl sm:text-2xl font-black uppercase tracking-tighter italic text-foreground">Weekly Sales Graph</CardTitle>
                <CardDescription className="text-xs font-medium text-muted-foreground tracking-wider">Sales and progress for the last 7 days</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl h-10 px-5 sm:px-6 text-[10px] font-black uppercase tracking-widest border-border bg-card w-full sm:w-auto"
                onClick={() => navigate('/reports')}
              >
                Open Detailed Reports
              </Button>
            </CardHeader>
            <CardContent className="flex-1 px-2 sm:px-4 pb-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.65 0.2 165)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="oklch(0.65 0.2 165)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 9, fontWeight: 800, fill: 'var(--muted-foreground)'}} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 9, fontWeight: 800, fill: 'var(--muted-foreground)'}}
                    dx={-5}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--card)', 
                      borderRadius: '20px', 
                      border: '1px solid var(--border)',
                      boxShadow: '0 20px 40px -15px rgb(0 0 0 / 0.15)',
                      padding: '16px',
                      backdropFilter: 'blur(10px)'
                    }}
                    itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--primary)' }}
                    labelStyle={{ fontSize: '11px', fontWeight: 900, marginBottom: '6px', color: 'var(--foreground)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="oklch(0.65 0.2 165)" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorTotal)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Products & Payment Breakdown */}
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            <Card className="border-border shadow-md flex flex-col p-3 sm:p-4 bg-card/40 backdrop-blur-xl rounded-[2.2rem] overflow-hidden min-w-0">
              <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
                <div className="space-y-1">
                  <CardTitle className="text-lg sm:text-xl font-black uppercase tracking-tighter italic text-foreground">Top Selling Products</CardTitle>
                  <CardDescription className="text-xs font-medium text-muted-foreground">Best sellers this month</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="px-2 sm:px-4 pb-4">
                {topProducts.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.3} />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 800, fill: 'var(--muted-foreground)' }} />
                      <YAxis type="category" dataKey="name" width={80} axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 800, fill: 'var(--muted-foreground)' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '20px', border: '1px solid var(--border)', padding: '12px' }}
                        itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--primary)' }}
                        labelStyle={{ fontSize: '11px', fontWeight: 900, color: 'var(--foreground)' }}
                      />
                      <Bar dataKey="revenue" radius={[0, 8, 8, 0]} fill="oklch(0.65 0.2 165)" animationDuration={1500} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center opacity-70">
                    <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-3">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground">No Sales Data Yet</p>
                    <p className="text-[9px] text-muted-foreground max-w-[150px] mt-1">Top products will appear here once sales are made.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border shadow-md flex flex-col p-3 sm:p-4 bg-card/40 backdrop-blur-xl rounded-[2.2rem] overflow-hidden min-w-0">
              <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
                <div className="space-y-1">
                  <CardTitle className="text-lg sm:text-xl font-black uppercase tracking-tighter italic text-foreground">Payment Methods (7 Days)</CardTitle>
                  <CardDescription className="text-xs font-medium text-muted-foreground">Cash, MoMo, Card & Credit breakdown</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 space-y-4">
                {[
                  { label: 'Cash', value: paymentBreakdown.cash, color: 'bg-emerald-500', text: 'text-emerald-500' },
                  { label: 'Mobile Money', value: paymentBreakdown.momo, color: 'bg-yellow-500', text: 'text-yellow-500' },
                  { label: 'Card', value: paymentBreakdown.card, color: 'bg-blue-500', text: 'text-blue-500' },
                  { label: 'Credit', value: paymentBreakdown.credit, color: 'bg-red-500', text: 'text-red-500' },
                ].map((pm) => {
                  const total = paymentBreakdown.cash + paymentBreakdown.momo + paymentBreakdown.card + paymentBreakdown.credit;
                  const pct = total > 0 ? (pm.value / total) * 100 : 0;
                  return (
                    <div key={pm.label} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground">{pm.label}</span>
                        <span className={cn("text-xs font-black italic tracking-tighter", pm.text)}>₵ {pm.value.toLocaleString()}</span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all duration-1000", pm.color)} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{pct.toFixed(1)}% of total</span>
                    </div>
                  );
                })}
                {paymentBreakdown.cash + paymentBreakdown.momo + paymentBreakdown.card + paymentBreakdown.credit === 0 && (
                  <div className="flex flex-col items-center justify-center py-6 text-center opacity-70">
                    <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-3">
                      <History className="h-6 w-6" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground">No Payment Data Yet</p>
                    <p className="text-[9px] text-muted-foreground max-w-[150px] mt-1">Payment breakdown will appear here once sales are made.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            {/* Recent Sales Section */}
            <Card className="border-border shadow-md flex flex-col p-3 sm:p-4 bg-card/40 backdrop-blur-xl rounded-[2.2rem] overflow-hidden min-w-0">
              <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 flex flex-row items-center justify-between">
                <div className="space-y-1 min-w-0">
                  <CardTitle className="text-lg sm:text-xl font-black uppercase tracking-tighter italic text-foreground">Recent Sales</CardTitle>
                  <CardDescription className="text-xs font-medium text-muted-foreground">Latest transactions made in the shop</CardDescription>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,1)]" />
              </CardHeader>
              <CardContent className="px-2 sm:px-4 pb-4 space-y-3">
                 {recentSales.length > 0 ? recentSales.map((tx, i) => (
                   <div 
                     key={tx.id || i} 
                     className="group flex items-center justify-between p-4 rounded-2xl border border-border/60 hover:bg-secondary/40 hover:border-emerald-500/20 transition-all cursor-pointer"
                     onClick={() => navigate('/receipts')}
                   >
                     <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 sm:h-11 sm:w-12 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-emerald-500 transition-colors border border-border shrink-0">
                           <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                           <div className="font-black text-xs uppercase tracking-widest text-foreground truncate">{tx.productName}</div>
                           <div className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-0.5 truncate">{tx.cashierName} • {tx.paymentMethod}</div>
                        </div>
                     </div>
                     <div className="text-right shrink-0">
                        <div className="text-base font-black italic tracking-tighter text-emerald-500">₵ {tx.amount.toLocaleString()}</div>
                        <Badge variant="outline" className="text-[8px] h-5 font-black uppercase tracking-widest border-none px-2 bg-emerald-500/10 text-emerald-500">Done</Badge>
                     </div>
                   </div>
                  )) : (
                   <div className="flex flex-col items-center justify-center py-8 text-center opacity-70">
                      <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-3">
                         <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-foreground">No Sales Yet Today</p>
                      <p className="text-[9px] text-muted-foreground max-w-[150px] mt-1">Sales will appear here as they happen.</p>
                   </div>
                  )}
              </CardContent>
            </Card>

            {/* Low Stock Watch Section */}
            <Card data-tour="low-stock" className="border-border shadow-md flex flex-col p-3 sm:p-4 bg-card/40 backdrop-blur-xl rounded-[2.2rem] overflow-hidden min-w-0">
              <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 flex flex-row items-center justify-between">
                <div className="space-y-1 min-w-0">
                  <CardTitle className="text-lg sm:text-xl font-black uppercase tracking-tighter italic text-foreground">Low Stock Warnings</CardTitle>
                  <CardDescription className="text-xs font-medium text-muted-foreground">Products running out of stock soon</CardDescription>
                </div>
                {lowStock.length > 0 && <Badge className="bg-red-500/10 text-red-500 border-none text-[9px] font-black">{lowStock.length} ALERTS</Badge>}
              </CardHeader>
              <CardContent className="px-2 sm:px-4 pb-4 space-y-3">
                 {lowStock.length > 0 ? (
                   lowStock.map((prod) => (
                    <div key={prod.id} className="group flex items-center justify-between p-4 rounded-2xl border border-border/60 hover:bg-secondary/40 hover:border-red-500/20 transition-all cursor-pointer" onClick={() => navigate('/inventory')}>
                      <div className="flex items-center gap-3 min-w-0">
                         <div className="h-10 w-10 sm:h-11 sm:w-12 rounded-xl bg-secondary flex items-center justify-center text-red-500 border border-border shrink-0">
                            <Package className="h-4 w-4" />
                         </div>
                         <div className="min-w-0">
                            <div className="font-black text-xs uppercase tracking-widest text-foreground truncate">{prod.name}</div>
                            <div className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-0.5 truncate">{prod.category || 'General'}</div>
                         </div>
                      </div>
                      <div className="text-right shrink-0">
                         <div className="text-base font-black italic tracking-tighter text-red-400">{prod.stock_quantity}</div>
                         <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Units Left</div>
                      </div>
                    </div>
                   ))
                 ) : (
                   <div className="flex flex-col items-center justify-center py-8 text-center opacity-70">
                      <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-3">
                         <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-foreground">All Stock Levels Good</p>
                      <p className="text-[9px] text-muted-foreground max-w-[150px] mt-1">No store items are running low right now.</p>
                   </div>
                 )}
              </CardContent>
            </Card>
          </div>
      </div>
    </div>
  );
}
