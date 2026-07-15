import { Link } from "react-router-dom";
import { Store, ArrowRight, Zap, Shield, BarChart3, ChevronRight, Globe, Layout, Sparkles, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden selection:bg-primary/20">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1200px] pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 blur-[120px] rounded-full opacity-50" />
        <div className="absolute top-40 left-[20%] w-[400px] h-[400px] bg-primary/10 blur-[100px] rounded-full animate-pulse opacity-20" />
      </div>

      <main className="relative z-10">
        {/* Floating Badges Area */}
        <section className="container mx-auto px-4 xs:px-6 pt-16 sm:pt-32 pb-20 sm:pb-40 text-center relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 bg-muted/50 border border-border/50 backdrop-blur-md rounded-full text-[9px] sm:text-xs font-black uppercase tracking-[0.25em] sm:tracking-[0.3em] text-primary mb-8 sm:mb-12 shadow-sm"
          >
             <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-primary animate-pulse" />
             <span>The Smartest Way to Run Your Business in Africa</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-4xl xs:text-5xl sm:text-7xl md:text-[160px] font-black tracking-[-0.06em] leading-none md:leading-[0.8] mb-8 sm:mb-12 uppercase italic relative">
              Business <br />
              <span className="text-muted-foreground/20 not-italic tracking-[-0.08em]">Freedom.</span>
            </h1>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-xl md:text-3xl text-muted-foreground max-w-4xl mx-auto mb-10 sm:mb-20 leading-relaxed font-medium tracking-tight"
          >
            SME OS is a secure system designed to empower the modern shop owner with advanced tools and easy payment collections.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-center justify-center p-2 rounded-[32px] w-full max-w-md sm:max-w-none mx-auto"
          >
            <Link to="/login" className="w-full sm:w-auto">
              <Button size="lg" className="h-16 sm:h-24 w-full sm:w-auto px-8 sm:px-16 text-base sm:text-2xl font-black uppercase tracking-widest gap-4 sm:gap-6 shadow-[0_16px_32px_-16px_oklch(var(--primary)/0.3)] rounded-[16px] sm:rounded-[24px] group relative overflow-hidden bg-primary border-none">
                 <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                 <span className="relative z-10 flex items-center justify-center gap-3 sm:gap-4 italic uppercase tracking-tighter">
                   Start Now
                   <ArrowRight className="h-5 w-5 sm:h-8 sm:w-8 group-hover:translate-x-3 transition-transform duration-500" />
                 </span>
              </Button>
            </Link>
            <Link to="/features" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="h-16 sm:h-24 w-full sm:w-auto px-8 sm:px-16 text-base sm:text-2xl font-black uppercase tracking-widest rounded-[16px] sm:rounded-[24px] border-2 border-border/50 hover:bg-muted transition-all text-muted-foreground hover:text-foreground italic uppercase tracking-tighter">
                See Features
              </Button>
            </Link>
          </motion.div>

          {/* Interactive UI Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-16 sm:mt-32 max-w-7xl mx-auto rounded-[24px] sm:rounded-[48px] border border-border/40 bg-card/40 backdrop-blur-2xl p-3 sm:p-6 shadow-[0_64px_64px_-32px_oklch(0_0_0/0.15)] md:shadow-[0_128px_128px_-64px_oklch(0_0_0/0.15)] relative group cursor-crosshair overflow-hidden"
          >
             <div className="bg-muted/80 rounded-[16px] sm:rounded-[32px] aspect-[16/10] flex items-center justify-center overflow-hidden border border-border/50 relative shadow-inner">
                <div className="absolute inset-0 bg-[#0A0A0B] opacity-90" />
                
                {/* Simulated UI Elements */}
                <div className="absolute top-4 sm:top-12 left-4 sm:left-12 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8 w-full pr-8 sm:pr-24">
                   {[1,2,3,4].map(i => (
                     <div key={i} className="h-20 sm:h-40 rounded-xl sm:rounded-3xl bg-white/5 border border-white/10 p-3 sm:p-6 flex flex-col justify-between">
                        <div className="h-1 w-8 sm:h-1 sm:w-12 bg-primary/40 rounded-full" />
                        <div className="space-y-1 sm:space-y-2">
                           <div className="h-1.5 w-full bg-white/10 rounded-full" />
                           <div className="h-1.5 w-2/3 bg-white/5 rounded-full z-0 hidden sm:block" />
                        </div>
                     </div>
                   ))}
                </div>

                <div className="flex flex-col items-center gap-3 sm:gap-6 relative z-10">
                   <div className="h-12 w-12 sm:h-20 sm:w-20 rounded-full bg-primary/20 flex items-center justify-center animate-pulse border border-primary/30">
                      <Zap className="h-6 w-6 sm:h-10 sm:w-10 text-primary" />
                   </div>
                   <div className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.4em] sm:tracking-[0.6em] text-white/20">DASHBOARD_READY</div>
                </div>

                {/* Floating tooltips */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-4 right-4 sm:bottom-20 sm:right-20 bg-primary p-4 sm:p-8 rounded-[20px] sm:rounded-[32px] shadow-2xl text-primary-foreground max-w-[130px] sm:max-w-xs text-left rotate-2 hidden xs:block"
                >
                   <BarChart3 className="h-5 w-5 sm:h-10 sm:w-10 mb-2 sm:mb-4 text-white" />
                   <div className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] mb-1 sm:mb-2 opacity-60">Money Earned</div>
                   <div className="text-sm sm:text-3xl font-black italic tracking-tighter uppercase leading-none">+GHS 24,000</div>
                </motion.div>
             </div>
          </motion.div>
        </section>

        {/* Global Capabilities Section */}
        <section className="bg-muted/40 w-full py-20 sm:py-32 md:py-48 border-y border-border/50 relative overflow-hidden">
           <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
           
           <div className="container mx-auto px-4 xs:px-6 relative z-10">
              <div className="grid lg:grid-cols-2 gap-16 lg:gap-32 mb-20 sm:mb-40 items-center">
                 <div>
                    <div className="text-primary text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] sm:tracking-[0.5em] mb-4 sm:mb-8">Business Precision</div>
                    <h2 className="text-3xl xs:text-4xl sm:text-6xl md:text-8xl font-black italic tracking-tighter mb-6 sm:mb-12 leading-none md:leading-[0.9] uppercase">Scale your shop with <span className="text-primary opacity-40">Zero Effort.</span></h2>
                    <p className="text-base sm:text-lg md:text-2xl text-muted-foreground font-medium leading-relaxed max-w-xl">
                       We've automated the hard parts of African retail. Security, multi-shop syncing, and real-time records — all built-in.
                    </p>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 shrink-0 w-full lg:w-auto">
                    {[
                      { label: "System Uptime", val: "99.99%" },
                      { label: "Bookkeeping", val: "REAL-TIME" },
                      { label: "Active Shops", val: "2,400+" },
                      { label: "Processing Speed", val: "500/s" }
                    ].map((stat, i) => (
                      <div key={i} className="bg-card border border-border/50 p-5 xs:p-6 sm:p-12 rounded-[24px] sm:rounded-[40px] text-center shadow-xl shadow-black/[0.02] hover:border-primary/20 transition-all group w-full overflow-hidden">
                         <div className="text-xl xs:text-2xl sm:text-4xl md:text-5xl font-black mb-1 sm:mb-3 tracking-tighter italic uppercase group-hover:text-primary transition-colors truncate">{stat.val}</div>
                         <div className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.5em] text-muted-foreground/60 truncate">{stat.label}</div>
                      </div>
                    ))}
                 </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10">
                 {[
                    { title: "Private Data", desc: "Bank-grade security. Each shop's data is kept completely private and safe.", icon: Shield },
                    { title: "Mobile Money", desc: "Built-in MTN & Telecel integration for instant digital sales.", icon: Zap },
                    { title: "Offline Ready", desc: "Advanced system keeps your terminal running even when the internet goes out.", icon: Layout },
                 ].map((feat, i) => (
                   <motion.div 
                    whileHover={{ y: -10 }}
                    key={i} 
                    className="p-6 xs:p-8 sm:p-12 rounded-[24px] sm:rounded-[48px] bg-card border border-border/40 hover:border-primary transition-all flex flex-col group shadow-sm shadow-black/[0.02]"
                   >
                     <div className="bg-primary/5 w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-6 sm:mb-10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-sm">
                       <feat.icon className="h-6 w-6 sm:h-10 sm:w-10" />
                     </div>
                     <h3 className="text-2xl sm:text-3xl font-black italic tracking-tighter mb-4 sm:mb-6 uppercase leading-tight">{feat.title}</h3>
                     <p className="text-muted-foreground leading-relaxed font-bold text-xs sm:text-sm uppercase opacity-60 tracking-wider">
                       {feat.desc}
                     </p>
                     <Link to="/features" className="mt-8 sm:mt-12 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-primary/40 group-hover:text-primary transition-colors cursor-pointer">
                        Learn How it Works <ChevronRight className="h-3 w-3 group-hover:translate-x-2 transition-transform" />
                     </Link>
                   </motion.div>
                 ))}
              </div>
           </div>
        </section>

        {/* Global Call to Action */}
        <section className="container mx-auto px-4 xs:px-6 py-20 sm:py-40">
           <div className="bg-primary rounded-[32px] sm:rounded-[64px] p-8 xs:p-12 md:p-32 text-center text-primary-foreground relative overflow-hidden group shadow-[0_32px_64px_-16px_oklch(var(--primary)/0.3)] md:shadow-[0_64px_128px_-32px_oklch(var(--primary)/0.3)]">
              <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/5 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />
              <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
                 <div className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.4em] sm:tracking-[0.8em] mb-6 sm:mb-12 opacity-40">Start Your Journey</div>
                 <h2 className="text-2xl xs:text-3xl sm:text-5xl md:text-7xl lg:text-[100px] font-black italic tracking-[-0.05em] mb-8 sm:mb-16 leading-none md:leading-[0.8] uppercase max-w-full">
                    Revolutionize <br />
                    <span className="text-white/40 not-italic">Your Business.</span>
                 </h2>
                 <Button 
                    size="lg" 
                    className="h-14 sm:h-24 px-8 sm:px-20 bg-white text-primary hover:bg-white/90 text-sm sm:text-2xl font-black uppercase tracking-widest rounded-[18px] sm:rounded-3xl shadow-2xl transition-all hover:scale-105 border-none w-full sm:w-auto flex items-center justify-center gap-3 sm:gap-6"
                    asChild
                 >
                    <Link to="/login">
                       Get Started
                       <ArrowRight className="h-4 w-4 sm:h-8 sm:w-8 ml-2 sm:ml-6 text-primary" />
                    </Link>
                 </Button>
              </div>
           </div>
        </section>
      </main>
    </div>
  );
}

