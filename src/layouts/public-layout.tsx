import { Link, Outlet, useLocation } from "react-router-dom";
import { Globe, Menu, X, ArrowRight, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export function PublicLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/20">
      <header className={cn(
        "h-20 sticky top-0 z-50 transition-all duration-500 border-b",
        scrolled ? "bg-background/80 backdrop-blur-xl border-border/100 shadow-md h-16" : "bg-transparent border-transparent"
      )}>
        <div className="container h-full mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-primary p-2 rounded-xl transition-all duration-500 group-hover:rotate-[360deg] shadow-lg shadow-primary/20">
              <Globe className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
               <span className="font-black text-xs uppercase tracking-[0.2em] leading-none mb-0.5 text-primary/60">Ghana Native</span>
               <span className="font-black text-xl tracking-tighter uppercase italic leading-none">SME OS</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.href} 
                className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
            <div className="h-4 w-px bg-border mx-2" />
            <ThemeToggle />
            <Button 
              variant="ghost" 
              className="text-xs font-black uppercase tracking-[0.2em] hover:bg-muted rounded-xl px-6"
              asChild
            >
              <Link to="/login">Sign In</Link>
            </Button>
            <Button 
              className="text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 rounded-xl px-8 h-11 bg-primary border-none hover:translate-y-[-2px] transition-all"
              asChild
            >
              <Link to="/register">
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </nav>

          {/* Mobile Nav */}
          <div className="md:hidden flex items-center gap-4">
             <ThemeToggle />
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-xl border-border/50">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-[400px] p-8 flex flex-col bg-background/95 backdrop-blur-xl border-none">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Navigation Menu</SheetTitle>
                    <SheetDescription>Access platform links and features</SheetDescription>
                  </SheetHeader>
                  <div className="flex items-center gap-2 mb-8 mt-2">
                    <Globe className="h-6 w-6 text-primary" />
                    <span className="font-black text-xl tracking-tighter uppercase italic">SME OS</span>
                  </div>
                  <nav className="flex flex-col gap-4 flex-1">
                    {navLinks.map((link) => (
                      <Link 
                        key={link.name} 
                        to={link.href} 
                        onClick={() => setIsOpen(false)}
                        className="text-lg xs:text-xl sm:text-2xl font-black italic uppercase tracking-tight hover:text-primary transition-all flex items-center justify-between group py-2 border-b border-border/10"
                      >
                        {link.name}
                        <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-primary" />
                      </Link>
                    ))}
                  </nav>
                  <div className="flex flex-col gap-3 pt-6 border-t border-border/50 mt-auto">
                    <Button 
                      variant="outline" 
                      className="w-full h-12 text-xs font-black uppercase tracking-widest rounded-xl border"
                      asChild
                    >
                      <Link to="/login" onClick={() => setIsOpen(false)}>Sign In</Link>
                    </Button>
                    <Button 
                      className="w-full h-12 text-xs font-black uppercase tracking-widest rounded-xl shadow-xl shadow-primary/10 border-none"
                      asChild
                    >
                      <Link to="/register" onClick={() => setIsOpen(false)}>Get Started Now</Link>
                    </Button>
                  </div>
                </SheetContent>
             </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="py-24 border-t border-border/50 bg-card/30 relative overflow-hidden backdrop-blur-sm">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none translate-y-1/2 translate-x-1/2" />
        
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
            <div className="md:col-span-5 space-y-8">
              <div className="flex items-center gap-3">
                <div className="bg-primary p-2 rounded-xl">
                    <Globe className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="font-black text-2xl italic tracking-tighter uppercase leading-none mt-1">Ghana SME OS</span>
              </div>
              <p className="text-lg text-muted-foreground max-w-sm font-medium leading-relaxed">
                Built for business growth. Designed for scale. Empowering the next wave of African enterprise.
              </p>
              <div className="flex gap-4">
                 <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer">
                    <Zap className="h-5 w-5" />
                 </div>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-10">Business</h4>
              <ul className="space-y-6 text-sm font-black uppercase tracking-widest text-muted-foreground">
                <li><Link to="/features" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><a href="#" className="hover:text-primary transition-colors">Public API</a></li>
              </ul>
            </div>
            
            <div className="md:col-span-2">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-10">Company</h4>
              <ul className="space-y-6 text-sm font-black uppercase tracking-widest text-muted-foreground">
                <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link to="/security" className="hover:text-primary transition-colors">Trust & Security</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition-colors">Help & Support</Link></li>
                <li><Link to="/admin-login" className="text-secondary hover:text-primary transition-colors">Admin Console</Link></li>
              </ul>
            </div>

            <div className="md:col-span-3">
               <div className="p-8 rounded-3xl bg-muted/50 border border-border/50">
                  <h4 className="font-black text-sm uppercase tracking-widest mb-4 italic">Newsletter</h4>
                  <p className="text-xs text-muted-foreground mb-6 font-medium">Get the latest on SME growth and automation.</p>
                  <div className="flex gap-2">
                     <input placeholder="Email" className="bg-background border border-border/50 rounded-xl px-4 text-xs w-full focus:outline-primary/50" />
                     <Button size="icon" className="rounded-xl shrink-0"><ArrowRight className="h-4 w-4" /></Button>
                  </div>
               </div>
            </div>
          </div>
          
          <div className="pt-12 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-8">
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic">
                © 2026 NEXUS BUSINESS SYSTEMS // ALL RIGHTS RESERVED
             </span>
             <div className="flex flex-wrap gap-x-10 gap-y-4 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 justify-center md:justify-end">
                <Link to="/security" className="hover:text-primary transition-colors">Security & Trust</Link>
                <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
                <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                <Link to="/data-protection" className="hover:text-primary transition-colors">Data Protection</Link>
                <Link to="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
