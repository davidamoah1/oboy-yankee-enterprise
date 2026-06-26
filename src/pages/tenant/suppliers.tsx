import React, { useEffect, useState } from "react";
import { 
  Truck, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  ShoppingBag, 
  BarChart2, 
  Clock,
  MoreVertical,
  ChevronRight,
  TrendingUp,
  Box,
  User,
  Tags
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";

const INITIAL_SUPPLIERS = [
  { id: "1", name: "Global Textiles Ltd", contact: "Kwesi Appiah", phone: "+233 24 000 1111", email: "orders@global.com", category: "Fabric", activeOrders: 3, totalSpend: 25000 },
  { id: "2", name: "Accra Electronics", contact: "John Doe", phone: "+233 55 222 3333", email: "sales@accra-elec.gh", category: "Gadgets", activeOrders: 0, totalSpend: 12400 },
  { id: "3", name: "Packaging Plus", contact: "Sarah Mensah", phone: "+233 20 444 5555", email: "sarah@packplus.com", category: "Material", activeOrders: 1, totalSpend: 5600 },
  { id: "4", name: "Tech Solutions GH", contact: "Victor Owusu", phone: "+233 24 666 7777", email: "victor@techsol.gh", category: "Software", activeOrders: 5, totalSpend: 45000 },
];

export default function SuppliersPage() {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState<any[]>(INITIAL_SUPPLIERS);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("Fabric");
  const [spend, setSpend] = useState("");

  // Load suppliers from API
  useEffect(() => {
    setLoading(true);
    apiClient.get('/api/suppliers')
      .then((response) => {
        setLoading(false);
        const data = response.data?.data || response.data || [];
        if (data && data.length > 0) {
          const mapped = data.map((s: any) => ({
            id: s.id,
            name: s.name,
            contact: s.contact_person || "",
            phone: s.phone || "",
            email: s.email || "",
            category: s.address && s.address.startsWith("CAT:") ? s.address.split(":")[1] : "General",
            activeOrders: 0,
            totalSpend: 0
          }));
          setSuppliers(mapped);
        }
      })
      .catch((err) => {
        setLoading(false);
        console.error("Error loading suppliers:", err);
      });
  }, []);

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim() || !phone.trim() || !email.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    apiClient.post('/api/suppliers', {
        name: name.trim(),
        contact_person: contact.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: `CAT:${category}`
      })
      .then((response) => {
        setLoading(false);
        const data = response.data?.data || response.data;
        if (data) {
          const newSupplier = {
            id: data.id,
            name: data.name,
            contact: data.contact_person || "",
            phone: data.phone || "",
            email: data.email || "",
            category: category,
            activeOrders: 0,
            totalSpend: parseFloat(spend) || 0
          };
          setSuppliers([newSupplier, ...suppliers]);
          setIsDialogOpen(false);
          toast.success(`Supplier "${name}" enrolled successfully!`);
          
          // Reset fields
          setName("");
          setContact("");
          setPhone("");
          setEmail("");
          setCategory("Fabric");
          setSpend("");
        }
      });
  };

  const totalSpendAll = suppliers.reduce((acc, curr) => acc + curr.totalSpend, 0);

  return (
    <div className="p-6 sm:p-10 space-y-10 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <div className="h-5 w-1 bg-primary rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground italic">Suppliers</span>
           </div>
           <h1 className="text-4xl font-black italic tracking-tighter uppercase text-foreground leading-none">
             Your <span className="text-primary">Suppliers</span>
           </h1>
        </div>
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/20 bg-primary border-none cursor-pointer"
        >
           <Plus className="h-4 w-4" /> Add New Supplier
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: "Total Suppliers", value: suppliers.length.toString(), icon: Truck, trend: "Fully active ledger" },
           { label: "Active Orders", value: suppliers.reduce((acc, c) => acc + c.activeOrders, 0).toString(), icon: Box, trend: "Incoming deliveries managed" },
           { label: "Total Committed Value", value: `GH₵ ${(totalSpendAll / 1000).toFixed(1)}k`, icon: TrendingUp, trend: "Overall supplier ledger sum" }
         ].map((stat, i) => (
           <Card key={i} className="bg-card/40 backdrop-blur-sm border-white/5 rounded-[35px] group hover:bg-white/[0.04] transition-all cursor-default overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                 <stat.icon className="h-20 w-20" />
              </div>
              <CardContent className="p-10">
                 <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 italic">{stat.label}</div>
                 <div className="text-4xl font-black italic tracking-tighter text-foreground mb-2 leading-none">{stat.value}</div>
                 <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{stat.trend}</div>
              </CardContent>
           </Card>
         ))}
      </div>

      {/* Search & List */}
      <div className="space-y-6">
         <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               placeholder="Search suppliers..." 
               className="h-16 pl-14 bg-card/40 border-white/5 rounded-2xl italic font-bold text-foreground focus-visible:ring-primary/20 shadow-xl"
            />
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {suppliers.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.contact.toLowerCase().includes(search.toLowerCase())).map((supplier) => (
               <Card key={supplier.id} className="bg-card/40 border-white/5 rounded-[40px] overflow-hidden group hover:border-primary/20 hover:bg-primary/[0.02] transition-all animate-in fade-in duration-300">
                  <div className="p-8 sm:p-10">
                     <div className="flex justify-between items-start mb-10">
                        <div className="flex gap-4">
                           <Avatar className="h-16 w-16 border-2 border-background shadow-lg">
                              <AvatarImage src={`https://ui-avatars.com/api/?name=${supplier.name}&background=random`} />
                              <AvatarFallback>{supplier.name.charAt(0)}</AvatarFallback>
                           </Avatar>
                           <div>
                              <div className="font-black italic text-2xl tracking-tighter uppercase leading-none mb-2">{supplier.name}</div>
                              <Badge className="bg-primary/10 text-primary border-none text-[9px] uppercase font-black tracking-widest px-3">
                                 {supplier.category}
                              </Badge>
                           </div>
                        </div>
                        <Button 
                          onClick={() => toast.info(`Managing supplier ${supplier.name}`)}
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 text-muted-foreground hover:bg-white/10 rounded-xl cursor-pointer"
                        >
                           <MoreVertical className="h-5 w-5" />
                        </Button>
                     </div>

                     <div className="grid grid-cols-2 gap-6 mb-10">
                        <div className="space-y-4">
                           <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5 text-primary" /> {supplier.contact}
                           </div>
                           <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                              <Phone className="h-4 w-4 text-primary" /> {supplier.phone}
                           </div>
                           <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                              <Mail className="h-4 w-4 text-primary" /> {supplier.email}
                           </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col justify-center text-center">
                           <div className="text-[9px] font-black uppercase text-slate-600 mb-1">Total spent</div>
                           <div className="text-xl font-black italic text-slate-200 leading-none">GH₵ {supplier.totalSpend.toLocaleString()}</div>
                        </div>
                     </div>

                     <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="flex items-center gap-2">
                              <ShoppingBag className="h-4 w-4 text-emerald-500" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                 {supplier.activeOrders} Active Orders
                              </span>
                           </div>
                        </div>
                        <Button 
                          onClick={() => toast.info("Opening purchase history log...")}
                          variant="ghost" 
                          className="text-[10px] font-black uppercase tracking-widest text-primary gap-2 p-0 hover:bg-transparent group/link cursor-pointer"
                        >
                           View History <ChevronRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                        </Button>
                     </div>
                  </div>
               </Card>
            ))}
         </div>
      </div>

      {/* Add Supplier Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px] p-8 bg-slate-950/95 backdrop-blur-2xl border border-white/10 rounded-[40px] text-white shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter text-white flex items-center gap-2">
              <Truck className="h-6 w-6 text-primary" />
              <span>Enroll New Supplier</span>
            </DialogTitle>
            <DialogDescription className="text-xs font-semibold text-slate-400">
              Onboard a verified business partner into your local bookkeeping ledger.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSupplier} className="space-y-6 pt-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-1">Company / Supplier Name</label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. West African Distributors Ltd" 
                className="h-14 bg-white/[0.03] border-white/5 hover:border-white/10 focus:border-primary/50 rounded-2xl font-black px-6" 
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-1">Contact Person</label>
                <Input 
                  value={contact} 
                  onChange={(e) => setContact(e.target.value)} 
                  placeholder="e.g. Kwame Mensah" 
                  className="h-14 bg-white/[0.03] border-white/5 hover:border-white/10 focus:border-primary/50 rounded-2xl font-bold px-6" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-1">Category</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-14 bg-slate-900 border border-white/5 focus:border-primary/50 rounded-2xl font-bold px-6 text-sm text-slate-300 outline-none"
                >
                  <option value="Fabric">Fabric & Textiles</option>
                  <option value="Gadgets">Electronics & Gadgets</option>
                  <option value="Material">Packaging Materials</option>
                  <option value="Software">IT / Software Services</option>
                  <option value="Beverages">Food & Beverages</option>
                  <option value="General">General Goods</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-1">Phone Number</label>
                <Input 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="+233 24 123 4567" 
                  className="h-14 bg-white/[0.03] border-white/5 hover:border-white/10 focus:border-primary/50 rounded-2xl font-mono px-6 text-sm" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-1">Email Address</label>
                <Input 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  type="email"
                  placeholder="name@provider.com" 
                  className="h-14 bg-white/[0.03] border-white/5 hover:border-white/10 focus:border-primary/50 rounded-2xl font-semibold px-6 text-sm" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-1">Initial Spent Ledger (GH₵, Optional)</label>
              <Input 
                value={spend} 
                onChange={(e) => setSpend(e.target.value)} 
                type="number"
                placeholder="e.g. 5000" 
                className="h-14 bg-white/[0.03] border-white/5 hover:border-white/10 focus:border-primary/50 rounded-2xl font-black px-6 text-sm" 
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)} 
                className="flex-1 h-14 border-white/5 text-slate-400 hover:bg-white/5 rounded-2xl font-black uppercase tracking-widest text-[10px] cursor-pointer"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 h-14 bg-primary text-primary-foreground hover:bg-primary/95 rounded-2xl font-black uppercase tracking-widest text-[10px] border-none shadow-xl shadow-primary/20 cursor-pointer"
              >
                Enroll Partner
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
