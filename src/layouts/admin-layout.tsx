import { Outlet, useLocation } from "react-router-dom";
import { 
  LogOut, 
  Menu,
  X,
  Bell,
  Search,
  Command as CommandIcon,
  ShieldCheck
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { motion, AnimatePresence } from "motion/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SuperAdminSidebar } from "@/components/layout/super-admin-sidebar";
import { useAuth } from "@/contexts/auth-context";

export function AdminLayout() {
  const location = useLocation();
  const { signOut, profile } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    // Responsive sidebar state
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen bg-slate-950 overflow-hidden selection:bg-red-500/20 antialiased">
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <>
              {/* Mobile Overlay */}
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
                <SuperAdminSidebar onSelect={() => window.innerWidth < 1024 && setIsSidebarOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 flex flex-col min-w-0 bg-slate-950 relative overflow-hidden">
          <header className="h-20 sm:h-24 sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 sm:px-10">
            <div className="flex items-center gap-4 sm:gap-6">
               <Button 
                variant="outline" 
                size="icon"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="h-11 w-11 rounded-2xl border-white/5 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all shadow-sm shrink-0"
               >
                 {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
               </Button>
               
               <div className="hidden lg:flex flex-col">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 italic">Global Controller v4.0</span>
                  </div>
                  <h1 className="text-xl font-black italic tracking-tighter uppercase text-white leading-none mt-1">Platform Governance</h1>
               </div>
            </div>
            
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="hidden md:flex items-center relative group w-80">
                <Search className="absolute left-4 h-4 w-4 text-white/20 group-focus-within:text-red-500 transition-colors shrink-0" />
                <input 
                  type="text"
                  placeholder="System wide search..." 
                  className="w-full pl-12 h-12 rounded-2xl bg-white/5 border border-white/5 focus:bg-white/10 transition-all outline-none focus:ring-1 focus:ring-red-500/20 text-white font-bold italic tracking-tight placeholder:text-white/10"
                />
              </div>

              <div className="flex items-center gap-2 sm:gap-4">
                <ThemeToggle />
                
                <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl bg-white/5 border border-white/5 text-white/40 relative hover:bg-white/10 shrink-0">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-3.5 right-3.5 h-2 w-2 bg-red-500 rounded-full border-2 border-slate-950" />
                </Button>

                <div className="flex items-center gap-2 sm:gap-4 pl-2 sm:pl-4 border-l border-white/10 shrink-0">
                  <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60 leading-none mb-1">Global Director</span>
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-red-500 leading-none italic uppercase truncate max-w-[120px]">{profile?.full_name || 'Administrator'}</span>
                  </div>
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl border-2 border-white/10 shadow-2xl shrink-0">
                    <AvatarImage src={profile?.avatar_url || ""} />
                    <AvatarFallback className="bg-red-600 text-white font-black italic">{profile?.full_name?.substring(0, 2).toUpperCase() || 'SA'}</AvatarFallback>
                  </Avatar>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => signOut()}
                    className="h-11 w-11 rounded-2xl bg-white/5 border border-white/5 text-white/40 hover:text-red-500 hover:bg-red-500/10 transition-all ml-1 sm:ml-2 shrink-0"
                    title="Sign Out"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <div 
            id="main-scroll"
            className="flex-1 overflow-auto bg-slate-950 no-scrollbar relative"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(220,38,38,0.05),transparent_50%)] pointer-events-none" />
            <div className="min-h-full p-4 sm:p-10 max-w-[1800px] mx-auto w-full relative z-10">
              <Outlet />
            </div>
          </div>

          <footer className="h-10 border-t border-white/5 flex items-center justify-between px-10 text-[10px] font-black uppercase tracking-[0.3em] text-white/10 bg-slate-950 order-last">
             <span>Platform Integrity Secure • Multi-Region Ghana</span>
             <div className="flex items-center gap-6">
                <span className="text-red-500/40">Restricted Access Console</span>
                <div className="h-1 w-1 rounded-full bg-white/10" />
                <span>© {new Date().getFullYear()} SME OS</span>
             </div>
          </footer>
        </main>
      </div>
    </TooltipProvider>
  );
}

