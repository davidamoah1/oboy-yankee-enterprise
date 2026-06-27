import React from "react";
import { 
  Users, 
  Target, 
  Zap, 
  Globe, 
  ShieldCheck, 
  Award,
  ArrowRight,
  TrendingUp,
  Heart
} from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function AboutPage() {
  const stats = [
    { label: "Active Merchants", value: "25k+", icon: Users },
    { label: "Transactions Processed", value: "$450M+", icon: TrendingUp },
    { label: "Cities & Locations", value: "15+", icon: Globe },
    { label: "Service Reliability", value: "99.9%", icon: Zap },
  ];

  const values = [
    {
      title: "Radical Transparency",
      description: "We believe in clear processes and open data systems. No hidden fees, no opaque algorithms.",
      icon: ShieldCheck
    },
    {
      title: "Merchant-First Design",
      description: "Every feature we build is tested against real-world retail and service scenarios in emerging markets.",
      icon: Heart
    },
    {
      title: "Global Scalability",
      description: "We build for the future. Our system is designed to handle millions of businesses simultaneously.",
      icon: Target
    }
  ];

  return (
    <div className="min-h-screen pt-32 pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        
        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-6 w-1 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Our Story</span>
            </div>
            <h1 className="text-6xl sm:text-8xl font-black italic tracking-tighter uppercase leading-[0.85] text-slate-100 mb-8">
              Revolutionizing <span className="text-primary italic">Business Management.</span>
            </h1>
            <p className="text-slate-500 font-bold text-lg sm:text-xl leading-relaxed mb-10 max-w-xl">
              Nexus was founded on a single premise: that small businesses in Africa deserve enterprise-grade tools that are as powerful as they are intuitive.
            </p>
            <div className="flex flex-wrap gap-4">
               <Button asChild className="h-16 px-10 rounded-2xl bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/20 transition-all font-black uppercase tracking-widest text-[10px] border-none">
                  <Link to="/contact">Join the movement <ArrowRight className="ml-2 h-4 w-4" /></Link>
               </Button>
               <div className="flex -space-x-4 items-center pl-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-12 w-12 rounded-full border-4 border-background bg-slate-800 flex items-center justify-center overflow-hidden">
                       <img src={`https://i.pravatar.cc/100?img=${i+20}`} alt="Founder" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                  <div className="pl-8 text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Trusted by 25k+ Founders</div>
               </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            <div className="aspect-square rounded-[60px] bg-gradient-to-br from-slate-900 to-black p-1">
               <div className="w-full h-full rounded-[58px] overflow-hidden grayscale opacity-40 mix-blend-luminosity">
                   <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop" alt="Office" className="w-full h-full object-cover" />
               </div>
            </div>
            
            {/* Float Cards */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 p-8 bg-slate-900/80 backdrop-blur-xl rounded-[30px] border border-white/10 shadow-2xl hidden sm:block"
            >
               <Award className="h-8 w-8 text-primary mb-4" />
               <div className="text-2xl font-black italic text-slate-100">#1 FinTech</div>
               <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ghana Excellence 2025</div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-10 -left-10 p-8 bg-primary rounded-[30px] shadow-2xl shadow-primary/30 hidden sm:block"
            >
               <div className="text-4xl font-black italic text-white tracking-tighter">99.9%</div>
               <div className="text-[10px] font-black uppercase tracking-widest text-white/70">Service Reliability</div>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 mb-40">
           {stats.map((stat, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.1 }}
               className="p-5 xs:p-8 sm:p-10 rounded-[32px] sm:rounded-[40px] bg-card/45 border border-border/50 text-center group hover:bg-primary/5 hover:border-primary/20 transition-all"
             >
                <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform" />
                <div className="text-2xl xs:text-3xl sm:text-5xl font-black italic tracking-tighter text-foreground mb-2 leading-none">{stat.value}</div>
                <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-tight">{stat.label}</div>
             </motion.div>
           ))}
        </div>

        {/* Vision/Mission */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-40">
           {values.map((val, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.1 }}
               className="p-10 rounded-[50px] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all"
             >
                <div className="h-16 w-16 bg-slate-900 rounded-3xl flex items-center justify-center mb-8 shadow-xl">
                   <val.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-black italic tracking-tighter uppercase text-slate-100 mb-4">{val.title}</h3>
                <p className="text-slate-500 font-bold leading-relaxed">{val.description}</p>
             </motion.div>
           ))}
        </div>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[60px] bg-primary p-12 sm:p-24 overflow-hidden text-center"
        >
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
           <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl sm:text-6xl font-black italic tracking-tighter uppercase text-white leading-none mb-10">
                Ready to upgrade your <span className="underline decoration-white/40 underline-offset-8">business setup?</span>
              </h2>
              <div className="flex flex-wrap justify-center gap-6">
                 <Button asChild variant="secondary" className="h-16 px-10 rounded-2xl font-black uppercase tracking-widest text-[10px] border-none shadow-2xl">
                    <Link to="/login">Get Started</Link>
                 </Button>
                 <Button asChild variant="outline" className="h-16 px-10 rounded-2xl bg-white/10 hover:bg-white/20 border-white/20 text-white font-black uppercase tracking-widest text-[10px] transition-all">
                    <Link to="/contact">Speak to our Team</Link>
                 </Button>
              </div>
           </div>
        </motion.div>

      </div>
    </div>
  );
}
