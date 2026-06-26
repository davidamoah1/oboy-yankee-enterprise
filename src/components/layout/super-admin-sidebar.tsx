import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  Users, 
  Building2, 
  CreditCard, 
  Settings, 
  ScrollText, 
  LifeBuoy,
  LayoutDashboard,
  ShieldAlert,
  Activity,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

interface SidebarItem {
  label: string;
  href: string;
  icon: any;
}

interface SuperAdminSidebarProps {
  onSelect?: () => void;
}

export function SuperAdminSidebar({ onSelect }: SuperAdminSidebarProps) {
  const location = useLocation();
  const { signOut } = useAuth();
  const baseUrl = '/super-admin';

  const items: SidebarItem[] = [
    { label: 'Platform Overview', href: baseUrl, icon: LayoutDashboard },
    { label: 'Shop Management', href: `${baseUrl}/tenants`, icon: Building2 },
    { label: 'User Directory', href: `${baseUrl}/users`, icon: Users },
    { label: 'Revenue & Subs', href: `${baseUrl}/transactions`, icon: CreditCard },
    { label: 'Plan Architecture', href: `${baseUrl}/plans`, icon: Activity },
    { label: 'Market Analytics', href: `${baseUrl}/analytics`, icon: BarChart3 },
    { label: 'Security Logs', href: `${baseUrl}/logs`, icon: ScrollText },
    { label: 'Support Queue', href: `${baseUrl}/support`, icon: LifeBuoy },
    { label: 'Global Config', href: `${baseUrl}/settings`, icon: Settings },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950 border-r border-white/5 w-64 pt-6">
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.4)] flex items-center justify-center">
          <ShieldAlert className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-black italic tracking-tighter text-white uppercase">SUPER ADMIN</span>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {items.map((item) => {
          const isActive = location.pathname === item.href || (item.href !== baseUrl && location.pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onSelect}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-bold uppercase tracking-tight mobile-nav-item overflow-hidden",
                isActive 
                  ? "bg-red-600/10 text-red-500 shadow-[inset_0_0_10px_rgba(220,38,38,0.05)] border border-red-600/10" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
              )}
            >
              <item.icon className={cn(
                "h-4 w-4 transition-transform group-hover:scale-110 shrink-0",
                isActive ? "text-red-500" : "text-slate-500"
              )} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto space-y-4">
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-4">
           <div className="flex items-center gap-2 mb-2 text-red-500">
              <ShieldAlert className="h-3 w-3" />
              <span className="text-[10px] font-black uppercase tracking-widest">Confidential Area</span>
           </div>
           <p className="text-[9px] text-slate-500 font-bold uppercase leading-tight">Access is monitored and recorded for compliance.</p>
        </div>

        <button 
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 text-slate-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all duration-300 text-[10px] font-black uppercase tracking-[0.2em]"
        >
          <LogOut className="h-4 w-4" />
          Terminate Session
        </button>
      </div>
    </div>
  );
}
