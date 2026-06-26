import { useEffect, useState } from "react";
import { 
  Search, 
  Filter, 
  Plus, 
  UserPlus, 
  Mail, 
  Phone, 
  MoreHorizontal, 
  Star,
  History,
  Trash2,
  Edit2,
  Download,
  Gift,
  Users,
  TrendingUp,
  Diamond,
  UserCircle2,
  LayoutGrid,
  ChevronRight,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  points: number;
  totalSpent: number;
  lastVisit: string;
  tier: "Standard" | "Silver" | "Gold" | "VIP";
  debtBalance?: number; // Store community credit / trust debt in GHS
  trustScore?: number;  // Local customer credit trust ranking %
};

const INITIAL_CUSTOMERS: Customer[] = [
  { id: "C-001", name: "David Amoah", email: "david@example.com", phone: "+233 24 123 4567", points: 850, totalSpent: 4200.50, lastVisit: "2024-05-11", tier: "Gold", debtBalance: 320.00, trustScore: 92 },
  { id: "C-002", name: "Mary Appiah", email: "mary@example.com", phone: "+233 50 987 6543", points: 120, totalSpent: 850.00, lastVisit: "2024-05-08", tier: "Silver", debtBalance: 0.00, trustScore: 98 },
  { id: "C-003", name: "Kwame Nkrumah", email: "kwame@example.com", phone: "+233 20 555 0199", points: 3400, totalSpent: 12800.00, lastVisit: "2024-05-10", tier: "VIP", debtBalance: 1250.00, trustScore: 85 },
  { id: "C-004", name: "Abena Mansa", email: "abena@example.com", phone: "+233 27 333 4444", points: 45, totalSpent: 150.20, lastVisit: "2024-04-30", tier: "Standard", debtBalance: 55.00, trustScore: 95 },
  { id: "C-005", name: "Isaac Newton", email: "isaac@example.com", phone: "+233 24 000 1111", points: 0, totalSpent: 0, lastVisit: "Joined Today", tier: "Standard", debtBalance: 0.00, trustScore: 100 },
];

export default function CustomersPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [search, setSearch] = useState("");
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const [loading, setLoading] = useState(false);
  
  // Create/Edit Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form fields
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formPoints, setFormPoints] = useState("0");
  const [formTier, setFormTier] = useState<"Standard" | "Silver" | "Gold" | "VIP">("Standard");

  // Local West-African Trust Book UI states
  const [viewMode, setViewMode] = useState<"directory" | "trustbook">("directory");
  const [activeCreditCustomer, setActiveCreditCustomer] = useState<Customer | null>(null);
  const [cashoutActionType, setCashoutActionType] = useState<"debit" | "settle" | "reminder" | null>(null);
  const [amountInput, setAmountInput] = useState("");
  const [reasonInput, setReasonInput] = useState("");
  const [settlementChannel, setSettlementChannel] = useState<"Cash" | "MoMo">("Cash");

  // Load existing customers from API
  useEffect(() => {
    setLoading(true);
    apiClient.get('/api/customers')
      .then((response) => {
        setLoading(false);
        const data = response.data?.data || response.data || [];
        if (data && data.length > 0) {
          const mapped: Customer[] = data.map((c: any) => ({
            id: c.id,
            name: c.name,
            email: c.email || "",
            phone: c.phone || "",
            points: c.points || 0,
            totalSpent: parseFloat(c.metadata?.totalSpent) || 0,
            lastVisit: c.metadata?.lastVisit || "Joined Recently",
            tier: (c.tier as "Standard" | "Silver" | "Gold" | "VIP") || "Standard",
            debtBalance: parseFloat(c.metadata?.debtBalance) || 0,
            trustScore: parseInt(c.metadata?.trustScore) || 100
          }));
          setCustomers(mapped);
        }
      })
      .catch((err) => {
        setLoading(false);
        console.error("Error loading customers:", err);
      });
  }, []);

  const handleDelete = () => {
    if (confirmModal.id) {
      apiClient.delete(`/api/customers/${confirmModal.id}`)
        .then(() => {
          setCustomers(prev => prev.filter(c => c.id !== confirmModal.id));
          toast.success("Customer record archived from your registry");
          setConfirmModal({ isOpen: false, id: null });
        })
        .catch((err: any) => {
          toast.error("Failed to delete customer: " + (err.response?.data?.error || err.message));
          setConfirmModal({ isOpen: false, id: null });
        });
    }
  };

  const openAddDialog = () => {
    setEditingCustomer(null);
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormPoints("0");
    setFormTier("Standard");
    setIsDialogOpen(true);
  };

  const openEditDialog = (cust: Customer) => {
    setEditingCustomer(cust);
    setFormName(cust.name);
    setFormEmail(cust.email);
    setFormPhone(cust.phone);
    setFormPoints(cust.points.toString());
    setFormTier(cust.tier);
    setIsDialogOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) {
      toast.error("Name and Phone Number are required.");
      return;
    }

    if (editingCustomer) {
      // Editing
      setLoading(true);
      apiClient.put(`/api/customers/${editingCustomer.id}`, {
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        points: parseInt(formPoints) || 0,
        tier: formTier
      })
        .then(() => {
          setLoading(false);
          setCustomers(prev => prev.map(c => {
            if (c.id === editingCustomer.id) {
              return {
                ...c,
                name: formName.trim(),
                email: formEmail.trim(),
                phone: formPhone.trim(),
                points: parseInt(formPoints) || 0,
                tier: formTier
              };
            }
            return c;
          }));
          toast.success(`Customer "${formName}" updated successfully!`);
          setIsDialogOpen(false);
        })
        .catch((err: any) => {
          setLoading(false);
          toast.error("Failed to update customer: " + (err.response?.data?.error || err.message));
        });
    } else {
      // Adding
      setLoading(true);
      apiClient.post('/api/customers', {
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        points: parseInt(formPoints) || 0,
        tier: formTier,
        metadata: { totalSpent: 0, lastVisit: "Joined Today" }
      })
        .then((response) => {
          setLoading(false);
          const data = response.data?.data || response.data;
          if (data) {
            const newCustomer: Customer = {
              id: data.id,
              name: data.name,
              email: data.email || "",
              phone: data.phone || "",
              points: data.points || 0,
              totalSpent: 0,
              lastVisit: "Joined Today",
              tier: data.tier as "Standard" | "Silver" | "Gold" | "VIP"
            };
            setCustomers([newCustomer, ...customers]);
            toast.success(`Customer "${formName}" registered successfully!`);
            setIsDialogOpen(false);
          }
        })
        .catch((err: any) => {
          setLoading(false);
          toast.error("Failed to register customer: " + (err.response?.data?.error || err.message));
        });
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 bg-card/40 backdrop-blur-xl p-10 rounded-[40px] border border-border/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Users className="h-32 w-32 rotate-12" />
        </div>
        <div className="space-y-3 relative z-10">
           <div className="flex items-center gap-3 mb-2">
              <div className="h-6 w-1 bg-primary rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Customers</span>
           </div>
           <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
             {viewMode === "directory" ? "Your Customers" : "Kofi Trust Book"}
           </h1>
           <p className="text-muted-foreground font-bold text-sm max-w-lg">
             {viewMode === "directory" 
               ? "Manage your customer relationships, loyalty points, and shopping history."
               : "Track 'Masesa' community credits under classic West-African retail trust agreements."
             }
           </p>
        </div>
        <div className="relative z-10 w-full lg:w-auto flex flex-col sm:flex-row gap-4">
            <Button 
              variant="outline" 
              onClick={() => toast.info("Compiling customer registry for export (.xlsx)")}
              className="w-full sm:w-auto h-14 px-8 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] gap-3 hover:bg-muted transition-all cursor-pointer"
            >
               <Download className="h-4 w-4" /> Export Contacts
            </Button>
            <Button 
              onClick={openAddDialog}
              className="w-full sm:w-auto h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3 shadow-2xl shadow-primary/30 bg-primary border-none hover:translate-y-[-4px] transition-all cursor-pointer text-primary-foreground"
            >
               <UserPlus className="h-4 w-4" /> Add New Customer
            </Button>
        </div>
      </div>

      {/* Global View Selector Tabs */}
      <div className="flex bg-slate-900 border border-white/5 p-1 rounded-2xl max-w-md">
         <button 
           onClick={() => setViewMode("directory")} 
           className={cn(
             "flex-1 py-3 px-5 text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer",
             viewMode === "directory" ? "bg-primary text-primary-foreground font-bold shadow-md" : "text-muted-foreground hover:text-foreground"
           )}
         >
            Directory Registry
         </button>
         <button 
           onClick={() => setViewMode("trustbook")} 
           className={cn(
             "flex-1 py-3 px-5 text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer gap-2 flex items-center justify-center",
             viewMode === "trustbook" ? "bg-amber-500 text-black font-bold shadow-md" : "text-slate-400 hover:text-foreground"
           )}
         >
            🏺 Kofi Trust Book (Credit)
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <Card className="border-none shadow-2xl shadow-black/[0.02] bg-card/40 backdrop-blur-xl rounded-[32px] p-8 relative overflow-hidden group hover:bg-card/60 transition-all">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{viewMode === "directory" ? "Total Customers" : "Outstanding Credit Ledgers"}</span>
                   <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Users className="h-4 w-4" />
                   </div>
                </div>
                <div>
                   <h3 className="text-3xl font-black italic tracking-tighter leading-none mt-1">{viewMode === "directory" ? `${customers.length} Active Customers` : `${customers.filter(c => (c.debtBalance || 0) > 0).length} Families Logged`}</h3>
                   <p className="text-[10px] font-bold text-muted-foreground mt-3 uppercase tracking-widest leading-none">{viewMode === "directory" ? "Registered Loyalty Program Members" : "Active Neighborhood Trust Books"}</p>
                </div>
            </div>
         </Card>

         <Card className="border-none shadow-2xl shadow-black/[0.02] bg-card/40 backdrop-blur-xl rounded-[32px] p-8 relative overflow-hidden group hover:bg-card/60 transition-all">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{viewMode === "directory" ? "Total Loyalty Points" : "Total Outstanding Debt"}</span>
                   <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <Diamond className="h-4 w-4" />
                   </div>
                </div>
                <div>
                   <h3 className="text-3xl font-black italic tracking-tighter leading-none mt-1">{viewMode === "directory" ? (
                       <>{customers.reduce((s, c) => s + c.points, 0).toLocaleString()} <span className="text-sm font-black uppercase not-italic">Pts</span></>
                    ) : (
                       <>GH₵ {customers.reduce((s, c) => s + (c.debtBalance || 0), 0).toFixed(2)}</>
                    )}</h3>
                   <p className="text-[10px] font-bold text-muted-foreground mt-3 uppercase tracking-widest leading-none">{viewMode === "directory" ? "Points waiting to be used" : "Expected Storefront Credits"}</p>
                </div>
            </div>
         </Card>

         <Card className="border-none shadow-2xl shadow-black/[0.02] bg-card/40 backdrop-blur-xl rounded-[32px] p-8 relative overflow-hidden group hover:bg-card/60 transition-all">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{viewMode === "directory" ? "Average Customer Value" : "Collective Trust Index"}</span>
                   <div className="h-8 w-8 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                      <TrendingUp className="h-4 w-4" />
                   </div>
                </div>
                <div>
                   <h3 className="text-3xl font-black italic tracking-tighter leading-none mt-1">{viewMode === "directory" ? `₵ ${(customers.reduce((s,c) => s+c.totalSpent, 0) / (customers.length || 1)).toFixed(0)}` : `${(customers.reduce((s,c) => s+(c.trustScore || 100), 0) / (customers.length || 1)).toFixed(0)}% Stable`}</h3>
                   <p className="text-[10px] font-bold text-muted-foreground mt-3 uppercase tracking-widest leading-none">{viewMode === "directory" ? "Average amount spent per customer" : "Community repayment reliability"}</p>
                </div>
            </div>
         </Card>
      </div>

{viewMode === "directory" ? (
      <Card className="border-none shadow-2xl shadow-black/[0.02] bg-card/60 backdrop-blur-xl rounded-[40px] overflow-hidden">
        <CardHeader className="p-10 pb-6 border-b border-white/5">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="relative w-full lg:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search by name, email or phone..." 
                className="h-12 pl-12 bg-muted/40 border-none rounded-2xl font-black italic placeholder:font-bold placeholder:italic transition-all focus-visible:ring-2 focus-visible:ring-primary/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4 w-full lg:w-auto">
               <Button variant="outline" className="flex-1 lg:flex-none h-12 rounded-xl border-2 font-black uppercase tracking-widest text-[10px] gap-3">
                  <Filter className="h-4 w-4" /> Filter
               </Button>
               <Button variant="outline" className="h-12 w-12 rounded-xl border-2 p-0 flex items-center justify-center">
                  <LayoutGrid className="h-4 w-4" />
               </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="rounded-[32px] overflow-hidden border border-white/5 shadow-2xl">
            <Table>
              <TableHeader className="bg-muted/30 border-none">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="h-16 px-6 text-[10px] font-black uppercase tracking-[0.2em] italic text-muted-foreground">Name</TableHead>
                  <TableHead className="h-16 px-6 text-[10px] font-black uppercase tracking-[0.2em] italic text-muted-foreground">Contact Info</TableHead>
                  <TableHead className="h-16 px-6 text-[10px] font-black uppercase tracking-[0.2em] italic text-muted-foreground text-center">Points & Level</TableHead>
                  <TableHead className="h-16 px-6 text-[10px] font-black uppercase tracking-[0.2em] italic text-muted-foreground text-right border-x border-white/5">Total Spent</TableHead>
                  <TableHead className="h-16 px-6 text-[10px] font-black uppercase tracking-[0.2em] italic text-muted-foreground text-right">Last Visit</TableHead>
                  <TableHead className="h-16 px-6 w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {filteredCustomers.map((customer, i) => (
                    <motion.tr 
                      key={customer.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-muted/20 transition-all border-b border-white/5 group relative"
                    >
                      <TableCell className="px-6 py-6 font-bold">
                        <div className="flex items-center gap-4">
                           <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-black text-xs shadow-inner">
                              {customer.name.split(' ').map(n=>n[0]).join('')}
                           </div>
                           <div className="flex flex-col">
                              <span className="text-sm font-black italic tracking-tighter leading-none">{customer.name}</span>
                              <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mt-1 opacity-50 group-hover:opacity-100 transition-opacity">{customer.id}</span>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-6">
                        <div className="flex flex-col gap-1.5 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                           <span className="text-[10px] font-bold flex items-center gap-2 tracking-tight italic"><Mail className="h-3 w-3 text-primary" /> {customer.email || "No contact chain"}</span>
                           <span className="text-[10px] font-bold flex items-center gap-2 tracking-tight italic"><Phone className="h-3 w-3 text-primary" /> {customer.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-6 text-center">
                        <div className="inline-flex items-center gap-3">
                           <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/10">
                              <Star className="h-3 w-3 fill-current" />
                              <span className="text-[11px] font-black">{customer.points}</span>
                           </div>
                           <Badge variant="outline" className={cn(
                             "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border-none",
                             customer.tier === 'VIP' ? "bg-primary/20 text-primary" : "bg-muted/40 text-muted-foreground"
                           )}>
                              {customer.tier}
                           </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-6 text-right font-black text-sm border-x border-white/5 bg-muted/10 group-hover:bg-primary/5 transition-all">
                        ₵ {customer.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="px-6 py-6 text-right font-mono text-[9px] text-muted-foreground font-black uppercase tracking-widest italic grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                        {customer.lastVisit}
                      </TableCell>
                      <TableCell className="px-6 py-6 font-semibold">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[250px] p-3 rounded-2xl bg-[#111114] border-white/5 shadow-2xl backdrop-blur-3xl">
                            <DropdownMenuItem 
                              onClick={() => toast.info(`Viewing recent activity for ${customer.name}`)}
                              className="h-12 rounded-xl focus:bg-primary/10 focus:text-primary transition-all gap-3 font-black uppercase tracking-widest text-[10px]"
                            >
                               <History className="h-4 w-4" /> View History
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setCustomers(prev => prev.map(c => c.id === customer.id ? { ...c, points: c.points + 50 } : c));
                                toast.success("Rewarded 50 instant bonus points!");
                              }}
                              className="h-12 rounded-xl focus:bg-primary/10 focus:text-primary transition-all gap-3 font-black uppercase tracking-widest text-[10px]"
                            >
                               <Gift className="h-4 w-4" /> Give Reward (+50)
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/5 my-2" />
                            <DropdownMenuItem 
                              onClick={() => openEditDialog(customer)}
                              className="h-12 rounded-xl focus:bg-primary/10 focus:text-primary transition-all gap-3 font-black uppercase tracking-widest text-[10px]"
                            >
                               <Edit2 className="h-4 w-4" /> Edit Customer
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="h-12 rounded-xl focus:bg-red-500/10 focus:text-red-500 transition-all gap-3 font-black uppercase tracking-widest text-[10px] text-red-500"
                              onClick={() => setConfirmModal({ isOpen: true, id: customer.id })}
                            >
                               <Trash2 className="h-4 w-4" /> Remove Customer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      ) : (
        /* Kofi Trust Book Master Card Layout */
        <Card className="border-none shadow-2xl bg-[#09090b]/80 border border-white/5 backdrop-blur-xl rounded-[40px] overflow-hidden">
          <CardHeader className="p-10 pb-6 border-b border-white/5">
             <div className="flex flex-col xl:flex-row items-center justify-between gap-6">
                <div>
                   <h3 className="text-xl font-black italic uppercase tracking-tight text-white flex items-center gap-2">
                      <span>🏺 Kofi Trust Circle Credit Ledger</span>
                   </h3>
                   <p className="text-xs text-muted-foreground mt-1 max-w-xl font-semibold">
                      Ghanaian retail communities operate on relational trust. Use the ledger to securely extend grocery/provisions credit and track repayments transparently.
                   </p>
                </div>
                <div className="relative w-full xl:w-96 group">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-amber-500 transition-colors" />
                   <Input 
                     placeholder="Search debtor name or number..." 
                     className="h-12 pl-12 bg-white/5 border-none rounded-2xl font-black italic placeholder:font-bold placeholder:italic tracking-wide"
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                   />
                </div>
             </div>
          </CardHeader>
          <CardContent className="p-6">
             <div className="rounded-[32px] overflow-hidden border border-white/5 shadow-2xl font-black">
                <Table>
                   <TableHeader className="bg-muted/15 border-none">
                      <TableRow className="hover:bg-transparent border-none">
                        <TableHead className="h-16 px-6 text-[10px] font-black uppercase tracking-[0.2em] italic text-muted-foreground">Community Debtor</TableHead>
                        <TableHead className="h-16 px-6 text-[10px] font-black uppercase tracking-[0.2em] italic text-muted-foreground text-center">Trust Integrity</TableHead>
                        <TableHead className="h-16 px-6 text-[10px] font-black uppercase tracking-[0.2em] italic text-muted-foreground text-center border-x border-white/5 bg-amber-500/5">Active Debt Balance</TableHead>
                        <TableHead className="h-16 px-6 text-[10px] font-black uppercase tracking-[0.2em] italic text-muted-foreground text-right font-semibold">Repayment Action Hub</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                     {filteredCustomers.map((customer) => {
                        const debt = customer.debtBalance || 0;
                        const trust = customer.trustScore || 100;
                        return (
                          <TableRow key={customer.id} className="hover:bg-white/[0.02] border-b border-white/5 transition-all text-white">
                             <TableCell className="px-6 py-6 font-bold">
                                <div className="flex items-center gap-4">
                                   <div className="h-11 w-11 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 font-black text-xs border border-amber-500/10">
                                      {customer.name.split(' ').map(n=>n[0]).join('')}
                                   </div>
                                   <div className="flex flex-col">
                                      <span className="text-sm font-black italic leading-none">{customer.name}</span>
                                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight mt-1">{customer.phone}</span>
                                   </div>
                                </div>
                             </TableCell>
                             <TableCell className="text-center px-6 py-6">
                                <div className="inline-flex flex-col items-center gap-1.5 bg-slate-900 border border-white/5 rounded-2xl px-4 py-2">
                                   <span className={cn(
                                     "text-xs font-black",
                                     trust >= 95 ? "text-emerald-500" : trust >= 85 ? "text-amber-500" : "text-rose-500"
                                   )}>
                                      {trust}% Rating
                                   </span>
                                   <div className="w-16 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                      <div className={cn(
                                        "h-full",
                                        trust >= 95 ? "bg-emerald-500" : trust >= 85 ? "bg-amber-500" : "bg-rose-500"
                                      )} style={{ width: `${trust}%` }} />
                                   </div>
                                </div>
                             </TableCell>
                             <TableCell className="text-center px-6 py-6 border-x border-white/5 bg-amber-500/[0.02]">
                                <span className={cn(
                                  "font-black text-base italic",
                                  debt > 0 ? "text-amber-500" : "text-slate-500"
                                )}>
                                   GH₵ {debt.toFixed(2)}
                                </span>
                             </TableCell>
                             <TableCell className="px-6 py-6 text-right">
                                <div className="flex justify-end gap-2.5">
                                   <Button 
                                     onClick={() => {
                                        setActiveCreditCustomer(customer);
                                        setCashoutActionType("debit");
                                        setAmountInput("");
                                     }}
                                     className="h-10 px-3.5 rounded-xl border border-white/5 bg-slate-950 font-black text-[9px] uppercase tracking-wider text-slate-300 hover:text-white"
                                   >
                                      + Log Debt
                                   </Button>
                                   <Button 
                                     onClick={() => {
                                        setActiveCreditCustomer(customer);
                                        setCashoutActionType("settle");
                                        setAmountInput(debt > 0 ? debt.toString() : "");
                                     }}
                                     className="h-10 px-3.5 rounded-xl bg-amber-500 text-black hover:bg-amber-600 font-black text-[9px] uppercase tracking-wider text-black"
                                   >
                                      Settle Credit
                                   </Button>
                                   <Button 
                                     onClick={() => {
                                        if (debt <= 0) {
                                          toast.success("This customer has cleared all trust book entries!");
                                          return;
                                        }
                                        setActiveCreditCustomer(customer);
                                        setCashoutActionType("reminder");
                                     }}
                                     className="h-10 px-3 border border-green-500/30 bg-green-500/5 text-green-400 hover:bg-green-500 hover:text-black font-black text-[9px] uppercase tracking-wider cursor-pointer"
                                   >
                                      Remind
                                   </Button>
                                </div>
                             </TableCell>
                          </TableRow>
                        );
                     })}
                   </TableBody>
                </Table>
             </div>
          </CardContent>
       </Card>
      )}

      {/* Kofi Trust Book Actions Dialog */}
      <Dialog 
        open={cashoutActionType !== null && activeCreditCustomer !== null} 
        onOpenChange={(open) => { 
          if (!open) { 
            setCashoutActionType(null); 
            setActiveCreditCustomer(null); 
            setAmountInput(""); 
            setReasonInput(""); 
          } 
        }}
      >
        <DialogContent className="sm:max-w-[480px] p-8 bg-slate-950 border border-white/10 rounded-[30px] text-white shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase italic tracking-tight text-white flex items-center gap-2">
               {cashoutActionType === "debit" && "Log Storefront Debt 📝"}
               {cashoutActionType === "settle" && "Clear Repayment Balance 🪙"}
               {cashoutActionType === "reminder" && "Generate WhatsApp Bill Reminder 🏺"}
            </DialogTitle>
            <DialogDescription className="text-xs font-bold text-slate-400">
               Customer: {activeCreditCustomer?.name} ({activeCreditCustomer?.phone})
            </DialogDescription>
          </DialogHeader>

          {cashoutActionType === "reminder" ? (
            <div className="space-y-6 pt-4 text-white">
               <p className="text-xs text-slate-400 leading-relaxed font-bold">
                  We have generated a respectful, highly localized reminder template in line with community trade norms. Copy to clipboard or launch directly on WhatsApp:
               </p>
               <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 font-black italic text-xs leading-relaxed text-amber-500 whitespace-pre-line">
                  {`Ao ${activeCreditCustomer?.name}! 👋\n\nHope your day is going well. This is a gentle hello from the provisions boutique.\n\nOur register shows a credit ledger balance of GH₵ ${(activeCreditCustomer?.debtBalance || 0).toFixed(2)} in our Kofi Book. Please let us know when you can settle, or send via MoMo. Medaase (thank you) so much! 🙏`}
               </div>
               <div className="flex gap-4">
                  <Button
                    onClick={() => {
                      const text = `Ao ${activeCreditCustomer?.name}! 👋\n\nHope your day is going well. This is a gentle hello from the provisions boutique.\n\nOur register shows a credit ledger balance of GH₵ ${(activeCreditCustomer?.debtBalance || 0).toFixed(2)} in our Kofi Book. Please let us know when you can settle, or send via MoMo. Medaase (thank you) so much! 🙏`;
                      navigator.clipboard.writeText(text);
                      toast.success("Polite reminder copied to clipboard! Share on WhatsApp instantly.");
                    }}
                    className="flex-1 h-12 bg-white/10 text-white hover:bg-white/15 rounded-xl text-[10px] uppercase font-black tracking-wider cursor-pointer"
                  >
                     Copy Message
                  </Button>
                  <Button
                    onClick={() => {
                      const text = `Ao ${activeCreditCustomer?.name}! 👋\n\nHope your day is going well. This is a gentle hello from the provisions boutique.\n\nOur register shows a credit ledger balance of GH₵ ${(activeCreditCustomer?.debtBalance || 0).toFixed(2)} in our Kofi Book. Please let us know when you can settle, or send via MoMo. Medaase (thank you) so much! 🙏`;
                      window.open(`https://wa.me/${activeCreditCustomer?.phone.replace(/\s+/g, '')}?text=${encodeURIComponent(text)}`, "_blank");
                    }}
                    className="flex-1 h-12 bg-green-500 text-black hover:bg-green-600 rounded-xl text-[10px] uppercase font-black tracking-wider cursor-pointer"
                  >
                     Send WhatsApp
                  </Button>
               </div>
            </div>
          ) : (
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!activeCreditCustomer) return;
                const amt = parseFloat(amountInput);
                if (isNaN(amt) || amt <= 0) {
                  toast.error("Please enter a valid amount.");
                  return;
                }

                if (cashoutActionType === "debit") {
                  setCustomers(prev => prev.map(c => {
                    if (c.id === activeCreditCustomer.id) {
                      const currentDebt = c.debtBalance || 0;
                      return {
                        ...c,
                        debtBalance: currentDebt + amt,
                        trustScore: Math.max(50, (c.trustScore || 100) - 3)
                      };
                    }
                    return c;
                  }));
                  toast.success(`Logged debit of GH₵ ${amt.toFixed(2)} to ${activeCreditCustomer.name}'s credit book.`);
                } else if (cashoutActionType === "settle") {
                  setCustomers(prev => prev.map(c => {
                    if (c.id === activeCreditCustomer.id) {
                      const currentDebt = c.debtBalance || 0;
                      return {
                        ...c,
                        debtBalance: Math.max(0, currentDebt - amt),
                        trustScore: Math.min(100, (c.trustScore || 100) + 5)
                      };
                    }
                    return c;
                  }));
                  toast.success(`Recorded repayment of GH₵ ${amt.toFixed(2)} using ${settlementChannel} from ${activeCreditCustomer.name}.`);
                }

                // API background sync backup trigger
                   const updated = customers.find(c => c.id === activeCreditCustomer.id);
                   if (updated) {
                      const nextDebt = cashoutActionType === "debit" ? (updated.debtBalance || 0) + amt : Math.max(0, (updated.debtBalance || 0) - amt);
                      const nextTrust = cashoutActionType === "debit" ? Math.max(50, (updated.trustScore || 100) - 3) : Math.min(100, (updated.trustScore || 100) + 5);
                      apiClient.put(`/api/customers/${activeCreditCustomer.id}`, {
                           metadata: {
                              ...updated,
                              debtBalance: nextDebt,
                              trustScore: nextTrust
                           }
                        })
                        .catch((err: any) => console.warn("API background synchronization failed safely.", err));
                   }

                setAmountInput("");
                setReasonInput("");
                setCashoutActionType(null);
                setActiveCreditCustomer(null);
              }}
              className="space-y-4 pt-4 text-white"
            >
               {cashoutActionType === "settle" && (
                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-wider text-slate-500">Repayment Channel</label>
                    <div className="grid grid-cols-2 gap-2">
                       <button
                         type="button"
                         onClick={() => setSettlementChannel("Cash")}
                         className={cn(
                           "py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                           settlementChannel === "Cash" ? "bg-amber-500 text-black font-bold" : "bg-white/5 text-slate-400"
                         )}
                       >
                          Cash Drawer
                       </button>
                       <button
                         type="button"
                         onClick={() => setSettlementChannel("MoMo")}
                         className={cn(
                           "py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                           settlementChannel === "MoMo" ? "bg-amber-500 text-black font-bold" : "bg-white/5 text-slate-400"
                         )}
                       >
                          MoMo Wallet
                       </button>
                    </div>
                 </div>
               )}

               <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-wider text-slate-500">GHS Amount (₵)</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    className="h-12 bg-white/5 border-white/5 font-black text-slate-100 pl-4"
                    required
                  />
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-wider text-slate-500">Reason / Custom Notes</label>
                  <Input
                    type="text"
                    value={reasonInput}
                    onChange={(e) => setReasonInput(e.target.value)}
                    placeholder={cashoutActionType === "debit" ? "e.g. 2 tins milk, bread" : "e.g. partial cleared"}
                    className="h-12 bg-white/5 border-white/5 font-semibold text-slate-100 pl-4"
                  />
               </div>

               <Button
                 type="submit"
                 className="w-full h-12 bg-amber-500 text-black hover:bg-amber-600 text-[10px] font-black uppercase tracking-widest cursor-pointer mt-4"
               >
                  Authorize Entry
               </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Customer Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px] p-8 bg-slate-950/95 backdrop-blur-2xl border border-white/10 rounded-[40px] text-white shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter text-white flex items-center gap-2">
              <UserCircle2 className="h-6 w-6 text-primary" />
              <span>{editingCustomer ? "Update Customer Profile" : "Register Customer"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs font-semibold text-slate-400">
              Create or modify profiles for retail campaigns, invoices, and direct loyalty tracking.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-6 pt-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-1">Full Customer Name</label>
              <Input 
                value={formName} 
                onChange={(e) => setFormName(e.target.value)} 
                placeholder="e.g. Ama Serwaah" 
                className="h-14 bg-white/[0.03] border-white/5 hover:border-white/10 focus:border-primary/50 rounded-2xl font-black px-6" 
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-1">Phone Number</label>
                <Input 
                  value={formPhone} 
                  onChange={(e) => setFormPhone(e.target.value)} 
                  placeholder="+233 24 000 0000" 
                  className="h-14 bg-white/[0.03] border-white/5 hover:border-white/10 focus:border-primary/50 rounded-2xl font-mono px-6 text-sm" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-1">Email Address</label>
                <Input 
                  value={formEmail} 
                  onChange={(e) => setFormEmail(e.target.value)} 
                  type="email"
                  placeholder="name@customer.com" 
                  className="h-14 bg-white/[0.03] border-white/5 hover:border-white/10 focus:border-primary/50 rounded-2xl font-semibold px-6 text-sm" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-1">Loyalty Points Balance</label>
                <Input 
                  value={formPoints} 
                  onChange={(e) => setFormPoints(e.target.value)} 
                  type="number"
                  placeholder="e.g. 100" 
                  className="h-14 bg-white/[0.03] border-white/5 hover:border-white/10 focus:border-primary/50 rounded-2xl font-black px-6 text-sm" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-1">Membership Tier</label>
                <select 
                  value={formTier} 
                  onChange={(e) => setFormTier(e.target.value as any)}
                  className="w-full h-14 bg-slate-900 border border-white/5 focus:border-primary/50 rounded-2xl font-bold px-6 text-sm text-slate-300 outline-none"
                >
                  <option value="Standard">Standard Tier</option>
                  <option value="Silver">Silver Tier</option>
                  <option value="Gold">Gold Tier</option>
                  <option value="VIP">VIP Tier</option>
                </select>
              </div>
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
                {editingCustomer ? "Save Changes" : "Register Customer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmAction 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Remove customer?"
        description="Are you sure you want to remove this customer? This will delete their profile and points history."
        confirmText="Yes, Remove"
        variant="destructive"
      />
    </div>
  );
}
