import React from "react";
import { 
  BarChart3, 
  Smartphone, 
  ShoppingBag, 
  Globe, 
  ShieldCheck, 
  Zap,
  ArrowRight,
  Database,
  Cloud,
  Headphones,
  FileText,
  CreditCard
} from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function ServicesPage() {
  const services = [
    {
       title: "Sales System",
       description: "A fast and easy way to sell in your shop, even without internet. Syncs perfectly with your other devices and mobile money.",
       icon: Smartphone,
       color: "text-emerald-500",
       bg: "bg-emerald-500/10",
       features: ["Works Offline", "Barcode Scanning", "Multi-shop Sync"]
    },
    {
       title: "Stock Management",
       description: "Manage your stock across all your shops and online in one place. Get alerts when you need to restock.",
       icon: Database,
       color: "text-blue-500",
       bg: "bg-blue-500/10",
       features: ["Easy Updates", "Expiry Alerts", "Supplier Info"]
    },
    {
       title: "Online Storefront",
       description: "Launch a professional e-commerce site in minutes. Synchronized automatically with your local shop's inventory.",
       icon: ShoppingBag,
       color: "text-purple-500",
       bg: "bg-purple-500/10",
       features: ["Custom Branding", "Checkout Gateway", "Mobile Responsive"]
    },
    {
       title: "Advanced Analytics",
       description: "Real-time business intelligence dashboards showing revenue trends, customer loyalty, and growth projections.",
       icon: BarChart3,
       color: "text-amber-500",
       bg: "bg-amber-500/10",
       features: ["Profit/Loss Cards", "Tax Generation", "Weekly Summaries"]
    },
    {
       title: "Mobile Money Payments",
       description: "Accept MTN MoMo, Telecel Cash, and AirtelTigo easily and get your money near-instantly.",
       icon: CreditCard,
       color: "text-rose-500",
       bg: "bg-rose-500/10",
       features: ["Quick Payment", "Easy Verification", "Fraud Protection"]
    },
    {
       title: "Safe Cloud Storage",
       description: "Secure and reliable storage that keeps your business data safe and accessible from anywhere, anytime.",
       icon: Cloud,
       color: "text-sky-500",
       bg: "bg-sky-500/10",
       features: ["Bank-grade Security", "Always Online", "Automatic Backups"]
    }
  ];

  return (
    <div className="min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        
        {/* Header */}
        <div className="max-w-3xl mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="h-6 w-1 bg-primary rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Our Services</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-7xl font-black italic tracking-tighter uppercase leading-[0.9] text-slate-100 mb-8"
          >
            Powering your <span className="text-primary italic">Business.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 font-bold text-lg sm:text-xl max-w-xl leading-relaxed"
          >
            We provide the foundation for modern businesses to manage everything in one place.
          </motion.p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
           {services.map((svc, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.1 }}
               className="p-10 rounded-[50px] bg-slate-900/40 border border-white/5 group hover:bg-primary/5 hover:border-primary/20 transition-all relative overflow-hidden"
             >
                <div className={svc.bg + " h-20 w-20 rounded-3xl flex items-center justify-center mb-10 shadow-lg"}>
                   <svc.icon className={svc.color + " h-8 w-8 group-hover:scale-110 transition-transform"} />
                </div>
                <h3 className="text-2xl font-black italic tracking-tighter uppercase text-slate-100 mb-6">{svc.title}</h3>
                <p className="text-slate-500 font-bold mb-10 leading-relaxed text-sm">{svc.description}</p>
                
                <ul className="space-y-4 mb-10">
                   {svc.features.map((feat, fi) => (
                     <li key={fi} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <Zap className="h-3 w-3 text-primary" /> {feat}
                     </li>
                   ))}
                </ul>

                <Button variant="ghost" className="p-0 hover:bg-transparent text-primary font-black uppercase tracking-widest text-[10px] gap-2 group/btn" asChild>
                   <Link to="/features">
                     Learn More <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-2 transition-transform" />
                   </Link>
                </Button>
             </motion.div>
           ))}
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32 bg-slate-900/60 rounded-[60px] p-12 sm:p-20 border border-white/5">
           <div>
              <h2 className="text-4xl sm:text-5xl font-black italic tracking-tighter uppercase text-slate-100 mb-8 leading-tight">
                Enterprise support <br/> <span className="text-primary italic">for any scale.</span>
              </h2>
              <div className="space-y-8">
                 <div className="flex gap-6">
                    <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                       <ShieldCheck className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-200 mb-2 italic">Safe & Secure</h4>
                        <p className="text-sm text-slate-500 font-bold">Your data is secured using the latest encryption standards and kept safe at all times.</p>
                    </div>
                 </div>
                 <div className="flex gap-6">
                    <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                       <Headphones className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-200 mb-2 italic">Personal Support</h4>
                        <p className="text-sm text-slate-500 font-bold">Get 24/7 help from our professional support teams who understand your business.</p>
                    </div>
                 </div>
                 <div className="flex gap-6">
                    <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                       <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-200 mb-2 italic">Automated Compliance</h4>
                        <p className="text-sm text-slate-500 font-bold">Generate GRA-compliant tax reports and business certificates automatically.</p>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="relative">
              <div className="aspect-video rounded-[40px] overflow-hidden grayscale border border-white/5 opacity-50">
                 <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop" alt="Support" className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
              
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                className="absolute -bottom-10 -right-10 p-10 bg-slate-900 border border-white/10 rounded-[40px] shadow-2xl"
              >
                 <div className="text-6xl font-black italic text-primary tracking-tighter mb-2 leading-none">24/7</div>
                 <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Guaranteed Service</div>
              </motion.div>
           </div>
        </div>

        {/* Final CTA */}
        <div className="text-center max-w-2xl mx-auto">
           <h3 className="text-3xl font-black italic tracking-tighter uppercase text-slate-100 mb-10">
              Stop managing manually. <br/> <span className="text-primary italic">Start operating intelligently.</span>
           </h3>
           <div className="flex flex-wrap justify-center gap-4">
              <Button asChild className="h-16 px-10 rounded-2xl bg-primary hover:bg-primary/90 font-black uppercase tracking-widest text-[10px] border-none shadow-xl shadow-primary/20">
                 <Link to="/login">Get Started</Link>
              </Button>
              <Button asChild variant="outline" className="h-16 px-10 rounded-2xl bg-white/5 hover:bg-white/10 border-white/10 text-white font-black uppercase tracking-widest text-[10px] transition-all">
                 <Link to="/contact">Request Custom Demo</Link>
              </Button>
           </div>
        </div>

      </div>
    </div>
  );
}
