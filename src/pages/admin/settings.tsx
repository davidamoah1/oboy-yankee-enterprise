import { useState } from "react";
import { 
  Settings, 
  Shield, 
  Globe, 
  Zap, 
  Bell, 
  Key, 
  Database, 
  Cloud,
  Save,
  RefreshCcw,
  ShieldCheck,
  Lock,
  Smartphone,
  Mail,
  Component,
  Cpu,
  Server
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("System settings updated successfully");
    }, 1500);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 bg-slate-900/40 backdrop-blur-xl p-10 rounded-[40px] border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Settings className="h-32 w-32 rotate-12 text-slate-100" />
        </div>
        <div className="space-y-3 relative z-10">
           <div className="flex items-center gap-3 mb-2">
              <div className="h-6 w-1 bg-white/20 rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">General Settings</span>
           </div>
           <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none text-slate-100">System Control</h1>
           <p className="text-slate-500 font-bold text-sm max-w-lg">Configure platform-wide security, performance, and connection settings for all shops.</p>
        </div>
        <div className="relative z-10 w-full lg:w-auto flex flex-col sm:flex-row gap-4">
               <div className="flex gap-4 w-full lg:w-auto flex flex-col sm:flex-row gap-4">
                  <Button variant="outline" className="w-full sm:w-auto h-14 px-8 rounded-2xl border-white/10 font-black uppercase tracking-widest text-[10px] gap-3 bg-white/5 hover:bg-white/10 transition-all text-slate-300">
                     <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} /> Restore Backup
                  </Button>
            <Button 
               onClick={handleSave}
               disabled={loading}
               className="w-full sm:w-auto h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all text-white border-none"
            >
               <Save className="h-4 w-4" /> {loading ? "Updating..." : "Save Changes"}
            </Button>
        </div>
      </div>
    </div>

      <Tabs defaultValue="platform" className="space-y-8">
         <TabsList className="bg-slate-900/40 backdrop-blur-xl p-2 h-16 rounded-[24px] border border-white/5 gap-2">
            {[
               { id: "platform", label: "Performance", icon: Server },
               { id: "security", label: "Security Settings", icon: ShieldCheck },
               { id: "integrations", label: "External Services", icon: Zap },
               { id: "identity", label: "User Access", icon: Lock },
            ].map((tab) => (
               <TabsTrigger 
                  key={tab.id}
                  value={tab.id} 
                  className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 h-full rounded-2xl px-8 font-black uppercase tracking-widest text-[10px] gap-3 transition-all border border-transparent data-[state=active]:border-white/10"
               >
                  <tab.icon className="h-4 w-4" /> {tab.label}
               </TabsTrigger>
            ))}
         </TabsList>

         <TabsContent value="platform" className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <Card className="border-none shadow-2xl bg-slate-900/40 backdrop-blur-xl rounded-[40px] border border-white/5 overflow-hidden">
                  <CardHeader className="p-8 border-b border-white/5">
                     <CardTitle className="text-xl font-black italic tracking-tighter uppercase text-slate-100 flex items-center gap-3">
                        <Cpu className="h-5 w-5 text-primary" /> Server Performance
                     </CardTitle>
                     <CardDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Manage how the system handles high traffic</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                     {[
                        { label: "Automatic Scaling", desc: "Always keep extra server capacity ready for high traffic.", icon: Globe },
                        { label: "Speed Optimization", desc: "Makes the app load faster across different regions.", icon: Zap },
                        { label: "Data Consistency", desc: "Ensures all records are updated instantly across the system.", icon: Database },
                     ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between group">
                           <div className="space-y-1">
                              <Label className="text-[11px] font-black uppercase tracking-widest text-slate-200 group-hover:text-primary transition-colors italic">{item.label}</Label>
                              <p className="text-[10px] font-bold text-slate-500">{item.desc}</p>
                           </div>
                           <Switch defaultChecked />
                        </div>
                     ))}
                  </CardContent>
               </Card>

               <Card className="border-none shadow-2xl bg-slate-900/40 backdrop-blur-xl rounded-[40px] border border-white/5 overflow-hidden">
                  <CardHeader className="p-8 border-b border-white/5">
                     <CardTitle className="text-xl font-black italic tracking-tighter uppercase text-slate-100 flex items-center gap-3">
                        <Component className="h-5 w-5 text-primary" /> API Configuration
                     </CardTitle>
                     <CardDescription className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Manage system connection points</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1 italic">System Access Key (View Only)</Label>
                        <div className="flex gap-4">
                           <Input 
                              value="sk_platform_live_92384hsj2384jsa843" 
                              readOnly 
                              className="h-12 bg-black/40 border-white/5 text-slate-200 font-mono text-xs italic tracking-widest rounded-xl focus-visible:ring-0" 
                           />
                           <Button variant="outline" className="h-12 px-6 rounded-xl border-white/10 font-bold text-[10px] uppercase tracking-widest bg-white/5 hover:bg-white/10 transition-all text-primary border-none">
                              Rotate
                           </Button>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1 italic">Maximum Requests Per User (Per Minute)</Label>
                        <Input 
                           defaultValue="5000" 
                           className="h-12 bg-black/40 border-white/5 text-slate-200 font-black italic tracking-widest rounded-xl focus-visible:ring-primary/20" 
                        />
                     </div>
                  </CardContent>
               </Card>
            </div>
         </TabsContent>

         <TabsContent value="security" className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500 outline-none">
            <Card className="border-none shadow-2xl bg-slate-900/40 backdrop-blur-xl rounded-[40px] border border-white/5 overflow-hidden">
               <CardHeader className="p-10 border-b border-white/5 bg-red-500/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                     <ShieldCheck className="h-24 w-24 text-red-500" />
                  </div>
                  <CardTitle className="text-2xl font-black italic tracking-tighter uppercase text-slate-100 flex items-center gap-4">
                     <Lock className="h-6 w-6 text-red-500" /> Security Controls
                  </CardTitle>
                  <CardDescription className="text-red-500/60 font-black uppercase text-[10px] tracking-widest">Manage login security and user permissions</CardDescription>
               </CardHeader>
               <CardContent className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                     <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <Label className="text-[12px] font-black uppercase tracking-widest text-slate-200 italic">Mandatory Two-Step Login</Label>
                           <Switch defaultChecked />
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-tighter">Requires a second verification step (like a code on your phone) for all admin accounts.</p>
                     </div>
                     <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <Label className="text-[12px] font-black uppercase tracking-widest text-slate-200 italic">IP-Whitelisting (Strict-Mode)</Label>
                           <Switch />
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-tighter">Only allow logins from specific approved internet addresses.</p>
                     </div>
                  </div>
                  <div className="space-y-8">
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">Session Persistence (Minutes)</Label>
                        <Input 
                           defaultValue="60" 
                           className="h-12 bg-black/40 border-white/5 text-slate-200 font-black italic tracking-widest rounded-xl focus-visible:ring-red-600/20" 
                        />
                     </div>
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">Failed Auth Threshold (Instant Lockout)</Label>
                        <Input 
                           defaultValue="3" 
                           className="h-12 bg-black/40 border-white/5 text-slate-200 font-black italic tracking-widest rounded-xl focus-visible:ring-red-600/20" 
                        />
                     </div>
                  </div>
               </CardContent>
            </Card>
         </TabsContent>

         <TabsContent value="integrations" className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {[
                  { name: "MTN Mobile Money", type: "Payment System", icon: Smartphone, status: "Connected", latency: "120ms" },
                  { name: "Telecel Cash", type: "Payment System", icon: Smartphone, status: "Connected", latency: "150ms" },
                  { name: "Global SMS Gateway", type: "Messaging System", icon: Mail, status: "Syncing", latency: "240ms" },
               ].map((item, i) => (
                  <Card key={i} className="border-none shadow-2xl bg-slate-900/40 backdrop-blur-xl rounded-[30px] border border-white/5 group hover:border-primary/40 transition-all overflow-hidden relative">
                     <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <item.icon className="h-12 w-12" />
                     </div>
                     <CardHeader className="pb-6">
                        <div className="flex items-center gap-2 mb-2">
                           <div className="h-2 w-2 rounded-full bg-emerald-500" />
                           <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.status}</CardDescription>
                        </div>
                        <CardTitle className="text-xl font-black italic tracking-tighter uppercase text-slate-100">{item.name}</CardTitle>
                        <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">{item.type}</p>
                     </CardHeader>
                     <CardContent className="pt-0">
                        <div className="flex justify-between items-center bg-black/20 p-4 rounded-[20px] border border-white/5">
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Connection Speed</span>
                           <span className="text-[10px] font-mono font-black text-primary italic">{item.latency}</span>
                        </div>
                     </CardContent>
                  </Card>
               ))}
            </div>
         </TabsContent>
      </Tabs>
    </div>
  );
}
