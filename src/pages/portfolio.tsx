import React, { useState } from "react";
import { 
  Heart, 
  ExternalLink, 
  ArrowRight, 
  ShoppingBag,
  Zap,
  Tag,
  Search,
  CheckCircle2,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Wedding", "Fashion", "Event", "Portrait", "Graduation", "Retail", "Services"];

const PORTFOLIO_ITEMS = [
  {
    id: 1,
    title: "Ethereal Weddings GH",
    category: "Wedding",
    description: "Premium wedding planner utilizing Nexus for vendor management and budgeting.",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop",
    metric: "40% budget efficiency",
  },
  {
    id: 2,
    title: "Vogue Accra",
    category: "Fashion",
    description: "Leading fashion house using Nexus for stock management and online storefront.",
    image: "https://images.unsplash.com/photo-1539109132304-36940026e952?q=80&w=2070&auto=format&fit=crop",
    metric: "15k+ daily users",
  },
  {
    id: 3,
    title: "The Great Event Hub",
    category: "Event",
    description: "Multi-venue event center managing bookings and ticketing via Nexus POS points.",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070&auto=format&fit=crop",
    metric: "500+ events/year",
  },
  {
    id: 4,
    title: "Elite Portraits Kumasi",
    category: "Portrait",
    description: "Photography studio management with automated appointment leads.",
    image: "https://images.unsplash.com/photo-1554080353-a576cf803bda?q=80&w=1887&auto=format&fit=crop",
    metric: "3k+ sessions logged",
  },
  {
    id: 5,
    title: "Graduation Master",
    category: "Graduation",
    description: "Bulk regalia rentals and photography booking platform for universities.",
    image: "https://images.unsplash.com/photo-1523050853063-bd388f9f79b5?q=80&w=2070&auto=format&fit=crop",
    metric: "99% rental return",
  },
  {
    id: 6,
    title: "Supreme Retail Group",
    category: "Retail",
    description: "The largest convenience store chain in Ghana runs entirely on Nexus POS.",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop",
    metric: "12 shops connected",
  }
];

export default function PortfolioPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<typeof PORTFOLIO_ITEMS[0] | null>(null);

  const filteredItems = PORTFOLIO_ITEMS.filter(item => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="h-6 w-1 bg-primary rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Merchant Stories</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl sm:text-7xl font-black italic tracking-tighter uppercase leading-[0.9] text-slate-100 mb-8"
            >
              Merchants in <span className="text-primary italic">Action.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-500 font-bold text-lg leading-relaxed"
            >
              Explore how businesses across West Africa are leveraging Nexus to achieve operational excellence.
            </motion.p>
          </div>

          <div className="shrink-0">
             <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                <Input 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Search shops..." 
                   className="h-16 w-full md:w-80 pl-14 pr-6 bg-slate-900/40 border-white/5 rounded-2xl italic font-bold text-slate-300 focus-visible:ring-primary/20"
                />
             </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-16">
           {CATEGORIES.map(cat => (
             <button
               key={cat}
               onClick={() => setActiveCategory(cat)}
               className={cn(
                 "h-12 px-8 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all border",
                 activeCategory === cat 
                   ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                   : "bg-white/5 border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300"
               )}
             >
               {cat}
             </button>
           ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           <AnimatePresence mode="popLayout">
             {filteredItems.map((item, i) => (
               <motion.div 
                 key={item.id}
                 layout
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.9 }}
                 transition={{ delay: i * 0.05 }}
                 onClick={() => setSelectedItem(item)}
                 className="group cursor-pointer"
               >
                  <div className="relative aspect-[4/5] rounded-[40px] overflow-hidden mb-8 border border-white/5">
                     <img 
                       src={item.image} 
                       alt={item.title} 
                       className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-40 transition-opacity" />
                     
                     <div className="absolute top-6 left-6">
                        <Badge className="bg-white/10 backdrop-blur-md border-white/10 text-[10px] uppercase font-black tracking-widest px-4 py-2">
                           {item.category}
                        </Badge>
                     </div>

                     <div className="absolute bottom-10 left-10 right-10">
                        <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 italic flex items-center gap-2">
                           <Zap className="h-4 w-4 fill-primary" /> {item.metric}
                        </div>
                        <h3 className="text-3xl font-black italic tracking-tighter uppercase text-white leading-none">{item.title}</h3>
                     </div>
                  </div>
               </motion.div>
             ))}
           </AnimatePresence>
        </div>

        {/* Modal/Preview Overlay */}
        <AnimatePresence>
           {selectedItem && (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10 pointer-events-none"
             >
                <div 
                  className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl pointer-events-auto" 
                  onClick={() => setSelectedItem(null)}
                />
                
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="w-full max-w-5xl bg-slate-900 border border-white/10 rounded-[60px] overflow-hidden shadow-2xl relative z-10 pointer-events-auto"
                >
                   <button 
                     onClick={() => setSelectedItem(null)}
                     className="absolute top-10 right-10 h-14 w-14 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white transition-all z-20"
                   >
                      <X className="h-6 w-6" />
                   </button>

                   <div className="grid grid-cols-1 lg:grid-cols-2">
                      <div className="aspect-square lg:aspect-auto h-full overflow-hidden grayscale">
                         <img src={selectedItem.image} alt={selectedItem.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-12 sm:p-20 flex flex-col justify-center">
                         <div className="flex items-center gap-4 mb-8">
                            <Badge className="bg-primary/20 text-primary border-primary/20 px-4 py-2 text-[10px] font-black uppercase">
                               {selectedItem.category} Shop
                            </Badge>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">ID: NXS-00{selectedItem.id}</span>
                         </div>
                         
                         <h2 className="text-5xl sm:text-6xl font-black italic tracking-tighter uppercase text-slate-100 mb-8 leading-none">
                            {selectedItem.title}
                         </h2>
                         
                         <p className="text-slate-500 font-bold text-lg leading-relaxed mb-12">
                            {selectedItem.description}
                         </p>

                         <div className="grid grid-cols-2 gap-8 mb-12">
                            <div className="p-8 rounded-[30px] bg-white/[0.03] border border-white/5">
                               <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">Performance metric</div>
                               <div className="text-2xl font-black italic text-primary tracking-tight uppercase">{selectedItem.metric}</div>
                            </div>
                            <div className="p-8 rounded-[30px] bg-white/[0.03] border border-white/5">
                               <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">Status</div>
                               <div className="text-2xl font-black italic text-emerald-500 tracking-tight uppercase flex items-center gap-2">
                                  Active <CheckCircle2 className="h-5 w-5" />
                               </div>
                            </div>
                         </div>

                         <div className="flex flex-wrap gap-4 mt-auto">
                            <Button className="h-16 px-10 rounded-2xl bg-primary hover:bg-primary/90 font-black uppercase tracking-widest text-[10px] border-none shadow-xl">
                               Visit Shop <ExternalLink className="ml-2 h-4 w-4" />
                            </Button>
                            <Button variant="ghost" className="h-16 px-8 rounded-2xl hover:bg-white/5 text-slate-500 font-black uppercase tracking-widest text-[10px] transition-all">
                               Read Case Study
                            </Button>
                         </div>
                      </div>
                   </div>
                </motion.div>
             </motion.div>
           )}
        </AnimatePresence>

        {/* Simple CTA */}
        <div className="mt-40 text-center border-t border-white/5 pt-32">
           <div className="max-w-2xl mx-auto">
              <h2 className="text-4xl font-black italic tracking-tighter uppercase text-slate-100 mb-10 leading-none">
                Get your business featured in the <span className="text-primary italic">Nexus Registry.</span>
              </h2>
              <Button asChild className="h-16 px-10 rounded-2xl bg-primary hover:bg-primary/90 font-black uppercase tracking-widest text-[10px] border-none shadow-xl">
                 <Link to="/contact">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
           </div>
        </div>

      </div>
    </div>
  );
}
