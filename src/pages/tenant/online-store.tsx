import React from "react";
import { 
  ShoppingBag, 
  ExternalLink, 
  Settings, 
  Layout, 
  Palette, 
  Globe, 
  Zap, 
  Search, 
  ArrowRight,
  Eye,
  MousePointer2,
  TrendingUp,
  CreditCard,
  Truck
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function OnlineStorePage() {
  return (
    <div className="p-6 sm:p-10 space-y-10 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <div className="h-5 w-1 bg-purple-500 rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground italic text-purple-500/80">E-Commerce Hub</span>
           </div>
           <h1 className="text-4xl font-black italic tracking-tighter uppercase text-foreground leading-none">
             My Online <span className="text-purple-500 italic">Shop</span>
           </h1>
        </div>
        <div className="flex gap-4">
           <Button 
             variant="outline" 
             onClick={() => toast.info("Opening store preview...")}
             className="h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 border-purple-500/20 text-purple-500 hover:bg-purple-500/5"
           >
              <Eye className="h-4 w-4" /> Preview Store
           </Button>
           <Button 
             onClick={() => toast.success("Online store coming soon!")}
             className="h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-purple-500/20 bg-purple-500 hover:bg-purple-600 border-none text-white"
           >
              <ExternalLink className="h-4 w-4" /> View Live Domain
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         
         {/* Left Column - Store Status & Config */}
         <div className="lg:col-span-8 space-y-10">
            
            {/* Store Health */}
            <Card className="border-none bg-slate-900 shadow-2xl rounded-[50px] overflow-hidden p-1">
               <div className="bg-background/40 backdrop-blur-xl h-full w-full rounded-[48px] p-12 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                     <Globe className="h-48 w-48 rotate-12" />
                  </div>
                  <div className="flex justify-between items-start mb-12">
                     <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-purple-500 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-purple-500/20">
                           <ShoppingBag className="h-8 w-8" />
                        </div>
                        <div>
                           <div className="font-black italic text-3xl tracking-tighter uppercase leading-none mb-2">Shop ID #182</div>
                           <div className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-500">your-store.oboyyankee.com</div>
                        </div>
                     </div>
                     <Badge className="bg-emerald-500 text-black border-none uppercase text-[9px] px-4 font-black tracking-widest py-1.5 rounded-full">Synchronized</Badge>
                  </div>

                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                     <div className="p-8 rounded-[35px] bg-white/[0.03] border border-white/5">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">Visitors Today</div>
                        <div className="text-4xl font-black italic text-slate-100 tracking-tighter leading-none mb-4">4,281</div>
                        <div className="text-[10px] font-bold text-emerald-500">+12% vs yesterday</div>
                     </div>
                     <div className="p-8 rounded-[35px] bg-white/[0.03] border border-white/5">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">Sales Success Rate</div>
                        <div className="text-4xl font-black italic text-slate-100 tracking-tighter leading-none mb-4">3.4%</div>
                        <div className="text-[10px] font-bold text-slate-500">Benchmark: 2.1%</div>
                     </div>
                     <div className="p-8 rounded-[35px] bg-white/[0.03] border border-white/5">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">Unfinished Orders</div>
                        <div className="text-4xl font-black italic text-slate-100 tracking-tighter leading-none mb-4">12%</div>
                        <div className="text-[10px] font-bold text-rose-500">+2% check alerts</div>
                     </div>
                  </div>
               </div>
            </Card>

            {/* Config Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <Card className="bg-card/40 border-white/5 rounded-[40px] p-10 hover:bg-white/[0.04] transition-all group">
                  <div className="flex items-center gap-10">
                     <div className="h-16 w-16 bg-muted rounded-2xl flex items-center justify-center text-slate-500 group-hover:scale-110 transition-transform">
                        <Layout className="h-7 w-7" />
                     </div>
                     <div>
                        <h3 className="text-xl font-black italic tracking-tighter uppercase text-foreground mb-1">Store Layout</h3>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Choose how your store looks</p>
                     </div>
                  </div>
                  <div className="mt-10 pt-10 border-t border-white/5 flex justify-between items-center">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Bento Mosaic v2.4</span>
                     <Button variant="ghost" className="h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[9px] gap-2 hover:bg-white/5">Configure <ArrowRight className="h-3 w-3" /></Button>
                  </div>
               </Card>

               <Card className="bg-card/40 border-white/5 rounded-[40px] p-10 hover:bg-white/[0.04] transition-all group">
                  <div className="flex items-center gap-10">
                     <div className="h-16 w-16 bg-muted rounded-2xl flex items-center justify-center text-slate-500 group-hover:scale-110 transition-transform">
                        <Palette className="h-7 w-7" />
                     </div>
                     <div>
                        <h3 className="text-xl font-black italic tracking-tighter uppercase text-foreground mb-1">Store Design</h3>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Add your colors and logo</p>
                     </div>
                  </div>
                  <div className="mt-10 pt-10 border-t border-white/5 flex justify-between items-center">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Neon Matrix Theme</span>
                     <Button variant="ghost" className="h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[9px] gap-2 hover:bg-white/5">Customize <ArrowRight className="h-3 w-3" /></Button>
                  </div>
               </Card>
            </div>

         </div>

         {/* Right Column - Status Toggles */}
         <div className="lg:col-span-4 space-y-8">
            <Card className="bg-card/40 border-white/5 rounded-[40px] p-10">
               <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-10">Store Settings</h3>
               <div className="space-y-10">
                  <div className="flex items-center justify-between">
                     <div className="space-y-1">
                        <Label className="text-sm font-black italic uppercase tracking-tight text-foreground">Public visibility</Label>
                        <p className="text-[10px] font-bold text-muted-foreground tracking-widest">Online storefront status</p>
                     </div>
                     <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                     <div className="space-y-1">
                        <Label className="text-sm font-black italic uppercase tracking-tight text-foreground">Enable Checkout</Label>
                        <p className="text-[10px] font-bold text-muted-foreground tracking-widest">Allow customers to buy</p>
                     </div>
                     <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                     <div className="space-y-1">
                        <Label className="text-sm font-black italic uppercase tracking-tight text-foreground">Inventory sync</Label>
                        <p className="text-[10px] font-bold text-muted-foreground tracking-widest">Auto-update from POS</p>
                     </div>
                     <Switch defaultChecked />
                  </div>
               </div>
            </Card>

            <Card className="bg-purple-500 border-none rounded-[40px] p-10 shadow-2xl shadow-purple-500/20 text-white group overflow-hidden relative">
               <div className="absolute -bottom-10 -right-10 opacity-10 blur-2xl group-hover:scale-150 transition-transform">
                  <Zap className="h-48 w-48 text-white fill-white" />
               </div>
               <div className="relative z-10">
                  <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center mb-10 backdrop-blur-md">
                     <MousePointer2 className="h-5 w-5 fill-white" />
                  </div>
                  <h3 className="text-2xl font-black italic tracking-tighter uppercase leading-none mb-6">Sales <br/> Booster</h3>
                  <p className="text-xs font-bold text-white/70 leading-relaxed mb-10 uppercase tracking-widest">Our smart helper checks your store traffic to suggest the best discounts for your customers.</p>
                  <Button 
                    onClick={() => {
                       toast.loading("Activating Sales Booster...");
                       setTimeout(() => toast.success("Smart sales helper is now active"), 2000);
                    }}
                    className="w-full h-14 rounded-2xl bg-white text-purple-600 font-black uppercase tracking-widest text-[9px] hover:bg-white/90 transition-all border-none"
                  >
                     Turn on Smart Sales
                  </Button>
               </div>
            </Card>

            <div className="grid grid-cols-3 gap-4">
               {[
                  { icon: TrendingUp, label: "SEO Settings" },
                  { icon: CreditCard, label: "Payments" },
                  { icon: Truck, label: "Shipping" }
               ].map((mod, i) => (
                  <div key={i} className="aspect-square rounded-3xl bg-card/40 border border-white/5 flex flex-col items-center justify-center p-4 hover:bg-primary/[0.03] hover:border-primary/20 transition-all cursor-pointer group">
                     <mod.icon className="h-5 w-5 text-slate-600 group-hover:text-primary transition-colors mb-4" />
                     <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-200 transition-colors text-center">{mod.label}</span>
                  </div>
               ))}
            </div>
         </div>

      </div>

    </div>
  );
}
