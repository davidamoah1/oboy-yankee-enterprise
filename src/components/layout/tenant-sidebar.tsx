import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { UserRole } from '@/types/auth';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Receipt, 
  Users, 
  BarChart3, 
  Settings, 
  LifeBuoy,
  CreditCard,
  Building2,
  UserCog,
  History,
  Calculator,
  Wallet,
  Sparkles,
  ArrowRightCircle,
  Brain,
  FileBarChart,
  Phone,
  Zap,
  RotateCcw,
  HandCoins,
  TrendingUp,
  Tag
} from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarItem {
  label: string;
  href: string;
  icon: any;
  roles?: UserRole[];
  badge?: string;
  isNew?: boolean;
}

interface SidebarProps {
  onSelect?: () => void;
}

export function TenantSidebar({ onSelect }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  const baseUrl = '';

  const groups: { title: string; items: SidebarItem[] }[] = [
    {
      title: 'Main Operations',
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: [UserRole.COMPANY_ADMIN, UserRole.MANAGER, UserRole.ACCOUNTANT, UserRole.STORE_KEEPER, UserRole.SALES_OFFICER] },
        { label: 'POS Terminal', href: '/pos', icon: ShoppingCart, badge: 'LIVE' },
        { label: 'Sales History', href: '/sales', icon: History },
        { label: 'Receipts', href: '/receipts', icon: Receipt },
        { label: 'Returns & Refunds', href: '/returns', icon: RotateCcw, isNew: true, roles: [UserRole.COMPANY_ADMIN, UserRole.MANAGER, UserRole.STORE_KEEPER] },
        { label: 'Credit Sales', href: '/credit-sales', icon: HandCoins, isNew: true, roles: [UserRole.COMPANY_ADMIN, UserRole.MANAGER, UserRole.ACCOUNTANT] },
        { label: 'Z-Reports', href: '/z-reports', icon: FileBarChart, isNew: true, roles: [UserRole.COMPANY_ADMIN, UserRole.MANAGER] },
      ]
    },
    {
      title: 'Products & Partners',
      items: [
        { label: 'Products & Stock', href: '/inventory', icon: Package },
        { label: 'Suppliers', href: '/suppliers', icon: Building2, roles: [UserRole.COMPANY_ADMIN, UserRole.STORE_KEEPER] },
        { label: 'Staff List', href: '/staff', icon: UserCog, roles: [UserRole.COMPANY_ADMIN, UserRole.HR] },
        { label: 'Customers', href: '/customers', icon: Users },
      ]
    },
    {
      title: 'Bookkeeping & Money',
      items: [
        { label: 'Invoices & Bills', href: '/invoices', icon: CreditCard, roles: [UserRole.COMPANY_ADMIN, UserRole.MANAGER, UserRole.ACCOUNTANT] },
        { label: 'Expenses', href: '/expenses', icon: Wallet, roles: [UserRole.COMPANY_ADMIN, UserRole.MANAGER, UserRole.STORE_KEEPER, UserRole.ACCOUNTANT] },
        { label: 'Profit Analysis', href: '/profit-analysis', icon: TrendingUp, isNew: true, roles: [UserRole.COMPANY_ADMIN, UserRole.MANAGER, UserRole.ACCOUNTANT] },
        { label: 'Bookkeeping', href: '/accounting', icon: Calculator, roles: [UserRole.COMPANY_ADMIN, UserRole.ACCOUNTANT] },
        { label: 'Staff Salaries', href: '/payroll', icon: History, roles: [UserRole.COMPANY_ADMIN, UserRole.HR] },
      ]
    },
    {
      title: 'Services & Vendors',
      items: [
        { label: 'Airtime & Data', href: '/airtime', icon: Phone, isNew: true },
        { label: 'Bill Payments', href: '/bill-payments', icon: Zap, isNew: true },
        { label: 'Promotions', href: '/promotions', icon: Tag, isNew: true, roles: [UserRole.COMPANY_ADMIN, UserRole.MANAGER, UserRole.STORE_KEEPER] },
        { label: 'Mobile Money (MoMo)', href: '/mobile-money', icon: Sparkles },
        { label: 'Online Shop', href: '/online-store', icon: ShoppingCart },
      ]
    },
    {
      title: 'Analytics & Intelligence',
      items: [
        { label: 'Intelligence Hub', href: '/intelligence', icon: Brain, roles: [UserRole.COMPANY_ADMIN, UserRole.SALES_OFFICER, UserRole.STORE_KEEPER], badge: 'AI' },
        { label: 'Sales Reports', href: '/reports', icon: BarChart3, roles: [UserRole.COMPANY_ADMIN, UserRole.SALES_OFFICER, UserRole.STORE_KEEPER], isNew: true },
      ]
    },
    {
      title: 'Settings & Help',
      items: [
        { label: 'Settings', href: '/settings', icon: Settings, roles: [UserRole.COMPANY_ADMIN] },
        { label: 'Support', href: '/support', icon: LifeBuoy },
      ]
    }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950 border-r border-white/5 w-64 relative group/sidebar">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500/0 via-indigo-500/20 to-indigo-500/0" />

      <Link to="/dashboard" className="h-24 px-8 flex items-center gap-4 relative z-10 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group/header">
        <div className="h-10 w-10 rounded-2xl bg-white shadow-[0_0_20px_rgba(99,102,241,0.2)] overflow-hidden flex items-center justify-center rotate-3 group-hover/header:rotate-0 transition-transform duration-500 shrink-0">
          <div className="h-full w-full flex items-center justify-center bg-indigo-600">
            <span className="text-white font-black text-lg italic">N</span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black italic tracking-tighter text-white uppercase leading-none">OBOY YANKEE</span>
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-500/60 mt-1 italic">Enterprise POS</span>
        </div>
      </Link>

      <nav className="flex-1 px-4 py-8 space-y-8 overflow-y-auto custom-scrollbar relative z-10">
        {groups.map((group) => {
          const filteredGroupItems = group.items.filter(item => {
            if (!item.roles) return true;
            return user && item.roles.includes(user.role);
          });

          if (filteredGroupItems.length === 0) return null;

          return (
            <div key={group.title} className="space-y-1">
              <h3 className="px-5 text-[9px] font-black uppercase tracking-[0.25em] text-slate-600 mb-4">{group.title}</h3>
              <div className="space-y-1">
                {filteredGroupItems.map((item) => {
                  const isActive = location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={onSelect}
                      className={cn(
                        "flex items-center justify-between px-5 py-3 rounded-2xl transition-all duration-300 group/item relative mobile-nav-item",
                        isActive 
                          ? "bg-white/5 text-white border border-white/5 shadow-[0_0_20px_rgba(255,255,255,0.02)]" 
                          : "text-slate-500 hover:text-white hover:bg-white/5 border border-transparent"
                      )}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <item.icon className={cn(
                          "h-4 w-4 transition-all duration-300 shrink-0",
                          isActive ? "text-indigo-500 scale-110" : "text-slate-600 group-hover/item:text-slate-300"
                        )} />
                        <span className="text-[10px] font-black uppercase tracking-[0.05em] truncate">{item.label}</span>
                      </div>
                      
                      {item.badge && (
                        <span className="text-[8px] font-black bg-indigo-500 text-black px-1.5 py-0.5 rounded-sm animate-pulse">{item.badge}</span>
                      )}
                      {isActive && (
                        <motion.div 
                          layoutId="active-nav"
                          className="absolute right-3 w-1 h-1 bg-indigo-500 rounded-full"
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="p-6 relative z-10">
        <div className="bg-slate-900 border border-white/5 rounded-3xl p-5 group/footer overflow-hidden relative">
          <div className="absolute inset-0 bg-indigo-500/5 translate-y-full group-hover/footer:translate-y-0 transition-transform duration-500" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white italic">Status: Online</span>
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors flex items-center justify-between">
              <span>{user?.fullName?.split(' ')[0] || 'Active User'}</span>
              <ArrowRightCircle className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all text-indigo-500 translate-x-2 group-hover:translate-x-0" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

