import { Outlet, useLocation, Link } from "react-router-dom";
import { 
  LogOut,
  Menu,
  ChevronRight,
  Bell,
  Search,
  Settings,
  LayoutDashboard,
  ShoppingCart,
  Package,
  CreditCard,
  Receipt,
  Lock
} from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "motion/react";
import { TenantSidebar } from "@/components/layout/tenant-sidebar";
import { useAuth } from "@/contexts/auth-context";
import { TenantSecurityWrapper } from "@/components/auth/tenant-security-wrapper";
import { NexaCommand } from "@/components/intelligence/nexa-command";

export function TenantLayout() {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const isPOSPage = location.pathname.includes('/pos');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = (e: any) => {
      setScrolled(e.target.scrollTop > 10);
    };
    const mainContent = document.getElementById('main-scroll');
    mainContent?.addEventListener('scroll', handleScroll);
    return () => mainContent?.removeEventListener('scroll', handleScroll);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname.split('/').pop() || 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans selection:bg-primary/10">
        <NexaCommand />
        
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[40] lg:hidden"
              />
              <motion.div 
                initial={{ x: -280, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -280, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed lg:relative w-[280px] h-full shrink-0 z-[50] lg:z-auto"
              >
                <TenantSidebar onSelect={() => window.innerWidth < 1024 && setIsSidebarOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 flex flex-col min-w-0 bg-background/50 relative overflow-hidden">
          <header className={cn(
            "h-16 sm:h-20 flex items-center justify-between px-3 sm:px-8 sticky top-0 z-20 transition-all duration-300 border-b shrink-0 safe-top",
            scrolled ? "bg-background/80 backdrop-blur-xl border-border shadow-sm" : "bg-transparent border-transparent"
          )} style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
            <div className="flex items-center gap-3 sm:gap-6">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="rounded-2xl border-border bg-muted/40 hover:bg-muted/80 text-foreground shrink-0 h-11 w-11 shadow-sm transition-all"
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div className="hidden md:flex flex-col">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">
                  <span>OBOY YANKEE</span>
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-primary">{getPageTitle()}</span>
                </div>
                <h1 className="text-xl font-black italic tracking-tighter uppercase text-foreground leading-none mt-1">{getPageTitle()}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-5 shrink-0">
              <div className="hidden lg:flex items-center relative group w-80">
                <Search className="absolute left-4 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-500 transition-colors shrink-0" />
                <button 
                  onClick={() => {
                    const event = new KeyboardEvent('keydown', {
                      key: 'k',
                      metaKey: true,
                      ctrlKey: true
                    });
                    document.dispatchEvent(event);
                  }}
                  className="w-full pl-12 pr-4 h-12 rounded-2xl bg-muted/40 border border-border hover:bg-muted/80 transition-all text-left text-muted-foreground font-bold italic tracking-tight flex items-center justify-between"
                >
                  <span>Quick Search...</span>
                  <kbd className="h-5 px-1.5 rounded-lg border border-border bg-background font-mono text-[10px] text-muted-foreground/50">⌘K</kbd>
                </button>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <ThemeToggle />
                
                <Tooltip>
                  <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="hidden sm:flex h-11 w-11 rounded-2xl bg-muted/40 border border-border text-muted-foreground relative hover:bg-muted/80 transition-all shrink-0">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-3 right-3 h-2 w-2.5 bg-indigo-500 rounded-full border-2 border-background shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                      </Button>
                  </TooltipTrigger>
                  <TooltipContent className="font-bold">Notifications</TooltipContent>
                </Tooltip>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="p-1 rounded-2xl ring-1 ring-border hover:ring-indigo-500/30 transition-all bg-muted/40 text-foreground shrink-0">
                        <Avatar className="h-9 w-9 rounded-xl">
                          <AvatarImage src={user?.avatarUrl || ""} />
                          <AvatarFallback className="bg-indigo-500 text-white font-black text-[10px]">{user?.fullName?.substring(0, 2).toUpperCase() || "OP"}</AvatarFallback>
                        </Avatar>
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72 max-w-[calc(100vw-2rem)] p-2 rounded-2xl shadow-2xl border-border bg-card/95 backdrop-blur-xl">
                    <DropdownMenuLabel className="font-normal p-4">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-black italic uppercase tracking-tight leading-none text-foreground truncate max-w-[220px]">{user?.fullName || 'User'}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 truncate max-w-[220px]">{user?.role}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border" />
                    <Link to="/change-password">
                      <DropdownMenuItem className="p-4 rounded-xl cursor-pointer font-bold gap-3 focus:bg-indigo-500 focus:text-white">
                         <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-foreground"><Lock className="h-4 w-4" /></span>
                         Change Password
                      </DropdownMenuItem>
                    </Link>
                    {(user?.role === 'super_admin' || user?.role === 'company_admin') && (
                      <Link to="/settings">
                        <DropdownMenuItem className="p-4 rounded-xl cursor-pointer font-bold gap-3 focus:bg-indigo-500 focus:text-white">
                           <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-foreground"><Settings className="h-4 w-4" /></span>
                           Settings
                        </DropdownMenuItem>
                      </Link>
                    )}
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem className="p-4 rounded-xl cursor-pointer text-red-500 font-bold gap-3 focus:bg-red-500 focus:text-white" onClick={signOut}>
                       <span className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center"><LogOut className="h-4 w-4" /></span>
                       Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <footer className="hidden lg:flex shrink-0 h-10 border-t border-border/40 items-center justify-between px-4 sm:px-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 bg-secondary/10 order-last">
             <span>OBOY YANKEE ENTERPRISE</span>
             <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_5px_rgba(99,102,241,0.5)]" />
                  <span>Secure Access</span>
                </div>
             </div>
          </footer>

          <div 
            id="main-scroll"
            className={cn(
              "flex-1 bg-secondary/10",
              isPOSPage 
                ? "p-1.5 sm:p-3 lg:p-6 pb-20 lg:pb-6 no-scrollbar overflow-hidden flex flex-col min-h-0" 
                : "overflow-auto p-3 sm:p-6 lg:p-8 pb-24 lg:pb-8 custom-scrollbar"
            )}
          >
            <TenantSecurityWrapper>
              <div className={cn(
                "max-w-[1700px] mx-auto w-full transition-all duration-300 ease-out",
                isPOSPage && "h-full flex flex-col min-h-0 overflow-hidden"
              )}>
                <Suspense fallback={
                  <div className="flex flex-col items-center justify-center min-h-[40vh] py-12">
                     <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-500 mb-4"></div>
                     <span className="text-xs text-muted-foreground font-medium animate-pulse">Loading...</span>
                  </div>
                }>
                  <Outlet />
                </Suspense>
              </div>
            </TenantSecurityWrapper>
          </div>

          <div className="fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur-xl border-t border-border flex items-center justify-around px-2 z-40 lg:hidden shadow-lg safe-bottom" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
            <Link
              to="/dashboard"
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-16 text-muted-foreground hover:text-indigo-500 transition-colors",
                location.pathname === '/dashboard' && "text-indigo-500"
              )}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span className="text-[9px] font-black mt-1 uppercase tracking-tight">Home</span>
            </Link>
            <Link
              to="/pos"
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-16 text-muted-foreground hover:text-indigo-500 transition-colors",
                location.pathname.startsWith('/pos') && "text-indigo-500"
              )}
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="text-[9px] font-black mt-1 uppercase tracking-tight">Sell</span>
            </Link>
            <Link
              to="/receipts"
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-16 text-muted-foreground hover:text-indigo-500 transition-colors",
                location.pathname.startsWith('/receipts') && "text-indigo-500"
              )}
            >
              <Receipt className="h-5 w-5" />
              <span className="text-[9px] font-black mt-1 uppercase tracking-tight">Receipts</span>
            </Link>
            <Link
              to="/inventory"
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-16 text-muted-foreground hover:text-indigo-500 transition-colors",
                location.pathname.startsWith('/inventory') && "text-indigo-500"
              )}
            >
              <Package className="h-5 w-5" />
              <span className="text-[9px] font-black mt-1 uppercase tracking-tight">Stock</span>
            </Link>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex flex-col items-center justify-center flex-1 h-16 text-muted-foreground hover:text-indigo-500 transition-colors"
            >
              <Menu className="h-5 w-5" />
              <span className="text-[9px] font-black mt-1 uppercase tracking-tight">More</span>
            </button>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}

