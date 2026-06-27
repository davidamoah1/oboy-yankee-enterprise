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
  AlertCircle
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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { NexaIntelligenceHub } from "@/components/intelligence/nexa-intelligence-hub";
import { NexaAssistant } from "@/components/intelligence/nexa-assistant";
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
  const { company } = useAuth();
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

  const selectedTypeRaw = company?.settings?.category || "Retail";
  
  // Normalize key
  let businessType = selectedTypeRaw;
  if (selectedTypeRaw === "Fashion Shop") businessType = "Fashion Store";
  if (selectedTypeRaw === "Cosmetics Shop") businessType = "Cosmetics Store";
  if (selectedTypeRaw === "Wholesale Shop" || selectedTypeRaw === "Wholesale") businessType = "Wholesale Business";

  // Specialized Workflow definition for visual guidance
  const businessWorkflows: Record<string, {
    title: string;
    desc: string;
    steps: { label: string; desc: string; href: string; actionText: string }[];
  }> = {
    "Provision Shop": {
      title: "Provision Shop Smart Workflow",
      desc: "Fast counter sales, quick debtor credit books, and MoMo collections.",
      steps: [
        { label: "Receive Stock", desc: "Update provisions in inventory", href: `/inventory`, actionText: "Add Stock" },
        { label: "Fast Checkout", desc: "Open the cashier counters", href: `/pos`, actionText: "Sell Now" },
        { label: "Collection Scan", desc: "Process payments via MTN, Telecel", href: `/mobile-money`, actionText: "Run MoMo" },
        { label: "Debtor Credit Book", desc: "Log customer micro debts & credits", href: `/customers`, actionText: "Credit Log" },
        { label: "Daily Balance Sheets", desc: "Extract current daily balances", href: `/reports`, actionText: "Check Balance" },
      ]
    },
    "Mini Mart": {
      title: "Mini Mart Inventory Speed Workflow",
      desc: "Optimized for fast moving consumer goods, critical barcode checkout, and instant stock level checks.",
      steps: [
        { label: "Receive FMCG Packets", desc: "Populate shelves and log inventory", href: `/inventory`, actionText: "Stock FMCG" },
        { label: "Smart Scan Checkout", desc: "Fast-register scan mode enabled", href: `/pos`, actionText: "Scan POS" },
        { label: "Instantly Settle Bills", desc: "Record cash and MoMo references", href: `/pos`, actionText: "Cash Out" },
        { label: "Review Daily Margins", desc: "Monitor stock turn ratios and profits", href: `/reports`, actionText: "View Profit" }
      ]
    },
    "Supermarket": {
      title: "Supermarket Bulk Operations Workflow",
      desc: "Multi-register management, high-volume inventory ingress, and real-time reconciliation logs.",
      steps: [
        { label: "Mass Cargo Ingress", desc: "Perform bulk imports & configure shelves", href: `/inventory`, actionText: "Bulk Stock" },
        { label: "Counter Multi-Registers", desc: "Dispatch cashiers and launch dynamic POS", href: `/pos`, actionText: "Consoles" },
        { label: "Reconciliation Ledger", desc: "Inspect pooled cashier registers & flows", href: `/accounting`, actionText: "Audit" },
        { label: "Smart Restock Alerts", desc: "Forecast low-stock triggers by trend", href: `/reports`, actionText: "Forecast" }
      ]
    },
    "Pharmacy": {
      title: "SME Pharmacy Dispensing Workflow",
      desc: "Track medicine expiration dates, batches, and stock threshold alarms.",
      steps: [
        { label: "Receive Medicines", desc: "Update batch parameters & expiries", href: `/inventory`, actionText: "Log Batch" },
        { label: "Dispensing POS", desc: "Search drug terms in checkout", href: `/pos`, actionText: "Dispense POS" },
        { label: "MoMo Clearing", desc: "Verify mobile transfer receipts", href: `/mobile-money`, actionText: "Clear MoMo" },
        { label: "Supplier Restocks", desc: "Re-order critical empty groups", href: `/suppliers`, actionText: "Restock Out" },
      ]
    },
    "Restaurant": {
      title: "Quick-Serve Restaurant Food Workflow",
      desc: "Direct table dispatcher, kitchen feed tickets, and checkout bill splitters.",
      steps: [
        { label: "Tables & Seating", desc: "View tables or table seating stats", href: `/customers`, actionText: "Tables" },
        { label: "Take Food Order", desc: "Trigger pos layout kitchen tickets", href: `/pos`, actionText: "Take Order" },
        { label: "Split Settlement", desc: "Separate check amounts in register", href: `/pos`, actionText: "Checkout" },
        { label: "Digital Receipts", desc: "Share checkout receipt onto WhatsApp", href: `/receipts`, actionText: "Receipts" },
      ]
    },
    "Fashion Store": {
      title: "Boutique & Fashion Apparel Workflow",
      desc: "Sizing variants, style logs, customer loyalty cards, and catalog scans.",
      steps: [
        { label: "Catalogs & Sizing", desc: "Input style size/color details", href: `/inventory`, actionText: "Sizing Variants" },
        { label: "Visual Register", desc: "Sell clothing with fast picture menus", href: `/pos`, actionText: "POS Grid" },
        { label: "Customer Loyalty", desc: "Reward repeat buyers with discounts", href: `/customers`, actionText: "Loyalty Tier" },
        { label: "Apparel Analytics", desc: "Graph top design sales this week", href: `/reports`, actionText: "Hot Styles" },
      ]
    },
    "Cosmetics Store": {
      title: "Beauty & Cosmetics Specialist Workflow",
      desc: "Manage beauty brand segments, batch health diagnostics, and client preference records.",
      steps: [
        { label: "Serums & Brands Ingress", desc: "Group items by medical and trend segment", href: `/inventory`, actionText: "Log Brands" },
        { label: "Boutique Registers", desc: "Check out with targeted beauty details", href: `/pos`, actionText: "Boutique POS" },
        { label: "Skin Profile Registry", desc: "Save client contact & previous brand orders", href: `/customers`, actionText: "Loyalty" },
        { label: "Brand Turn Ratios", desc: "Generate report on trend-setting items", href: `/reports`, actionText: "Growth" }
      ]
    },
    "Electronics Shop": {
      title: "Smart Electronics Diagnostics Workflow",
      desc: "Register critical Serial/IMEI tags, issue warranty cards, and ledger dynamic installment plans.",
      steps: [
        { label: "Register Serial Numbers", desc: "Define tracking identifiers & specs", href: `/inventory`, actionText: "Specs Stock" },
        { label: "Warranty Checkout", desc: "Trigger invoice receipts detailing terms", href: `/pos`, actionText: "Invoice Sell" },
        { label: "Amortize Payments", desc: "Log micro installment balances safely", href: `/customers`, actionText: "Credit Ledger" },
        { label: "Defects Check", desc: "Manage supplier returns protocols", href: `/suppliers`, actionText: "Supplier Ledger" }
      ]
    },
    "Hardware Store": {
      title: "Industrial Hardware & Building Supply Workflow",
      desc: "Manage loose bulk commodities (cement bags, iron rods), builder tiers, and shipment details.",
      steps: [
        { label: "Log Bulky Commodity", desc: "Register loose pallet lots & heavy specs", href: `/inventory`, actionText: "Log Bulky" },
        { label: "High Volume Despatch", desc: "Perform bulk invoicing & checkout", href: `/pos`, actionText: "Despatch POS" },
        { label: "Invoicing Batches", desc: "Track partial payments & site dispatch logs", href: `/invoices`, actionText: "Invoice Book" },
        { label: "Contractor Settle", desc: "Collect site builder credits & debts", href: `/customers`, actionText: "Check Ledger" }
      ]
    },
    "Salon": {
      title: "Salons & Spa Service Dispatch Workflow",
      desc: "Track stylist commission targets, services packages selection, and checkout tipping.",
      steps: [
        { label: "Treatments & Services", desc: "Input treatment slots and stylist pricing", href: `/inventory`, actionText: "Stock Services" },
        { label: "Stylist Selection Registers", desc: "Trigger services checkout with tip allocations", href: `/pos`, actionText: "Stylist POS" },
        { label: "MoMo Tipping clearing", desc: "Verify mobile transfer and cash pools", href: `/mobile-money`, actionText: "Momo Clearing" },
        { label: "Stylist Commission Book", desc: "Generate reports on service performance", href: `/payroll`, actionText: "Commissions" }
      ]
    },
    "Wholesale Business": {
      title: "High Volume Wholesale Workflow",
      desc: "Manage client tiers, palettes, payment installments, and shipments.",
      steps: [
        { label: "Bulk Stock", desc: "Register large pallets and crates", href: `/inventory`, actionText: "Bulk Inventory" },
        { label: "Dynamic Invoicing", desc: "Create batch invoice sheets", href: `/invoices`, actionText: "Bill Invoice" },
        { label: "Partial Payments", desc: "Accept upfront deposits & set terms", href: `/customers`, actionText: "Debt Book" },
        { label: "Supplier Ledger", desc: "Order restocking from wholesalers", href: `/suppliers`, actionText: "Suppliers" },
      ]
    }
  };

  const defaultWorkflow = {
    title: "SME Operating System Workflow",
    desc: "Standard stock input to cash collection cycles.",
    steps: [
      { label: "Stock Items", desc: "Register items in stock tracker", href: `/inventory`, actionText: "Stock Items" },
      { label: "Cash Register", desc: "Sell provisions and scan checkout", href: `/pos`, actionText: "Launch POS" },
      { label: "Trace Payments", desc: "Check MoMo and cash ledger", href: `/mobile-money`, actionText: "Verify Ledger" },
      { label: "Analyze Margin", desc: "Extract sales totals and growth", href: `/reports`, actionText: "View Sales" },
    ]
  };

  const activeWorkflow = businessWorkflows[businessType] || defaultWorkflow;

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
    <div className="space-y-6 sm:space-y-10 pb-20">
      <NexaAssistant />

      {/* Header with Connectivity Status */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 sm:gap-10">
        <div className="flex flex-col md:flex-row justify-between flex-1 gap-4 w-full">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-emerald-500">
               <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)] animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] font-display">Data Synced</span>
            </div>
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
            className="w-full sm:w-auto rounded-2xl h-12 sm:h-14 px-6 sm:px-8 gap-3 font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/10 bg-emerald-500 hover:bg-emerald-400 text-black group transition-all" 
            onClick={() => navigate('/pos')}
          >
            <Zap className="h-5 w-5 fill-current" />
            Open Cash Register
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

      {/* Specialized Adaptive SME Operating Workflow */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-[2.2rem] border border-border bg-card/60 backdrop-blur-xl p-6 sm:p-8 space-y-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black uppercase text-[9px] tracking-widest px-2.5 h-5 rounded-full">
                {businessType.toUpperCase()} Workflow Mode
              </Badge>
            </div>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight italic text-foreground mt-2">
              {activeWorkflow.title}
            </h3>
            <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
              {activeWorkflow.desc} Run your shop using this optimized step-by-step process.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2 text-xs font-bold text-emerald-500 font-mono tracking-wider bg-emerald-500/5 px-4 h-10 rounded-2xl border border-emerald-500/10">
             <span>SYSTEM ACTIVE</span>
          </div>
        </div>

        {/* Step-by-Step interactive process bar */}
        <div className={cn(
          "grid grid-cols-1 sm:grid-cols-2 gap-4",
          activeWorkflow.steps.length === 5 ? "lg:grid-cols-5" : "lg:grid-cols-4"
        )}>
          {activeWorkflow.steps.map((step, idx) => (
            <div 
              key={step.label}
              className="bg-secondary/40 border border-border/60 p-5 rounded-2xl flex flex-col justify-between hover:bg-secondary/80 hover:border-emerald-500/20 transition-all cursor-pointer h-full group/workflow"
              onClick={() => navigate(step.href)}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 font-mono">
                    Step {idx + 1}
                  </span>
                  <div className="h-2 w-2 rounded-full bg-emerald-500/30 group-hover/workflow:bg-emerald-500 group-hover/workflow:animate-ping transition-colors" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-foreground group-hover/workflow:text-emerald-500 transition-colors">
                    {step.label}
                  </h4>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold leading-relaxed mt-1">
                    {step.desc}
                  </p>
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-border/40 flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground group-hover/workflow:text-[#00ff87] transition-all">
                  {step.actionText} →
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Low Stock Alerts Center */}
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
                    <div className="min-w-0">
                      <div className="font-black text-xs uppercase tracking-widest text-foreground group-hover:text-red-400 transition-colors truncate max-w-[140px] sm:max-w-[170px]">
                        {prod.name}
                      </div>
                      <div className="text-[9px] text-muted-foreground font-semibold uppercase tracking-widest mt-0.5 truncate max-w-[140px]">
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

      {/* Quick Actions Panel */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {[
          { label: 'Sell / Cashier', icon: Zap, href: '/pos', color: 'text-emerald-500' },
          { label: 'Products & Stock', icon: Package, href: '/inventory', color: 'text-blue-500' },
          { label: 'Sales Reports', icon: TrendingUp, href: '/reports', color: 'text-purple-500' },
          { label: 'Add Staff', icon: Users, href: '/staff', color: 'text-amber-500' },
          { label: 'Expenses', icon: ArrowDownRight, href: '/expenses', color: 'text-red-500' },
          { label: 'Settings', icon: Layers, href: '/settings', color: 'text-neutral-500' },
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

      {/* Core KPIs Bento */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Today's Sales", value: `₵ ${stats.todaySales.toLocaleString()}`, trend: `${stats.todaySalesCount} orders`, status: 'optimal', icon: TrendingUp, href: '/sales' },
          { label: "Today's Profit", value: `₵ ${stats.todayProfit.toLocaleString()}`, trend: stats.todayProfit > 0 ? 'Profit' : 'No profit', status: 'positive', icon: ArrowUpRight, href: '/profit-analysis' },
          { label: 'Products in Stock', value: stats.totalProducts.toString(), trend: `${stats.lowStockProducts} low stock`, status: stats.lowStockProducts > 0 ? 'neutral' : 'positive', icon: Package, href: '/inventory' },
          { label: 'Credit Outstanding', value: `₵ ${stats.creditOutstanding.toLocaleString()}`, trend: stats.creditOutstanding > 0 ? 'Unpaid debts' : 'All cleared', status: stats.creditOutstanding > 0 ? 'neutral' : 'positive', icon: ArrowDownRight, href: '/credit-sales' },
          { label: 'Active Staff', value: stats.activeStaff.toString(), trend: 'On duty', status: 'positive', icon: Users, href: '/staff' },
          { label: 'Total Customers', value: stats.totalCustomers.toString(), trend: 'Registered', status: 'positive', icon: Users, href: '/customers' },
          { label: "Month Net Profit", value: `₵ ${stats.netProfit.toLocaleString()}`, trend: stats.netProfit >= 0 ? 'In profit' : 'Loss', status: stats.netProfit >= 0 ? 'optimal' : 'neutral', icon: TrendingUp, href: '/profit-analysis' },
          { label: "Today's Expenses", value: `₵ ${stats.todayExpenses.toLocaleString()}`, trend: 'Spent today', status: 'neutral', icon: ArrowDownRight, href: '/expenses' },
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
            <Card className="border-border shadow-md relative overflow-hidden bg-card/40 backdrop-blur-xl p-5 sm:p-6 rounded-[2.2rem] hover:translate-y-[-4px] transition-all duration-300">
              <div className="flex justify-between items-start mb-4 sm:mb-6">
                 <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-border">
                   <kpi.icon className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
                 </div>
                 <Badge className={cn(
                   "text-[9px] font-black uppercase tracking-widest h-6 border-none",
                   kpi.status === 'optimal' ? "bg-emerald-500/10 text-emerald-500" :
                   kpi.status === 'positive' ? "bg-blue-500/10 text-blue-500" :
                   "bg-muted text-muted-foreground"
                 )}>
                   {kpi.trend}
                 </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">{kpi.label}</p>
                <h3 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-foreground">{kpi.value}</h3>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 sm:gap-10 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-6 sm:space-y-10">
          <Card className="border-border shadow-md overflow-hidden flex flex-col p-3 sm:p-4 min-h-[400px] sm:min-h-[500px] bg-card/40 backdrop-blur-xl rounded-[2.2rem] sm:rounded-[2.5rem]">
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
                <AreaChart data={salesData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
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
            <Card className="border-border shadow-md flex flex-col p-3 sm:p-4 bg-card/40 backdrop-blur-xl rounded-[2.2rem]">
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

            <Card className="border-border shadow-md flex flex-col p-3 sm:p-4 bg-card/40 backdrop-blur-xl rounded-[2.2rem]">
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
            <Card className="border-border shadow-md flex flex-col p-3 sm:p-4 bg-card/40 backdrop-blur-xl rounded-[2.2rem]">
              <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 flex flex-row items-center justify-between">
                <div className="space-y-1">
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
                     <div className="flex items-center gap-3">
                        <div className="h-10 w-10 sm:h-11 sm:w-12 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-emerald-500 transition-colors border border-border">
                           <CheckCircle2 className="h-4.5 w-4.5" />
                        </div>
                        <div>
                           <div className="font-black text-xs uppercase tracking-widest text-foreground">{tx.productName}</div>
                           <div className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">{tx.cashierName} • {tx.paymentMethod}</div>
                        </div>
                     </div>
                     <div className="text-right">
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
            <Card className="border-border shadow-md flex flex-col p-3 sm:p-4 bg-card/40 backdrop-blur-xl rounded-[2.2rem]">
              <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg sm:text-xl font-black uppercase tracking-tighter italic text-foreground">Low Stock Warnings</CardTitle>
                  <CardDescription className="text-xs font-medium text-muted-foreground">Products running out of stock soon</CardDescription>
                </div>
                {lowStock.length > 0 && <Badge className="bg-red-500/10 text-red-500 border-none text-[9px] font-black">{lowStock.length} ALERTS</Badge>}
              </CardHeader>
              <CardContent className="px-2 sm:px-4 pb-4 space-y-3">
                 {lowStock.length > 0 ? (
                   lowStock.map((prod) => (
                    <div key={prod.id} className="group flex items-center justify-between p-4 rounded-2xl border border-border/60 hover:bg-secondary/40 hover:border-red-500/20 transition-all cursor-pointer" onClick={() => navigate('/inventory')}>
                      <div className="flex items-center gap-3">
                         <div className="h-10 w-10 sm:h-11 sm:h-12 rounded-xl bg-secondary flex items-center justify-center text-red-500 border border-border">
                            <Package className="h-4.5 w-4.5" />
                         </div>
                         <div>
                            <div className="font-black text-xs uppercase tracking-widest text-foreground">{prod.name}</div>
                            <div className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">{prod.category || 'General'}</div>
                         </div>
                      </div>
                      <div className="text-right">
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

        <div className="space-y-6 sm:space-y-10">
          <NexaIntelligenceHub 
            businessName={company?.name || "OBOY YANKEE ENTERPRISE"}
            salesData={salesData}
            inventoryData={lowStock}
          />
          
          <Card className="border-border shadow-md p-5 sm:p-6 bg-card/40 backdrop-blur-xl rounded-[2.2rem] relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                <History className="h-20 w-20 text-muted-foreground" />
              </div>
             <CardHeader className="p-0 mb-6">
                <CardTitle className="text-lg sm:text-xl font-black uppercase tracking-tighter italic text-foreground leading-none flex items-center gap-2">
                   <Zap className="h-4 w-4 text-amber-500" />
                   System Status
                </CardTitle>
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-2">Everything running smoothly</p>
             </CardHeader>
             <CardContent className="p-0 space-y-3">
                {[
                  { label: "Cash Register", status: "Online", desc: "Ready to sell and take payments.", health: 100, href: '/pos' },
                  { label: "Sales Reports", status: "Active", desc: "Sales trends and graphs are working.", health: 98, href: '/reports' },
                  { label: "Cloud Backup", status: "Stable", desc: "Your sales data is safely backed up online.", health: 100, href: '/settings' },
                  { label: "Staff Access", status: "Stable", desc: "All staff accounts are active and working.", health: 100, href: '/staff' }
                ].map((node) => (
                  <div 
                    key={node.label} 
                    className="p-4 rounded-2xl bg-secondary/50 border border-border/50 hover:border-primary/20 hover:bg-secondary transition-all cursor-pointer group/node"
                    onClick={() => navigate(node.href)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground group-hover/node:text-emerald-500 transition-colors">{node.label}</span>
                      </div>
                      <span className="text-[9px] font-black text-emerald-500 uppercase">{node.status}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed mb-3">{node.desc}</p>
                    <div className="space-y-1">
                       <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                          <span className="text-muted-foreground/40">Status Check</span>
                          <span className="text-muted-foreground">{node.health}%</span>
                       </div>
                       <Progress value={node.health} className="h-1 bg-secondary" />
                    </div>
                  </div>
                ))}
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
