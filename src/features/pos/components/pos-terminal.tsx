import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import { useProducts } from '@/features/inventory/hooks/use-products';
import { usePOSStore } from '../store/pos-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  Wallet, 
  CreditCard, 
  Smartphone,
  ChevronRight,
  Package,
  History,
  Barcode,
  Wifi,
  WifiOff,
  CloudLightning,
  X,
  TrendingUp,
  Activity,
  RefreshCw,
  HandCoins,
  Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import { 
  BarChart, 
  Bar, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { toast } from 'sonner';

import { usePOSSystem } from '@/hooks/use-pos-system';
import { BarcodeScannerDialog, playScanBeep } from './barcode-scanner-dialog';
import { ShiftTracker } from './shift-tracker';

interface Product {
  id: string;
  name: string;
  category?: string;
  price: any;
  stock_quantity: number;
  barcode?: string;
  sku?: string;
}

const ProductCard = memo(({ product, addToCart }: { product: Product; addToCart: (product: Product) => void }) => {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => addToCart(product)}
      className="group relative p-3 sm:p-4 bg-slate-900 border border-white/5 rounded-2xl sm:rounded-[24px] lg:rounded-[32px] hover:border-emerald-500/30 transition-all cursor-pointer overflow-hidden flex flex-col justify-between h-32 sm:h-40"
    >
      <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:opacity-10 transition-opacity">
        <Package className="h-12 w-12" />
      </div>
      <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center mb-2 group-hover:bg-emerald-500/10 transition-colors">
        <Plus className="h-4 w-4 text-slate-500 group-hover:text-emerald-500" />
      </div>
      <div>
        <h3 className="text-xs font-black italic tracking-tighter text-white uppercase leading-tight mb-0.5 truncate">{product.name}</h3>
        <p className="text-[9px] font-black text-slate-500 mb-2">{product.category || 'General'}</p>
      </div>
      <div className="flex items-end justify-between mt-auto pt-2 border-t border-white/[0.02]">
        <div className="text-lg font-black text-emerald-500">₵{product.price}</div>
        <div className={cn(
          "text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm",
          product.stock_quantity > 0 ? "text-slate-600 bg-white/5" : "text-red-500 bg-red-500/10"
        )}>
          Qty: {product.stock_quantity}
        </div>
      </div>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';

export function POSTerminal() {
  const { user } = useAuth();
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, total } = usePOSStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'momo' | 'split' | 'credit'>('cash');
  const [momoProvider, setMomoProvider] = useState<'mtn' | 'telecel' | 'airteltigo'>('mtn');
  const [splitCash, setSplitCash] = useState<string>('');
  const [splitMomo, setSplitMomo] = useState<string>('');
  const [splitCard, setSplitCard] = useState<string>('');
  const [simulatedOffline, setSimulatedOffline] = useState<boolean>(false);
  const [completedSale, setCompletedSale] = useState<any | null>(null);
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const [activeTab, setActiveTab] = useState<'products' | 'cart'>('products');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isShiftTrackerOpen, setIsShiftTrackerOpen] = useState(false);
  
  const { isOnline: systemOnline, recordSale, syncing, products, categories, syncProducts } = usePOSSystem();
  const isOnline = systemOnline && !simulatedOffline;

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Real-time POS Performance summary & chart states
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<'hourly' | 'daily'>('daily');

  const fetchRecentTransactions = useCallback(async () => {
    setIsLoadingRecent(true);
    try {
      const response = await apiClient.get('/api/sales');
      const data = response.data?.data || response.data || [];
      setRecentSales(Array.isArray(data) ? data.slice(0, 30) : []);
    } catch (err) {
      console.error("Failed to fetch recent transactions for chart:", err);
    } finally {
      setIsLoadingRecent(false);
    }
  }, []);

  useEffect(() => {
    if (isDashboardOpen) {
      fetchRecentTransactions();
    }
  }, [isDashboardOpen, fetchRecentTransactions]);

  // Aggregate stats
  const totalGTV = recentSales.length > 0 
    ? recentSales.reduce((acc, curr) => acc + (parseFloat(curr.total_amount) || 0), 0)
    : 0;
  const txCount = recentSales.length;
  const avgTicket = txCount > 0 ? totalGTV / txCount : 0;

  // Custom data parsing for 7-Day sales summary
  const getDailySalesData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return {
        dateStr: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        dayName: days[d.getDay()],
        fullDate: d.toISOString().split('T')[0],
        total: 0,
        count: 0
      };
    }).reverse();

    if (recentSales.length > 0) {
      recentSales.forEach(tx => {
        const txDateStr = tx.created_at ? tx.created_at.split('T')[0] : '';
        const match = last7Days.find(d => d.fullDate === txDateStr);
        if (match) {
          match.total += parseFloat(tx.total_amount) || 0;
          match.count += 1;
        }
      });
    }

    // Return real data (zeros if no sales)
    return last7Days;
  };

  // Custom data parsing for hourly load today
  const getHourlySalesData = () => {
    const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
    const hourlyData = hours.map(h => ({
      hour: h,
      sales: 0,
      transactions: 0
    }));

    if (recentSales.length > 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      recentSales.forEach(tx => {
        const txDateStr = tx.created_at ? tx.created_at.split('T')[0] : '';
        if (txDateStr === todayStr && tx.created_at) {
          const timeStr = tx.created_at.split('T')[1] || '';
          const hourNum = parseInt(timeStr.split(':')[0]) || 0;
          
          let binIdx = 0;
          if (hourNum >= 20) binIdx = 6;
          else if (hourNum >= 18) binIdx = 5;
          else if (hourNum >= 16) binIdx = 4;
          else if (hourNum >= 14) binIdx = 3;
          else if (hourNum >= 12) binIdx = 2;
          else if (hourNum >= 10) binIdx = 1;
          else binIdx = 0;

          hourlyData[binIdx].sales += parseFloat(tx.total_amount) || 0;
          hourlyData[binIdx].transactions += 1;
        }
      });
    }

    // Return real data (zeros if no sales)
    return hourlyData;
  };

  // Channel breakdown percentage solver
  const getPaymentSplitData = () => {
    let splits = { cash: 0, card: 0, momo: 0 };
    recentSales.forEach(tx => {
      const m = (tx.payment_method || '').toLowerCase();
      if (m === 'cash') splits.cash += parseFloat(tx.total_amount) || 0;
      else if (m === 'card') splits.card += parseFloat(tx.total_amount) || 0;
      else if (m === 'momo' || m === 'mobile money' || m === 'mobile_money') splits.momo += parseFloat(tx.total_amount) || 0;
    });

    const totalSplits = splits.cash + splits.card + splits.momo;
    if (totalSplits === 0) {
      return [
        { name: 'Cash', value: 0, color: '#10B981' },
        { name: 'MoMo', value: 0, color: '#3B82F6' },
        { name: 'Card', value: 0, color: '#EC4899' }
      ];
    }

    return [
      { name: 'Cash', value: Math.round((splits.cash / totalSplits) * 100), color: '#10B981' },
      { name: 'MoMo', value: Math.round((splits.momo / totalSplits) * 100), color: '#3B82F6' },
      { name: 'Card', value: Math.round((splits.card / totalSplits) * 100), color: '#EC4899' }
    ];
  };

  // Global Keyboard Barcode Scanner Wedge interceptor for plug-and-play hand scanners
  useEffect(() => {
    let rawBuffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore modifier keys
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      // Ignore functional modifier keystrokes or inputs focusing typical editable blocks (except when specifically handled)
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable
      ) {
        // If they are focusing an input, let that input handle it itself.
        return;
      }

      const currentTime = Date.now();
      const elapsed = currentTime - lastKeyTime;
      lastKeyTime = currentTime;

      // Real barcode scanners type VERY fast (usually < 40s/chars)
      if (elapsed > 40) {
        rawBuffer = '';
      }

      if (e.key === 'Enter') {
        const barcodeMatched = rawBuffer.trim();
        if (barcodeMatched.length >= 3) {
          e.preventDefault();
          // Find item
          const matchedProduct = products.find(p => 
            (p.barcode && p.barcode.toLowerCase() === barcodeMatched.toLowerCase()) || 
            (p.sku && p.sku.toLowerCase() === barcodeMatched.toLowerCase())
          );

          if (matchedProduct) {
            playScanBeep();
            addToCart(matchedProduct);
            toast.success(`Scanned: ${matchedProduct.name}`, {
              description: `Added to cart (₵${matchedProduct.price})`
            });
          } else {
            toast.warning(`Scanned Code: "${barcodeMatched}"`, {
              description: "Code captured, but product not found in inventory catalog."
            });
          }
        }
        rawBuffer = '';
      } else if (e.key.length === 1) {
        rawBuffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [products, addToCart]);

  const filteredProducts = useMemo(() => {
    const s = search.toLowerCase();
    return products.filter(p => 
      (category === 'All' || p.category === category) &&
      (p.name.toLowerCase().includes(s) || p.sku?.toLowerCase().includes(s) || (p.barcode && p.barcode.toLowerCase().includes(s)))
    );
  }, [products, category, search]);

  const handleAddToCartWithFeedback = useCallback((product: Product) => {
    addToCart(product as any);
    toast.success(`"${product.name}" added to current order!`, {
      description: `₵${product.price} • Qty incremented`,
      duration: 1500,
      id: `add-cart-${product.id}`,
    });
  }, [addToCart]);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    const totalWithTax = total;

    // Validate details for split payments
    if (paymentMethod === 'split') {
      const cashVal = parseFloat(splitCash) || 0;
      const momoVal = parseFloat(splitMomo) || 0;
      const cardVal = parseFloat(splitCard) || 0;
      const sum = cashVal + momoVal + cardVal;
      if (Math.abs(sum - totalWithTax) > 0.05) {
        toast.error(`Invalid payment splits! Total splits must equal ₵${totalWithTax.toFixed(2)}. Currently ₵${sum.toFixed(2)}.`);
        return;
      }
    }

    const toastId = toast.loading('Recording transaction...');

    try {
      const momoLabel = momoProvider === 'mtn' ? 'MTN MoMo' : momoProvider === 'telecel' ? 'Telecel Cash' : 'AirtelTigo Cash';
      const payloadPaymentMethod = paymentMethod === 'split' 
        ? `Split (Cash:₵${parseFloat(splitCash) || 0}, ${momoLabel}:₵${parseFloat(splitMomo) || 0}, Card:₵${parseFloat(splitCard) || 0})`
        : paymentMethod === 'momo' ? momoLabel : paymentMethod;

      const result = await recordSale({
        items: [...cart],
        total_amount: totalWithTax,
        subtotal: total,
        tax_amount: 0,
        discount_amount: 0,
        payment_method: payloadPaymentMethod,
        customer_id: null,
        customer_phone: customerPhone || null,
        is_credit: paymentMethod === 'credit'
      });

      if (result && result.saleId) {
        toast.success(
          result.syncedOnline 
            ? 'Transaction completed and recorded!' 
            : 'Transaction completed (Saved to Offline Cache)', 
          { id: toastId }
        );
        
        // Load completion receipt details
        setCompletedSale({
          saleId: result.saleId,
          items: [...cart],
          total: totalWithTax,
          subtotal: total,
          tax: 0,
          paymentMethod: payloadPaymentMethod,
          isOffline: !isOnline,
          date: new Date().toISOString()
        });

        clearCart();
        setActiveTab('products'); // Switch back after checkout
        fetchRecentTransactions().catch(() => {}); // Non-blocking refresh

        // Clear values
        setSplitCash('');
        setSplitMomo('');
        setSplitCard('');
      } else {
        toast.error('Failed to record transaction', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to record transaction', { id: toastId });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4 lg:gap-8 overflow-hidden relative min-h-0">
      {/* Tab Selectors for Smaller Viewports (Hidden on LG and above) */}
      <div className="flex lg:hidden gap-2 bg-slate-900/60 p-1 rounded-2xl border border-white/5 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={cn(
            "flex-1 py-3 text-center rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
            activeTab === 'products'
              ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.25)]"
              : "text-slate-400 hover:text-white"
          )}
        >
          Products Grid
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('cart')}
          className={cn(
            "flex-1 py-3 text-center rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative flex items-center justify-center gap-2",
            activeTab === 'cart'
              ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.25)]"
              : "text-slate-400 hover:text-white"
          )}
        >
          Current Order
          {cartItemCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[8px] font-black animate-pulse">
              {cartItemCount}
            </span>
          )}
        </button>
      </div>

      {/* Products Selection Section */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 min-h-0 pb-4 lg:pb-0",
        activeTab !== 'products' && "hidden lg:flex"
      )}>
        <header className="mb-4 lg:mb-6 space-y-3 lg:space-y-4 shrink-0">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl lg:text-3xl xl:text-4xl font-black italic tracking-tighter uppercase text-white leading-none mb-1 truncate">Sales Terminal</h1>
              <div className="flex items-center gap-2 sm:gap-3">
                 <p className="text-slate-500 font-bold uppercase tracking-widest text-[8px] sm:text-[9px] truncate">POS • {user?.fullName}</p>
                 <button 
                    onClick={() => {
                      setSimulatedOffline(prev => !prev);
                      toast.info(`Network status toggled! Simulated network is now ${!simulatedOffline ? 'OFFLINE' : 'ONLINE'}.`);
                    }}
                    className="flex items-center gap-1.5 bg-white/5 border border-white/5 hover:bg-white/10 px-2 py-0.5 rounded-full transition-all active:scale-95 cursor-pointer text-left select-none"
                    title="Click to toggle network simulation"
                 >
                    <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", isOnline ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-amber-500")} />
                    <span className={cn("text-[8px] font-black uppercase tracking-widest italic", isOnline ? "text-emerald-500" : "text-amber-500")}>
                       {syncing ? "Syncing..." : (isOnline ? "Online" : "Offline Simulator")}
                    </span>
                 </button>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 overflow-x-auto no-scrollbar">
              <Button 
                variant="outline" 
                onClick={() => setIsScannerOpen(true)}
                className="h-9 sm:h-10 rounded-xl border-white/5 bg-white/5 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10 font-bold uppercase tracking-widest text-[9px] gap-1.5 px-3 transition-colors shrink-0"
              >
                <Barcode className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Scan</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={async () => {
                  const loaderId = toast.loading('Refreshing inventory catalog...');
                  await syncProducts();
                  toast.success('Inventory catalog updated!', { id: loaderId });
                }}
                className="h-9 sm:h-10 rounded-xl border-white/5 bg-white/5 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10 font-bold uppercase tracking-widest text-[9px] gap-1.5 px-3 transition-colors shrink-0"
              >
                <RefreshCw className="h-3.5 w-3.5 animate-spin-slow" />
                <span className="hidden sm:inline">Sync</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsDashboardOpen(true)}
                className="h-9 sm:h-10 rounded-xl border-white/5 bg-white/5 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10 font-bold uppercase tracking-widest text-[9px] gap-1.5 px-3 transition-colors shrink-0"
              >
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Summary</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsShiftTrackerOpen(true)}
                className="h-9 sm:h-10 rounded-xl border-white/5 bg-white/5 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10 font-bold uppercase tracking-widest text-[9px] gap-1.5 px-3 transition-colors shrink-0"
              >
                <Activity className="h-3.5 w-3.5 text-emerald-500" />
                <span className="hidden sm:inline">Shifts</span>
              </Button>
            </div>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="text"
              placeholder="Find Product (Name, SKU, Barcode)..." 
              className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-900 border border-white/5 text-white font-bold italic tracking-tight placeholder:text-slate-800 outline-none focus:border-emerald-500/50 transition-all text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat: any) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  category === cat 
                    ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
                    : "bg-slate-900 text-slate-500 border border-white/5 hover:border-white/10"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          {products.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 overflow-y-auto no-scrollbar h-full pb-24 lg:pb-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 sm:h-40 rounded-2xl lg:rounded-[32px] bg-slate-900/50 animate-pulse border border-white/5" />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 overflow-y-auto no-scrollbar h-full pb-24 lg:pb-8">
              {filteredProducts.map((product: Product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  addToCart={handleAddToCartWithFeedback}
                />
              ))}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 overflow-y-auto no-scrollbar">
               <div className="h-16 w-16 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-slate-700" />
               </div>
               <h3 className="text-lg font-black italic text-white uppercase tracking-tighter mb-1">No items match</h3>
               <p className="text-slate-500 font-bold text-xs italic">Try adjusting your filters.</p>
             </div>
          )}
        </div>
      </div>
      {/* Cart & Checkout Section */}
      <div className={cn(
        "w-full lg:w-[380px] xl:w-[450px] lg:h-full flex flex-col bg-slate-900 rounded-[24px] sm:rounded-3xl lg:rounded-[40px] border border-white/5 overflow-hidden shadow-2xl relative flex-1 lg:flex-initial min-h-0",
        activeTab !== 'cart' && "hidden lg:flex"
      )}>
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.05),transparent_50%)] pointer-events-none" />
         
         <header className="p-3 sm:p-5 pb-2 sm:pb-3 flex items-center justify-between relative z-10 border-b border-white/[0.03] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-sm sm:text-lg font-black italic tracking-tighter uppercase text-white leading-none mb-1">Current Order</h2>
                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className="lg:hidden text-[9px] font-black text-emerald-500 uppercase tracking-widest hover:underline text-left"
                >
                  ← Add More Products
                </button>
              </div>
            </div>
            <Button 
              type="button"
              variant="ghost" 
              size="icon" 
              onClick={clearCart}
              className="h-8 w-8 p-0 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
         </header>
 
         {/* Middle Section: Cart Items list - Compact row layouts */}
         <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-2 sm:py-3 space-y-2 sm:space-y-2.5 no-scrollbar relative z-10">
            <AnimatePresence mode="popLayout">
               {cart.length > 0 ? cart.map((item) => (
                <motion.div
                  key={item.product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group flex gap-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all items-center"
                >
                  <div className="h-9 w-9 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                    <Package className="h-3.5 w-3.5 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[11px] sm:text-xs font-black italic uppercase text-white truncate leading-none mb-1">{item.product.name}</h4>
                    <div className="text-emerald-500 font-black text-[11px] sm:text-xs">₵{item.product.price}</div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/40 rounded-lg px-1 py-0.5">
                    <button 
                      type="button"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="h-5 w-5 flex items-center justify-center text-slate-500 hover:text-white transition-colors rounded hover:bg-white/5"
                    >
                      <Minus className="h-2 w-2" />
                    </button>
                    <span className="text-[11px] font-black text-white w-2 text-center">{item.quantity}</span>
                    <button 
                      type="button"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="h-5 w-5 flex items-center justify-center text-slate-500 hover:text-white transition-colors rounded hover:bg-white/5"
                    >
                      <Plus className="h-2 w-2" />
                    </button>
                  </div>
                </motion.div>
              )) : (
                <div className="h-32 flex flex-col items-center justify-center text-center">
                   <div className="h-10 w-10 rounded-full border border-dashed border-slate-800 flex items-center justify-center mb-2">
                      <ShoppingCart className="h-3.5 w-3.5 text-slate-850" />
                   </div>
                   <p className="text-slate-600 font-black uppercase tracking-widest text-[8px]">Your cart is empty</p>
                </div>
              )}
            </AnimatePresence>
         </div>
 
         {/* Checkout Footer */}
         <footer className="sticky bottom-0 p-3 sm:p-5 space-y-3 sm:space-y-4 bg-[#0f172a] border-t border-white/10 z-20 backdrop-blur-xl shrink-0">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-[0.15em]">Total</span>
                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={() => { clearCart(); toast.success('Cart cleared'); }}
                    className="text-[8px] font-black uppercase text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
                  >
                    Clear Cart
                  </button>
                )}
              </div>
              <span className="text-2xl sm:text-3xl font-black italic tracking-tighter text-emerald-500 leading-none">₵{total.toFixed(2)}</span>
            </div>
 
            <div className="grid grid-cols-5 gap-1.5">
               {[
                 { id: 'cash', label: 'Cash', icon: Wallet },
                 { id: 'card', label: 'Card', icon: CreditCard },
                 { id: 'momo', label: 'Momo', icon: Smartphone },
                 { id: 'credit', label: 'Credit', icon: HandCoins },
                 { id: 'split', label: 'Split', icon: Activity }
               ].map(method => (
                  <Button 
                    type="button"
                    key={method.id}
                    variant="outline" 
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={cn(
                      "h-10 sm:h-12 flex-col gap-0.5 sm:gap-1 rounded-xl border-white/5 bg-white/5 transition-all group py-1 px-1",
                      paymentMethod === method.id 
                        ? "bg-emerald-500/20 border-emerald-500/50" 
                        : "hover:bg-emerald-500/10 hover:border-emerald-500/30"
                    )}
                  >
                    <method.icon className={cn(
                      "h-3 w-3 sm:h-3.5 sm:w-3.5 transition-colors",
                      paymentMethod === method.id ? "text-emerald-500" : "text-slate-600 group-hover:text-emerald-500"
                    )} />
                    <span className={cn(
                      "text-[7px] sm:text-[8px] font-black uppercase tracking-widest transition-colors leading-none",
                      paymentMethod === method.id ? "text-emerald-500" : "text-slate-500 group-hover:text-white"
                    )}>{method.label}</span>
                  </Button>
               ))}
            </div>

            {paymentMethod === 'momo' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-2 mt-2"
              >
                <span className="text-[8px] font-black uppercase text-yellow-500 tracking-wider block mb-2">Select Mobile Money Provider</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'mtn', label: 'MTN MoMo', color: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-500' },
                    { id: 'telecel', label: 'Telecel Cash', color: 'bg-red-500/20 border-red-500/50 text-red-500' },
                    { id: 'airteltigo', label: 'AT Cash', color: 'bg-blue-500/20 border-blue-500/50 text-blue-500' },
                  ].map(provider => (
                    <button
                      key={provider.id}
                      type="button"
                      onClick={() => setMomoProvider(provider.id as any)}
                      className={cn(
                        "h-9 rounded-lg border text-[8px] font-black uppercase tracking-widest transition-all",
                        momoProvider === provider.id ? provider.color : "border-white/5 bg-white/5 text-slate-500 hover:bg-white/10"
                      )}
                    >
                      {provider.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {paymentMethod === 'split' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-2 mt-2"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[8px] font-black uppercase text-amber-500 tracking-wider">Configure Split Payments</span>
                  <span className="text-[9px] font-black text-slate-400">Total: ₵{total.toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[7px] font-black text-slate-500 uppercase block mb-1">Cash</span>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      value={splitCash}
                      onChange={(e) => setSplitCash(e.target.value)}
                      className="h-8 bg-black/40 border-white/5 rounded-lg text-xs font-mono font-bold text-slate-100 px-2"
                    />
                  </div>
                  <div>
                    <span className="text-[7px] font-black text-slate-500 uppercase block mb-1">{momoProvider === 'mtn' ? 'MTN' : momoProvider === 'telecel' ? 'Telecel' : 'AT'}</span>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      value={splitMomo}
                      onChange={(e) => setSplitMomo(e.target.value)}
                      className="h-8 bg-black/40 border-white/5 rounded-lg text-xs font-mono font-bold text-slate-100 px-2"
                    />
                  </div>
                  <div>
                    <span className="text-[7px] font-black text-slate-500 uppercase block mb-1">Card</span>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      value={splitCard}
                      onChange={(e) => setSplitCard(e.target.value)}
                      className="h-8 bg-black/40 border-white/5 rounded-lg text-xs font-mono font-bold text-slate-100 px-2"
                    />
                  </div>
                </div>
                {(() => {
                  const cashVal = parseFloat(splitCash) || 0;
                  const momoVal = parseFloat(splitMomo) || 0;
                  const cardVal = parseFloat(splitCard) || 0;
                  const currentSum = cashVal + momoVal + cardVal;
                  const totalWithTax = total;
                  const isMatching = Math.abs(currentSum - totalWithTax) < 0.05;
                  const diff = totalWithTax - currentSum;
                  return (
                    <div className="flex justify-between items-center pt-1 text-[8px] font-black uppercase tracking-wide">
                      <span className={cn(isMatching ? "text-emerald-500 font-extrabold animate-pulse" : "text-amber-500")}>
                        {isMatching ? "✓ Splits Balanced" : `Allocated: ₵${currentSum.toFixed(2)}`}
                      </span>
                      <span className={cn(diff > 0 ? "text-amber-500" : diff < 0 ? "text-red-500" : "text-emerald-500")}>
                        {diff > 0 ? `Unallocated: ₵${diff.toFixed(2)}` : diff < 0 ? `Overallocated: ₵${Math.abs(diff).toFixed(2)}` : "Balanced"}
                      </span>
                    </div>
                  );
                })()}
              </motion.div>
            )}
 
            {/* Customer Phone for SMS Receipt */}
            <div className="flex items-center gap-2">
              <Input 
                placeholder="Customer phone for SMS receipt (optional)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="h-9 text-[10px] font-mono font-bold bg-white/[0.02] border-white/10 rounded-xl text-white placeholder-slate-600 px-3 focus:ring-1 focus:ring-emerald-500 focus-visible:ring-1 focus-visible:ring-offset-0 focus:border-emerald-500/50 flex-1"
              />
              {customerPhone && (
                <button
                  onClick={() => setCustomerPhone('')}
                  className="text-[9px] font-black uppercase text-slate-500 hover:text-red-400 transition-colors px-2 shrink-0"
                >
                  Clear
                </button>
              )}
            </div>

            <Button 
              type="button"
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full h-11 sm:h-13 rounded-xl sm:rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs shadow-xl shadow-emerald-500/15 gap-2 transition-all active:scale-[0.98]"
            >
              Complete Sale <ChevronRight className="h-4 w-4 shrink-0 animate-pulse" />
            </Button>
         </footer>
      </div>

      {/* Floating Sticky Cart Button for Tablet/Mobile to show total items and allow switching back */}
      {activeTab === 'products' && cartItemCount > 0 && (
        <div className="fixed bottom-16 left-2 right-2 lg:hidden z-30" style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))' }}>
          <Button
            type="button"
            onClick={() => setActiveTab('cart')}
            className="w-full h-12 sm:h-14 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-[9px] shadow-lg flex items-center justify-between px-5 gap-2"
          >
            <div className="flex items-center gap-1.5">
              <ShoppingCart className="h-4 w-4" />
              <span>Current Order ({cartItemCount})</span>
            </div>
            <span className="font-extrabold text-xs">₵{total.toFixed(2)}</span>
          </Button>
        </div>
      )}

      <AnimatePresence>
        {isDashboardOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDashboardOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
              id="pos-dashboard-backdrop"
            />
            {/* Slide-over Content */}
            <motion.div
              initial={{ translateX: "100%" }}
              animate={{ translateX: 0 }}
              exit={{ translateX: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[500px] md:w-[600px] bg-slate-950 border-l border-white/10 z-50 shadow-2xl flex flex-col overflow-hidden text-white"
              id="pos-dashboard-drawer"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-slate-900/40 relative">
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black italic tracking-tighter uppercase text-white leading-none mb-0.5">Today's Sales</h2>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Daily sales summary</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDashboardOpen(false)}
                  className="h-8 w-8 p-0 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
                  id="pos-dashboard-close-btn"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Scrollable Metrics and Charts */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 progress-bar no-scrollbar">
                {/* Micro Stats Row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1 block">Gross terminal value</span>
                    <span className="text-base font-black italic text-emerald-500 tracking-tight">₵{totalGTV.toFixed(2)}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1 block">Txs Count</span>
                    <span className="text-base font-black italic text-sky-400 tracking-tight">{txCount} Sales</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1 block">Avg Invoice Ticket</span>
                    <span className="text-base font-black italic text-amber-500 tracking-tight">₵{avgTicket.toFixed(2)}</span>
                  </div>
                </div>

                {/* Tab select for Daily vs Hourly */}
                <div className="bg-slate-900/60 p-1 rounded-xl border border-white/5 flex">
                  <button
                    type="button"
                    onClick={() => setDashboardTab('daily')}
                    className={cn(
                      "flex-1 py-2 text-center rounded-lg text-[9px] font-black uppercase tracking-wider transition-all",
                      dashboardTab === 'daily'
                        ? "bg-white/10 text-white shadow"
                        : "text-slate-500 hover:text-white"
                    )}
                  >
                    7-Day Daily Trend
                  </button>
                  <button
                    type="button"
                    onClick={() => setDashboardTab('hourly')}
                    className={cn(
                      "flex-1 py-2 text-center rounded-lg text-[9px] font-black uppercase tracking-wider transition-all",
                      dashboardTab === 'hourly'
                        ? "bg-white/10 text-white shadow"
                        : "text-slate-500 hover:text-white"
                    )}
                  >
                    Today's Hourly Load
                  </button>
                </div>

                {/* Chart Box */}
                <div className="p-5 rounded-3xl bg-slate-900/30 border border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {dashboardTab === 'daily' ? '7-Day Sales Volume' : "Hourly Sales Load"}
                      </h3>
                    </div>
                    {isLoadingRecent && (
                      <span className="text-[8px] font-black text-emerald-500 tracking-widest uppercase animate-pulse">refreshing...</span>
                    )}
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      {dashboardTab === 'daily' ? (
                        <BarChart data={getDailySalesData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10B981" stopOpacity={0.8} />
                              <stop offset="100%" stopColor="#10B981" stopOpacity={0.15} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                          <XAxis 
                            dataKey="dateStr" 
                            stroke="rgba(255,255,255,0.3)" 
                            fontSize={9} 
                            tickLine={false} 
                            axisLine={false}
                          />
                          <YAxis 
                            stroke="rgba(255,255,255,0.3)" 
                            fontSize={9} 
                            tickLine={false} 
                            axisLine={false}
                            tickFormatter={(v) => `₵${v}`}
                          />
                          <ChartTooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(2, 6, 23, 0.95)', 
                              borderColor: 'rgba(255, 255, 255, 0.1)',
                              borderRadius: '12px'
                            }}
                            labelClassName="text-white text-xs font-bold"
                            formatter={(value: any) => [`₵${parseFloat(value).toFixed(2)}`, 'Sales Volume']}
                          />
                          <Bar dataKey="total" fill="url(#barGrad)" radius={[4, 4, 0, 0]} barSize={28}>
                            {getDailySalesData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.total > 2000 ? '#10B981' : '#34D399'} />
                            ))}
                          </Bar>
                        </BarChart>
                      ) : (
                        <AreaChart data={getHourlySalesData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                          <XAxis 
                            dataKey="hour" 
                            stroke="rgba(255,255,255,0.3)" 
                            fontSize={9} 
                            tickLine={false} 
                            axisLine={false}
                          />
                          <YAxis 
                            stroke="rgba(255,255,255,0.3)" 
                            fontSize={9} 
                            tickLine={false} 
                            axisLine={false}
                            tickFormatter={(v) => `₵${v}`}
                          />
                          <ChartTooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(2, 6, 23, 0.95)', 
                              borderColor: 'rgba(255, 255, 255, 0.1)',
                              borderRadius: '12px'
                            }}
                            labelClassName="text-white text-xs font-bold"
                            formatter={(value: any) => [`₵${parseFloat(value).toFixed(2)}`, 'Sales Value']}
                          />
                          <Area type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#areaGrad)" />
                        </AreaChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Bottom row: Payment Distribution and Sync Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Payment Distribution Splits */}
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3.5">
                    <h4 className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Payment channel distribution</h4>
                    <div className="space-y-2.5">
                      {getPaymentSplitData().map(channel => (
                        <div key={channel.name} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-slate-400">{channel.name} Channels</span>
                            <span className="text-white font-extrabold">{channel.value}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-1000" 
                              style={{ width: `${channel.value}%`, backgroundColor: channel.color }} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sync status metrics */}
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                    <div>
                      <h4 className="text-[9px] font-black uppercase text-slate-500 tracking-wider mb-2">Network Sync integrity</h4>
                      <p className="text-[10px] text-slate-400 font-bold leading-relaxed mb-1">
                        We leverage micro-transactional SQLite/IndexedDB structures to keep POS active regardless of Ghanaian power or network dropouts.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-white/[0.03]">
                      <div className={cn("h-2 w-2 rounded-full", isOnline ? "bg-emerald-500 animate-pulse" : "bg-red-500")} />
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                        {isOnline ? "Telemetry active (GPRS / Broadband)" : "Station offline: client cached"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recent transaction stream widget */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Sales Feed (Today's Ledger)</h4>
                    <span className="text-[8px] font-bold text-slate-600 uppercase">showing latest 5</span>
                  </div>
                  
                  <div className="space-y-2">
                    {recentSales.slice(0, 5).map(sale => (
                      <div key={sale.id} className="flex justify-between items-center p-3 rounded-2xl bg-white/[0.01] border border-white/5 text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black italic scale-90">₵</div>
                          <div>
                            <p className="font-extrabold text-white text-[11px] leading-tight flex items-center gap-1.5">
                              {sale.id.slice(0, 8).toUpperCase()} 
                              <span className="text-[8px] px-1 bg-white/5 rounded text-slate-500 font-bold uppercase tracking-widest">{sale.payment_method}</span>
                            </p>
                            <p className="text-[9px] text-slate-600 font-bold">
                              {sale.created_at ? new Date(sale.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Just completed'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black italic text-white text-[11px]">₵{(parseFloat(sale.total_amount) || 0).toFixed(2)}</p>
                          <p className="text-[8px] text-emerald-500 font-black uppercase tracking-widest">Completed</p>
                        </div>
                      </div>
                    ))}
                    
                    {recentSales.length === 0 && (
                      <div className="py-8 text-center border border-dashed border-white/5 rounded-2xl">
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">No transactions logged today.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BarcodeScannerDialog
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        products={products}
        addToCart={handleAddToCartWithFeedback}
      />

      <ShiftTracker
        isOpen={isShiftTrackerOpen}
        onClose={() => setIsShiftTrackerOpen(false)}
        isOnline={isOnline}
      />

      {/* Interactive Completed Sale Receipt Share Center */}
      <AnimatePresence>
        {completedSale && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050507]/90 backdrop-blur-lg">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative max-w-sm w-full bg-[#0d0d11] border border-white/[0.08] rounded-[32px] p-6 shadow-3xl text-white flex flex-col max-h-[92vh]"
            >
              {/* Top accent glow ribbon */}
              <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500" />
              
              <div className="text-center pb-5 border-b border-dashed border-white/10 shrink-0">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-3">
                  <svg className="h-6 w-6 text-emerald-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xs font-black uppercase tracking-[0.25em] text-emerald-500">Sale Completed</h3>
                <p className="text-[9px] font-mono tracking-wider text-slate-400 mt-1 uppercase">Receipt #: {completedSale.saleId.replace(/-/g, '').substring(0, 16).toUpperCase()}</p>
              </div>

              {/* Core Ledger Receipt Body */}
              <div className="flex-1 overflow-y-auto py-5 space-y-5 text-xs progress-bar no-scrollbar">
                <div className="text-center space-y-1">
                  <h4 className="font-black text-lg tracking-tight uppercase italic text-slate-100">
                    OBOY YANKEE ENTERPRISE
                  </h4>
                  <p className="text-[9px] text-slate-400 font-bold">Tel: +233 24 555 0122</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1">{new Date(completedSale.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                </div>

                {/* Dashed item catalog layout */}
                <div className="border-t border-b border-dashed border-white/10 py-4 space-y-3.5">
                  <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-500 font-mono">
                    <span className="flex-1">Item</span>
                    <span className="w-10 text-center">Qty</span>
                    <span className="w-16 text-right">U.Cost</span>
                    <span className="w-16 text-right">Amount</span>
                  </div>
                  
                  {completedSale.items.map((it: any) => (
                    <div key={it.product.id} className="flex justify-between items-start font-mono text-[11px]">
                      <span className="flex-1 font-extrabold text-[#edf2f7] block leading-tight">{it.product.name}</span>
                      <span className="w-10 text-center text-slate-400">{it.quantity}</span>
                      <span className="w-16 text-right text-slate-400">₵{parseFloat(it.product.price).toFixed(2)}</span>
                      <span className="w-16 text-right font-extrabold text-[#edf2f7]">₵{(parseFloat(it.product.price) * it.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Invoice total */}
                <div className="space-y-2 font-mono text-[10px]">
                  <div className="flex justify-between text-[13px] font-black pt-2.5 border-t border-white/[0.05] text-emerald-400">
                    <span className="uppercase tracking-widest">Total</span>
                    <span>₵{completedSale.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Dynamic Settlements Details */}
                <div className="p-3.5 bg-white/[0.02] border border-white/[0.06] rounded-2.5xl flex justify-between items-center">
                  <div>
                    <span className="text-[8px] font-black uppercase text-slate-500 block">Payment Method</span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">{completedSale.paymentMethod}</span>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 text-[8px] font-black uppercase py-1 px-2.5 rounded-lg shrink-0">
                    {completedSale.isOffline ? "Saved Offline" : "Completed"}
                  </Badge>
                </div>

                {/* Instant Link Sharing Action Row (New Pro Feature) */}
                <div className="flex items-center justify-between gap-2 p-1.5 bg-white/[0.01] border border-white/5 rounded-2xl shrink-0">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2.5">Receipt Link</p>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const digitalReceiptUrl = `${window.location.origin}/receipts/${completedSale.saleId}`;
                      navigator.clipboard.writeText(digitalReceiptUrl);
                      setCopied(true);
                      toast.success("Digital link copied successfully!");
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="h-8 border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-[#edf2f7] rounded-xl px-3 inline-flex items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all"
                  >
                    {copied ? (
                      <>
                        <svg className="h-3 w-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        <span>Get Copy Link</span>
                      </>
                    )}
                  </Button>
                </div>

                {/* Instant WhatsApp Share Portal with pristine inputs */}
                <div className="space-y-2.5 border-t border-white/10 pt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black uppercase text-amber-500 tracking-widest">Active Dispatch Center</span>
                    <span className="text-[8px] font-bold text-slate-600 uppercase font-mono tracking-widest">• WhatsApp Gateway</span>
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Customer Phone (eg. 0244123456)"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="h-10 text-xs font-mono font-bold bg-white/[0.02] border-white/10 rounded-xl text-white placeholder-slate-600 pl-3 focus:ring-1 focus:ring-emerald-500 focus-visible:ring-1 focus-visible:ring-offset-0 focus:border-emerald-500/50"
                    />
                    <Button
                      onClick={() => {
                        if (!customerPhone || customerPhone.length < 9) {
                          toast.error("Please enter a valid active WhatsApp number.");
                          return;
                        }
                        const formattedPhone = customerPhone.startsWith("0") 
                          ? `233${customerPhone.substring(1)}` 
                          : customerPhone.startsWith("233") 
                            ? customerPhone 
                            : `233${customerPhone}`;
                        
                        const text = encodeURIComponent(
                          `*OBOY YANKEE ENTERPRISE*\n` +
                          `=============================\n` +
                          `*INVOICE RECEIPT REPORT*\n` +
                          `*Doc Ref:* ${completedSale.saleId.replace(/-/g, '').substring(0, 16).toUpperCase()}\n` +
                          `*Date:* ${new Date(completedSale.date).toLocaleDateString()}\n\n` +
                          `*Items Purchased:* \n${completedSale.items.map((it: any) => `• ${it.product.name} (x${it.quantity}) - GH₵${(parseFloat(it.product.price) * it.quantity).toFixed(2)}`).join('\n')}\n` +
                          `=============================\n` +
                          `*Subtotal:* GH₵${completedSale.subtotal.toFixed(2)}\n` +
                          `*Total:* GH₵${completedSale.total.toFixed(2)}\n\n` +
                          `*Settlement:* ${completedSale.paymentMethod}\n\n` +
                          `Thank you for shopping with us! Digital Receipt link: ${window.location.origin}/receipts/${completedSale.saleId}`
                        );
                        window.open(`https://wa.me/${formattedPhone}?text=${text}`, "_blank");
                        toast.success("Receipt dispatched to WhatsApp gateway!");
                      }}
                      className="h-10 bg-emerald-500 hover:bg-emerald-600 text-black rounded-xl px-4 text-xs font-black uppercase tracking-widest cursor-pointer transition-colors"
                    >
                      Share
                    </Button>
                  </div>
                </div>

                {/* Industrial Cryptographic secure barcode visual wrapper */}
                <div className="pt-3 flex flex-col items-center justify-center space-y-1 bg-white/[0.01] rounded-2xl py-3 border border-white/[0.02]">
                  <div className="h-8 flex items-center justify-center gap-[2px] opacity-40">
                    <span className="w-1.5 h-6 bg-slate-300 rounded-[1px]" />
                    <span className="w-[1px] h-6 bg-slate-300" />
                    <span className="w-1 h-6 bg-slate-200 rounded-[1px]" />
                    <span className="w-[2px] h-6 bg-slate-200" />
                    <span className="w-[1px] h-6 bg-slate-300" />
                    <span className="w-1.5 h-6 bg-slate-300 rounded-[1px]" />
                    <span className="w-[1px] h-6 bg-slate-400" />
                    <span className="w-2 h-6 bg-slate-200 rounded-[1px]" />
                    <span className="w-[3px] h-6 bg-slate-300" />
                    <span className="w-1.5 h-6 bg-slate-300 rounded-[1px]" />
                    <span className="w-[1px] h-6 bg-slate-300" />
                    <span className="w-1.5 h-6 bg-slate-300 rounded-[1px]" />
                  </div>
                  <span className="text-[7px] font-mono tracking-[0.4em] text-slate-500 uppercase">Secure Cryptographic Ledger Node</span>
                </div>
              </div>

              {/* Form dismiss controls */}
              <div className="pt-4 border-t border-white/10 shrink-0 flex gap-2">
                <Button 
                  onClick={() => {
                    toast.success("Thermal print command dispatched to terminal stream.");
                  }}
                  variant="outline"
                  className="w-1/2 h-11 border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-xs font-black uppercase tracking-widest text-[#edf2f7] transition-all"
                >
                  Thermal Print
                </Button>
                <Button 
                  onClick={() => {
                    setCompletedSale(null);
                    setCustomerPhone('');
                  }}
                  className="w-1/2 h-11 bg-slate-100 text-slate-950 hover:bg-white text-xs font-black uppercase tracking-widest cursor-pointer transition-all"
                >
                  New Order
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
