import { useState, useEffect } from "react";
import { 
  User, 
  Store, 
  Shield, 
  CreditCard, 
  Save, 
  Upload, 
  Moon, 
  Sun,
  Globe,
  Smartphone,
  Lock,
  LogOut,
  MapPin,
  Fingerprint,
  Cpu,
  Key,
  Zap,
  Loader2,
  Bell,
  Mail,
  MessageSquare,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useTheme } from "@/components/theme-provider";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { apiClient } from "@/lib/api-client";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { signOut, user, company, refreshProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [shopName, setShopName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  
  // Notification states
  const [subExpiryNotify, setSubExpiryNotify] = useState(true);
  const [invoiceNotify, setInvoiceNotify] = useState(true);
  const [salesNotify, setSalesNotify] = useState(false);

  // SMS states
  const [smsReceiptsEnabled, setSmsReceiptsEnabled] = useState(true);
  const [smsDailySummaryEnabled, setSmsDailySummaryEnabled] = useState(true);
  const [smsTestPhone, setSmsTestPhone] = useState("");
  const [smsSending, setSmsSending] = useState(false);
  const [smsSaving, setSmsSaving] = useState(false);

  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    // Fetch SMS settings
    apiClient.get('/api/sms/settings').then(res => {
      const data = res.data?.data || res.data;
      if (data) {
        setSmsReceiptsEnabled(data.smsReceiptsEnabled !== false);
        setSmsDailySummaryEnabled(data.smsDailySummaryEnabled !== false);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (company) {
      setShopName(company.name || "");
      setAddress(company.address || "");
      setPhone(company.phone || "");
    }
    if (user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
    }
  }, [company, user]);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // 1. Update Company
      await apiClient.put('/api/company', {
        name: shopName,
        phone,
        address,
        notifications: {
          subscription_expiry: subExpiryNotify,
          invoice_generated: invoiceNotify,
          daily_sales_report: salesNotify
        }
      });

      // 2. Update Profile
      await apiClient.put('/api/auth/profile', {
        full_name: fullName
      });

      await refreshProfile();
      toast.success("Global parameters successfully synchronized");
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || "Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setChangingPassword(true);
    try {
      await apiClient.put('/api/auth/password', { currentPassword, newPassword });
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to change password.");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 bg-card/40 backdrop-blur-xl p-10 rounded-[40px] border border-border/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Cpu className="h-32 w-32 rotate-12" />
        </div>
        <div className="space-y-3 relative z-10">
           <div className="flex items-center gap-3 mb-2">
              <div className="h-6 w-1 bg-primary rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Business Settings</span>
           </div>
           <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Shop Settings</h1>
           <p className="text-muted-foreground font-bold text-sm max-w-lg">Manage your shop information, owner profile, and security settings.</p>
        </div>
        <div className="relative z-10 w-full lg:w-auto">
          <Button onClick={handleSave} disabled={isSaving} className="w-full lg:w-auto h-16 px-10 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-4 shadow-2xl shadow-primary/30 bg-primary border-none hover:translate-y-[-4px] transition-all duration-300">
            <Save className="h-5 w-5" /> {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="shop" className="w-full">
        <div className="flex items-center justify-center lg:justify-start">
           <TabsList className="bg-muted/40 p-2 rounded-[24px] h-20 border border-border/50 backdrop-blur-xl mb-10 w-full lg:w-auto">
             <TabsTrigger value="shop" className="px-10 h-full rounded-[18px] font-black uppercase text-[10px] tracking-[0.2em] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-2xl data-[state=active]:shadow-primary/40 transition-all duration-300">
               Shop Profile
             </TabsTrigger>
             <TabsTrigger value="user" className="px-10 h-full rounded-[18px] font-black uppercase text-[10px] tracking-[0.2em] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-2xl data-[state=active]:shadow-primary/40 transition-all duration-300">
               Owner Profile
             </TabsTrigger>
             <TabsTrigger value="billing" className="px-10 h-full rounded-[18px] font-black uppercase text-[10px] tracking-[0.2em] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-2xl data-[state=active]:shadow-primary/40 transition-all duration-300">
               Subscription
             </TabsTrigger>
             <TabsTrigger value="security" className="px-10 h-full rounded-[18px] font-black uppercase text-[10px] tracking-[0.2em] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-2xl data-[state=active]:shadow-primary/40 transition-all duration-300">
               Security
             </TabsTrigger>
             <TabsTrigger value="sms" className="px-10 h-full rounded-[18px] font-black uppercase text-[10px] tracking-[0.2em] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-2xl data-[state=active]:shadow-primary/40 transition-all duration-300">
               SMS
             </TabsTrigger>
           </TabsList>
        </div>

        <TabsContent value="shop" className="mt-0 space-y-8 focus-visible:ring-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <Card className="border-none shadow-2xl shadow-black/[0.02] bg-card/60 backdrop-blur-xl rounded-[40px] p-10 overflow-hidden">
                <CardHeader className="p-0 mb-10">
                   <div className="flex items-center gap-4 mb-2">
                      <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                         <Store className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-2xl font-black uppercase italic tracking-tighter">Shop Details</CardTitle>
                   </div>
                   <CardDescription className="text-sm font-bold text-muted-foreground italic">Set the name and address that will appear on your receipts.</CardDescription>
                </CardHeader>
                <CardContent className="p-0 space-y-8">
                   <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Registered Shop Name</Label>
                      <Input value={shopName} onChange={e => setShopName(e.target.value)} className="h-14 bg-muted/40 border-none rounded-2xl px-6 font-black text-lg group-hover:bg-muted/60 transition-all" />
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                         <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Business Type</Label>
                         <Input defaultValue="Retail & Grocery" disabled className="h-14 bg-muted/20 border-border/10 rounded-2xl px-6 font-black italic opacity-50" />
                      </div>
                      <div className="space-y-3">
                         <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Phone Number</Label>
                         <Input value={phone} onChange={e => setPhone(e.target.value)} className="h-14 bg-muted/40 border-none rounded-2xl px-6 font-black" />
                      </div>
                   </div>
                   <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Shop Address</Label>
                      <div className="relative">
                         <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                         <Input value={address} onChange={e => setAddress(e.target.value)} className="pl-16 h-14 bg-muted/40 border-none rounded-2xl px-6 font-black italic" />
                      </div>
                   </div>
                </CardContent>
             </Card>

             <Card className="border-none shadow-2xl shadow-black/[0.02] bg-card/60 backdrop-blur-xl rounded-[40px] p-10 overflow-hidden relative">
                <div className="absolute bottom-0 right-0 p-10 opacity-[0.03]">
                   <Globe className="h-40 w-40" />
                </div>
                <CardHeader className="p-0 mb-10">
                   <div className="flex items-center gap-4 mb-2">
                       <div className="h-10 w-10 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                          <Zap className="h-5 w-5" />
                       </div>
                       <CardTitle className="text-2xl font-black uppercase italic tracking-tighter">Logo & Branding</CardTitle>
                   </div>
                   <CardDescription className="text-sm font-bold text-muted-foreground italic">Upload your logo and set up payment options.</CardDescription>
                </CardHeader>
                <CardContent className="p-0 space-y-10 relative z-10">
                   <div className="flex items-center gap-10 bg-muted/20 p-8 rounded-[32px] border border-white/5 group hover:bg-muted/30 transition-all">
                      <div className="h-24 w-24 rounded-3xl bg-card border-2 border-dashed border-white/10 flex items-center justify-center group-hover:border-primary transition-all overflow-hidden shadow-2xl">
                         <img src="https://api.dicebear.com/7.x/initials/svg?seed=AccraMart" alt="Logo" className="h-full w-full object-cover p-3" />
                      </div>
                      <div className="flex-1 space-y-3">
                         <h4 className="font-black italic text-lg uppercase leading-none tracking-tighter">Shop Logo</h4>
                         <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-loose">Verified 512 Vector. Support: CJS/SVG/PNG.</p>
                         <Button variant="outline" size="sm" className="h-12 rounded-xl font-black uppercase tracking-widest text-[10px] gap-3 border-2 hover:bg-card">
                            <Upload className="h-4 w-4" /> Change Logo
                         </Button>
                      </div>
                   </div>
                   
                   <div className="space-y-6 pt-6 border-t border-white/5">
                      <div className="flex items-center justify-between group">
                         <div className="space-y-1">
                            <Label className="text-xs font-black uppercase tracking-[0.2em] italic">QR Code on Receipts</Label>
                            <p className="text-[10px] text-muted-foreground font-bold leading-none">Allow customers to scan receipts to verify purchases.</p>
                         </div>
                         <Switch defaultChecked className="data-[state=checked]:bg-primary" />
                      </div>
                      <div className="flex items-center justify-between group">
                         <div className="space-y-1">
                            <Label className="text-xs font-black uppercase tracking-[0.2em] italic">Accept Mobile Money</Label>
                            <p className="text-[10px] text-muted-foreground font-bold leading-none">Enable MTN/Vodafone/AirtelTigo MoMo payments.</p>
                         </div>
                         <Switch defaultChecked className="data-[state=checked]:bg-primary" />
                      </div>
                   </div>
                </CardContent>
             </Card>
          </div>
        </TabsContent>

        <TabsContent value="user" className="mt-0">
           <Card className="max-w-3xl border-none shadow-2xl shadow-black/[0.02] bg-card/60 backdrop-blur-xl rounded-[40px] mx-auto p-12 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-primary via-purple-500 to-primary/20" />
              <CardHeader className="text-center pb-12 p-0">
                 <div className="mx-auto h-32 w-32 rounded-full p-1.5 bg-gradient-to-br from-primary to-purple-600 shadow-2xl mb-8 relative">
                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
                    <div className="h-full w-full rounded-full bg-card border-4 border-card flex items-center justify-center text-white font-black text-3xl italic relative z-10">
                       KM
                    </div>
                 </div>
                 <CardTitle className="text-4xl font-black italic tracking-tighter uppercase mb-2">Kofi Mensah</CardTitle>
                 <CardDescription className="text-xs font-black uppercase tracking-[0.4em] text-primary italic">Shop Owner</CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-10">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Full Name</Label>
                       <Input value={fullName} onChange={e => setFullName(e.target.value)} className="h-14 bg-muted/40 border-none rounded-2xl px-6 font-black text-lg" />
                    </div>
                    <div className="space-y-3">
                       <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Email Address</Label>
                       <Input value={email} disabled className="h-14 bg-muted/20 border-none rounded-2xl px-6 font-black opacity-50 cursor-not-allowed" />
                    </div>
                 </div>
                 
                 <div className="pt-10 border-t border-white/5 space-y-6">
                    <div className="flex items-center gap-3">
                       <div className="h-2 w-2 rounded-full bg-primary" />
                       <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Display Settings</h4>
                    </div>
                    <div className="flex items-center justify-between p-8 rounded-[32px] bg-muted/20 border-2 border-border gap-6 hover:bg-muted/30 transition-all cursor-pointer">
                       <div className="flex items-center gap-6">
                          <div className="h-16 w-16 rounded-2xl bg-card border border-white/5 flex items-center justify-center shadow-xl">
                             {theme === 'dark' ? <Moon className="h-7 w-7 text-primary" /> : <Sun className="h-7 w-7 text-amber-500" />}
                          </div>
                          <div className="space-y-1">
                             <Label className="text-lg font-black italic tracking-tighter uppercase leading-none italic">Dark Mode</Label>
                             <p className="text-[11px] text-muted-foreground font-bold leading-none italic uppercase tracking-widest">Use a dark background to save battery.</p>
                          </div>
                       </div>
                       <Switch 
                          checked={theme === 'dark'} 
                          onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} 
                          className="scale-125 data-[state=checked]:bg-primary"
                       />
                    </div>
                 </div>

                 <div className="pt-12 text-center">
                    <Button 
                      variant="ghost" 
                      onClick={signOut}
                      className="h-14 px-10 text-red-500 hover:bg-red-500/10 hover:text-red-500 font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl transition-all"
                    >
                       <LogOut className="h-4 w-4 mr-4" /> Logout
                    </Button>
                 </div>
              </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-0">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <Card className="border-none shadow-2xl shadow-black/[0.05] bg-[#111114] text-white overflow-hidden relative group rounded-[40px]">
                 <div className="absolute top-0 right-0 p-12 opacity-[0.05] group-hover:scale-125 transition-transform duration-1000 grayscale">
                    <Shield className="h-48 w-48" />
                 </div>
                 <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-50" />
                 
                 <CardHeader className="p-12 pb-10 relative z-10">
                    <Badge className="w-fit mb-6 bg-green-500 font-black uppercase text-[10px] tracking-[0.4em] px-4 py-1.5 h-8 border-none ring-4 ring-green-500/20">ACTIVE</Badge>
                    <div className="flex items-end gap-4 mb-2">
                       <h3 className="text-6xl font-black italic tracking-tight uppercase leading-none">Enterprise</h3>
                       <span className="text-xs font-black uppercase tracking-[0.4em] text-white/20 mb-2">/ Main Account</span>
                    </div>
                    <CardDescription className="text-white/40 font-black uppercase tracking-[0.3em] text-[10px] italic">Plan: Premium Enterprise</CardDescription>
                 </CardHeader>
                 <CardContent className="p-12 pt-0 space-y-10 relative z-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       {[
                         {f: 'Unlimited Shops', i: Globe}, 
                         {f: 'Custom Branding', i: Zap}, 
                         {f: 'Smart AI Insights', i: Cpu}, 
                         {f: '24/7 Support', i: User}
                       ].map((item, i) => (
                          <div key={i} className="flex items-center gap-4 group">
                             <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary transition-all">
                                <item.i className="h-4 w-4 text-white" />
                             </div>
                             <span className="text-[11px] font-black uppercase tracking-widest text-white/70 italic">{item.f}</span>
                          </div>
                       ))}
                    </div>
                    <div className="pt-10 border-t border-white/5">
                       <div className="flex justify-between items-center mb-8">
                          <div className="space-y-1">
                             <p className="text-[10px] text-white/40 font-black uppercase tracking-widest italic">Yearly Cost</p>
                             <p className="text-3xl font-black italic leading-none">₵1,200.00 <span className="text-xs not-italic text-white/20 uppercase tracking-[0.3em]">/ year</span></p>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] text-white/40 font-black uppercase tracking-widest italic">Next Payment</p>
                             <p className="text-lg font-black italic text-primary uppercase">Jan 2025</p>
                          </div>
                       </div>
                       <Button 
                         onClick={() => toast.info("Payment gateway synchronization initializing...")}
                         className="w-full h-16 bg-white text-black hover:bg-primary hover:text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl transition-all shadow-2xl"
                       >
                          Manage Billing
                       </Button>
                    </div>
                 </CardContent>
              </Card>

              <Card 
                className="border-none shadow-2xl shadow-black/[0.02] bg-card/60 backdrop-blur-xl rounded-[40px] p-12"
                style={{ backgroundImage: 'url(https://www.transparenttextures.com/patterns/black-linen.png)' }}
              >
                 <CardHeader className="p-0 mb-10">
                    <div className="flex items-center gap-4 mb-2">
                       <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                          <CreditCard className="h-5 w-5" />
                       </div>
                       <CardTitle className="text-2xl font-black uppercase italic tracking-tighter">Payment Methods</CardTitle>
                    </div>
                    <CardDescription className="text-sm font-bold text-muted-foreground italic">Manage the cards you use to pay your subscription.</CardDescription>
                 </CardHeader>
                 <CardContent className="p-0 space-y-6">
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="p-8 rounded-[32px] bg-gradient-to-br from-zinc-800 to-zinc-950 border border-white/10 flex items-center justify-between shadow-2xl relative overflow-hidden"
                    >
                       <div className="absolute top-0 right-0 p-6 opacity-10">
                          <Fingerprint className="h-12 w-12 text-white" />
                       </div>
                       <div className="flex items-center gap-8 relative z-10">
                          <div className="h-14 w-20 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center p-3">
                             <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-full filter brightness-0 invert" />
                          </div>
                          <div>
                             <p className="text-2xl font-black italic tracking-[0.2em] text-white leading-none mb-2 underline decoration-primary underline-offset-8">•••• 4421</p>
                             <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em] italic">Expiry: 12/26</p>
                          </div>
                       </div>
                       <Badge className="bg-primary/20 text-primary border-primary/30 h-8 rounded-full font-black uppercase tracking-widest text-[8px] px-4">PRIMARY</Badge>
                    </motion.div>
                    
                    <Button variant="outline" className="w-full h-20 rounded-[32px] border-4 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all group">
                       <div className="flex items-center gap-4 font-black uppercase tracking-[0.3em] text-[10px] text-muted-foreground group-hover:text-primary">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/20 transition-all">
                             <Plus className="h-5 w-5" />
                          </div>
                          Add New Card
                       </div>
                    </Button>
                 </CardContent>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-0">
           <Card className="max-w-3xl border-none shadow-2xl shadow-black/[0.02] bg-card/60 backdrop-blur-xl rounded-[40px] mx-auto p-12 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
                 <Bell className="h-32 w-32" />
              </div>
              <CardHeader className="p-0 mb-12">
                 <div className="flex items-center gap-4 mb-2">
                    <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                       <Mail className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-2xl font-black uppercase italic tracking-tighter">Email Notifications</CardTitle>
                 </div>
                 <CardDescription className="text-sm font-bold text-muted-foreground italic tracking-tight">Stay updated with important business events.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-10">
                 <div className="flex flex-col gap-8">
                    <div className="flex items-center justify-between group p-8 rounded-[32px] bg-muted/20 border-2 border-border hover:bg-muted/30 transition-all">
                       <div className="flex items-center gap-6">
                          <div className="h-16 w-16 bg-card border border-white/5 rounded-2xl flex items-center justify-center shadow-xl">
                             <CreditCard className="h-7 w-7 text-emerald-500" />
                          </div>
                          <div className="space-y-1">
                             <h4 className="text-lg font-black italic uppercase leading-none tracking-tighter">Subscription Alerts</h4>
                             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic leading-none">Get notified 7 days before your subscription expires.</p>
                          </div>
                       </div>
                       <Switch 
                         checked={subExpiryNotify} 
                         onCheckedChange={setSubExpiryNotify}
                         className="scale-125 data-[state=checked]:bg-primary" 
                       />
                    </div>

                    <div className="flex items-center justify-between group p-8 rounded-[32px] bg-muted/20 border-2 border-border hover:bg-muted/30 transition-all">
                       <div className="flex items-center gap-6">
                          <div className="h-16 w-16 bg-card border border-white/5 rounded-2xl flex items-center justify-center shadow-xl">
                             <Zap className="h-7 w-7 text-primary" />
                          </div>
                          <div className="space-y-1">
                             <h4 className="text-lg font-black italic uppercase leading-none tracking-tighter">Invoice Receipts</h4>
                             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic leading-none">Receive a digital invoice via email after every payment.</p>
                          </div>
                       </div>
                       <Switch 
                         checked={invoiceNotify} 
                         onCheckedChange={setInvoiceNotify}
                         className="scale-125 data-[state=checked]:bg-primary" 
                       />
                    </div>

                    <div className="flex items-center justify-between group p-8 rounded-[32px] bg-muted/20 border-2 border-border hover:bg-muted/30 transition-all">
                       <div className="flex items-center gap-6">
                          <div className="h-16 w-16 bg-card border border-white/5 rounded-2xl flex items-center justify-center shadow-xl">
                             <Globe className="h-7 w-7 text-purple-500" />
                          </div>
                          <div className="space-y-1">
                             <h4 className="text-lg font-black italic uppercase leading-none tracking-tighter">Daily Sales Reports</h4>
                             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic leading-none">Receive a summary of your daily sales at 11 PM GMT.</p>
                          </div>
                       </div>
                       <Switch 
                         checked={salesNotify} 
                         onCheckedChange={setSalesNotify}
                         className="scale-125 data-[state=checked]:bg-primary" 
                       />
                    </div>
                 </div>
              </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-0">
           <Card className="max-w-3xl border-none shadow-2xl shadow-black/[0.02] bg-card/60 backdrop-blur-xl rounded-[40px] mx-auto p-12 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
                 <Key className="h-32 w-32" />
              </div>
              <CardHeader className="p-0 mb-12">
                 <div className="flex items-center gap-4 mb-2">
                    <div className="h-10 w-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                       <Shield className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-2xl font-black uppercase italic tracking-tighter">Security Settings</CardTitle>
                 </div>
                 <CardDescription className="text-sm font-bold text-muted-foreground italic tracking-tight">Protect your account with extra security layers.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-12">
                 <div className="flex flex-col gap-8">
                    <div className="flex items-center justify-between group p-8 rounded-[32px] bg-muted/20 border-2 border-border hover:bg-muted/30 transition-all">
                       <div className="flex items-center gap-6">
                          <div className="h-16 w-16 bg-card border border-white/5 rounded-2xl flex items-center justify-center shadow-xl">
                             <Smartphone className="h-7 w-7 text-primary" />
                          </div>
                          <div className="space-y-1">
                             <h4 className="text-lg font-black italic uppercase leading-none tracking-tighter">Two-Factor Auth</h4>
                             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic leading-none">A code will be sent to your phone when you log in.</p>
                          </div>
                       </div>
                       <Switch defaultChecked className="scale-125 data-[state=checked]:bg-primary" />
                    </div>

                    <div className="flex items-center justify-between group p-8 rounded-[32px] bg-muted/20 border-2 border-border hover:bg-muted/30 transition-all">
                       <div className="flex items-center gap-6">
                          <div className="h-16 w-16 bg-card border border-white/5 rounded-2xl flex items-center justify-center shadow-xl">
                             <Fingerprint className="h-7 w-7 text-purple-500" />
                          </div>
                          <div className="space-y-1">
                             <h4 className="text-lg font-black italic uppercase leading-none tracking-tighter">Face / Fingerprint Lock</h4>
                             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic leading-none">Use your phone's fingerprint or face scan to log in.</p>
                          </div>
                       </div>
                       <Switch className="scale-125 data-[state=checked]:bg-primary" />
                    </div>
                 </div>

                 <div className="pt-10 border-t border-white/5 space-y-6">
                    <div className="space-y-1">
                       <h4 className="text-lg font-black italic uppercase leading-none tracking-tighter flex items-center gap-2">
                          <Lock className="h-4 w-4" /> Change Password
                       </h4>
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic leading-none">Enter your current password and a new one to update it.</p>
                    </div>
                    <div className="space-y-4">
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Current Password</Label>
                          <Input
                             type="password"
                             value={currentPassword}
                             onChange={e => setCurrentPassword(e.target.value)}
                             placeholder="Enter your current password"
                             className="h-14 bg-muted/40 border-none rounded-2xl px-6 font-bold"
                          />
                       </div>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">New Password</Label>
                             <Input
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                placeholder="At least 8 characters"
                                className="h-14 bg-muted/40 border-none rounded-2xl px-6 font-bold"
                             />
                          </div>
                          <div className="space-y-2">
                             <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Confirm New Password</Label>
                             <Input
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter new password"
                                className="h-14 bg-muted/40 border-none rounded-2xl px-6 font-bold"
                             />
                          </div>
                       </div>
                       <Button
                          onClick={handleChangePassword}
                          disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                          className="h-14 font-black uppercase tracking-widest text-[10px] px-10 rounded-2xl gap-3 bg-emerald-600 hover:bg-emerald-500 text-white border-none"
                       >
                          {changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                          {changingPassword ? "Changing..." : "Change Password"}
                       </Button>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="sms" className="mt-0">
          <Card className="max-w-3xl border-none shadow-2xl shadow-black/[0.02] bg-card/60 backdrop-blur-xl rounded-[40px] mx-auto p-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
              <MessageSquare className="h-32 w-32" />
            </div>
            <CardHeader className="p-0 mb-10 relative z-10">
              <CardTitle className="text-2xl font-black italic tracking-tight">SMS Notifications</CardTitle>
              <CardDescription className="text-sm font-bold text-muted-foreground">
                Send SMS receipts to customers and daily sales summaries to the shop owner via smsnotifygh.com
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-8 relative z-10">
              <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4">
                <p className="text-xs text-amber-600 font-bold">
                  Configure SMS_API_KEY and SMS_SENDER_ID in your .env file to enable SMS. Get your API key from smsnotifygh.com
                </p>
              </div>

              <div className="flex items-center justify-between p-6 rounded-2xl bg-muted/30">
                <div className="space-y-1">
                  <Label className="text-sm font-bold">SMS Receipts to Customers</Label>
                  <p className="text-xs text-muted-foreground">Send an SMS receipt to customers after each purchase</p>
                </div>
                <Switch
                  checked={smsReceiptsEnabled}
                  onCheckedChange={setSmsReceiptsEnabled}
                />
              </div>

              <div className="flex items-center justify-between p-6 rounded-2xl bg-muted/30">
                <div className="space-y-1">
                  <Label className="text-sm font-bold">Daily Sales Summary SMS</Label>
                  <p className="text-xs text-muted-foreground">Send a daily sales summary to the shop owner when Z-Report is generated</p>
                </div>
                <Switch
                  checked={smsDailySummaryEnabled}
                  onCheckedChange={setSmsDailySummaryEnabled}
                />
              </div>

              <div className="space-y-3 pt-4 border-t">
                <Label className="text-sm font-bold">Test SMS</Label>
                <p className="text-xs text-muted-foreground">Send a test SMS to verify your SMS configuration is working</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. 0241234567"
                    value={smsTestPhone}
                    onChange={e => setSmsTestPhone(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    className="gap-2"
                    disabled={smsSending || !smsTestPhone}
                    onClick={async () => {
                      setSmsSending(true);
                      try {
                        await apiClient.post('/api/sms/test', { phoneNumber: smsTestPhone });
                        toast.success('Test SMS sent successfully!');
                      } catch (err: any) {
                        toast.error(err.response?.data?.error || 'Failed to send test SMS');
                      } finally {
                        setSmsSending(false);
                      }
                    }}
                  >
                    {smsSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {smsSending ? 'Sending...' : 'Send Test'}
                  </Button>
                </div>
              </div>

              <Button
                className="w-full gap-2"
                disabled={smsSaving}
                onClick={async () => {
                  setSmsSaving(true);
                  try {
                    await apiClient.put('/api/sms/settings', {
                      smsReceiptsEnabled,
                      smsDailySummaryEnabled,
                    });
                    toast.success('SMS settings saved!');
                  } catch (err: any) {
                    toast.error(err.response?.data?.error || 'Failed to save SMS settings');
                  } finally {
                    setSmsSaving(false);
                  }
                }}
              >
                {smsSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {smsSaving ? 'Saving...' : 'Save SMS Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Plus({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14"/>
      <path d="M12 5v14"/>
    </svg>
  );
}
