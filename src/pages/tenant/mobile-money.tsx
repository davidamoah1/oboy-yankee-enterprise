import React, { useState } from "react";
import { toast } from "sonner";
import { 
  Smartphone, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter, 
  Download, 
  RefreshCcw,
  ShieldCheck,
  CreditCard,
  Wallet,
  Zap,
  TrendingUp,
  History,
  MoreVertical,
  ArrowRightLeft,
  FileSearch,
  ExternalLink
} from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const INITIAL_MOMO_TRANSACTIONS = [
  { id: "TX-998273", type: "Inward", provider: "MTN", amount: 450.00, status: "Completed", client: "Kwame Mensah", date: "2026-05-11 10:45" },
  { id: "TX-998274", type: "Outward", provider: "Telecel", amount: 1200.00, status: "Completed", client: "Supplier B", date: "2026-05-11 09:30" },
  { id: "TX-998275", type: "Inward", provider: "AirtelTigo", amount: 85.00, status: "Pending", client: "Ama Serwaa", date: "2026-05-11 08:15" },
  { id: "TX-998276", type: "Inward", provider: "MTN", amount: 220.00, status: "Failed", client: "System Test", date: "2026-05-10 22:00" },
  { id: "TX-998277", type: "Inward", provider: "MTN", amount: 1500.00, status: "Completed", client: "Bulk Order Hub", date: "2026-05-10 18:45" },
];

export default function MobileMoneyPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [transactions, setTransactions] = useState(INITIAL_MOMO_TRANSACTIONS);
  const [search, setSearch] = useState("");
  
  // Ghana MoMo form states
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [detectedProvider, setDetectedProvider] = useState<"MTN" | "Telecel" | "AirtelTigo" | "">("");
  const [clientName, setClientName] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // USSD Simulation engine states
  const [ussdInput, setUssdInput] = useState("");
  const [ussdState, setUssdState] = useState<{
    text: string;
    stage: string;
    inputRequired: boolean;
    provider: string;
  } | null>(null);

  const triggerUSSDDialer = (shortcode: string) => {
    let text = "";
    let provider = "";
    if (shortcode === '*170#') {
      provider = "MTN";
      text = "MTN MobileMoney:\n1) Transfer Money\n2) MomoPay & PayBill\n3) Airtime & Bundle\n4) Allow Cash Out\n5) My Wallet / Check Balance";
    } else if (shortcode === '*110#') {
      provider = "Telecel";
      text = "Telecel Cash:\n1) Send Money\n2) Withdraw Cash\n3) Buy Airtime\n4) Check Wallet Balance\n5) Generate Token";
    } else {
      provider = "AirtelTigo";
      text = "AirtelTigo Money:\n1) Send Cash\n2) Check Balance\n3) Withdraw\n4) Buy Bundles";
    }
    setUssdInput("");
    setUssdState({
      text,
      stage: "menu",
      inputRequired: true,
      provider
    });
    toast.info(`USSD Dialer: Initializing carrier link of ${provider}...`);
  };

  const handleUSSDAction = () => {
    if (!ussdState) return;
    const choice = ussdInput.trim();
    setUssdInput("");

    if (ussdState.stage === "menu") {
      if (ussdState.provider === "MTN") {
        if (choice === "5") {
          setUssdState({
            text: "MTN MobileMoney:\nEnter GHS Merchant PIN to authorize balance checkout:",
            stage: "pin",
            inputRequired: true,
            provider: "MTN"
          });
        } else if (choice === "4") {
          setUssdState({
            text: "Allow Cash Out:\n1) Yes\n2) No",
            stage: "cashout",
            inputRequired: true,
            provider: "MTN"
          });
        } else {
          setUssdState({
            text: "MTN MobileMoney:\nThis branch is restricted to wallet balances check and Cash Out authorizations in checkout sandbox.",
            stage: "info",
            inputRequired: false,
            provider: "MTN"
          });
          setTimeout(() => setUssdState(null), 4000);
        }
      } else if (ussdState.provider === "Telecel") {
        if (choice === "4") {
          setUssdState({
            text: "Telecel Cash:\nEnter 4-Digit Wallet Security PIN:",
            stage: "pin",
            inputRequired: true,
            provider: "Telecel"
          });
        } else {
          setUssdState({
            text: "Telecel Cash:\nSimulated dial service limited to safety checks.",
            stage: "info",
            inputRequired: false,
            provider: "Telecel"
          });
          setTimeout(() => setUssdState(null), 4000);
        }
      } else {
        // AirtelTigo
        if (choice === "2") {
          setUssdState({
            text: "AirtelTigo Balances:\nEnter 4-Digit PIN to authorize balance check:",
            stage: "pin",
            inputRequired: true,
            provider: "AirtelTigo"
          });
        } else {
          setUssdState({
            text: "AirtelTigo Money:\nSimulation successfully linked to carrier node.",
            stage: "info",
            inputRequired: false,
            provider: "AirtelTigo"
          });
          setTimeout(() => setUssdState(null), 4000);
        }
      }
    } else if (ussdState.stage === "pin") {
      const balance = ussdState.provider === "MTN" ? "GH₵ 42,150.80" : ussdState.provider === "Telecel" ? "GH₵ 12,400.00" : "GH₵ 8,750.25";
      setUssdState({
        text: `Secure Authorization Success!\n\nYour current active retail account balance is:\n${balance}\n\nLast sync complete. SME Node integrity: 100%`,
        stage: "final",
        inputRequired: false,
        provider: ussdState.provider
      });
      setTimeout(() => setUssdState(null), 6000);
    } else if (ussdState.stage === "cashout") {
      setUssdState({
        text: "Allow Cash Out state: ENABLED\n\nYou can now instruct the customer to initialize cardless withdrawal with Ghana agents.",
        stage: "final",
        inputRequired: false,
        provider: ussdState.provider
      });
      setTimeout(() => setUssdState(null), 5000);
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPhoneNumber(val);
    const clean = val.replace(/\D/g, "");
    if (clean.length >= 3) {
      const prefix = clean.substring(0, 3);
      if (["024", "054", "055", "059", "025", "053"].includes(prefix)) {
        setDetectedProvider("MTN");
      } else if (["020", "050"].includes(prefix)) {
        setDetectedProvider("Telecel");
      } else if (["026", "056", "027", "057"].includes(prefix)) {
        setDetectedProvider("AirtelTigo");
      } else {
        setDetectedProvider("");
      }
    } else {
      setDetectedProvider("");
    }
  };

  const triggerCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid 10-digit Ghanaian mobile number.");
      return;
    }
    if (!detectedProvider) {
      toast.error("Unrecognized carrier prefix. Use standard shortcodes (e.g. 024, 020, 026).");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid GHS collection amount.");
      return;
    }
    if (!clientName) {
      toast.error("Customer name is required for reference auditing.");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading(`Dispatching API collection trigger to ${detectedProvider} MoMo Gateway...`);

    // Simulate standard USSD callback & verification cycle (reconciliation tracking)
    setTimeout(() => {
      const txId = `TX-${Math.floor(100000 + Math.random() * 90000).toString()}`;
      const newTx = {
        id: txId,
        type: "Inward",
        provider: detectedProvider,
        amount: Number(amount),
        status: "Pending",
        client: clientName,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      setTransactions(prev => [newTx, ...prev]);
      toast.success("Push Prompt successfully sent to user's device! Awaiting USSD feedback.", { id: loadingToast });
      setShowCollectModal(false);
      setIsSubmitting(false);

      // Simulate live carrier webhook resolution (Aesthetic reconciliation flow)
      setTimeout(() => {
        setTransactions(prev => prev.map(t => t.id === txId ? { ...t, status: "Completed" } : t));
        toast.success(`Transaction ${txId} successfully auto-reconciled with ${detectedProvider} network nodes.`);
      }, 6000);

      // Clean fields
      setPhoneNumber("");
      setDetectedProvider("");
      setClientName("");
      setAmount("");
    }, 2000);
  };

  const filteredTransactions = transactions.filter(tx => {
    // Tab filtering
    if (activeTab === "received" && tx.type !== "Inward") return false;
    if (activeTab === "payments" && tx.type !== "Outward") return false;
    
    // Search filtering
    const s = search.toLowerCase();
    return (
      tx.id.toLowerCase().includes(s) ||
      tx.client.toLowerCase().includes(s) ||
      tx.provider.toLowerCase().includes(s)
    );
  });

  return (
    <div className="p-6 sm:p-10 space-y-10 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <div className="h-5 w-1 bg-amber-500 rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground italic text-amber-500/80">FinTech Hub</span>
           </div>
           <h1 className="text-4xl font-black italic tracking-tighter uppercase text-foreground leading-none">
             MoMo <span className="text-amber-500 italic">Manager</span>
           </h1>
        </div>
        <div className="flex gap-4">
           <Button 
            variant="outline" 
            onClick={() => {
              toast.info("Connecting to networks...");
              setTimeout(() => toast.success("Ghana MoMo network link verified (MTN, Telecel, AirtelTigo)."), 1500);
            }}
            className="h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 border-amber-500/20 text-amber-500 hover:bg-amber-500/5 cursor-pointer"
           >
              <RefreshCcw className="h-4 w-4" /> Refresh Connection
           </Button>
           <Button 
            onClick={() => setShowCollectModal(true)}
            className="h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-amber-500/20 bg-amber-500 hover:bg-amber-600 border-none text-black cursor-pointer"
           >
              <CreditCard className="h-4 w-4" /> Collect My Money
           </Button>
        </div>
      </div>

      {/* Wallet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {/* MTN Section */}
         <Card className="border-none bg-gradient-to-br from-amber-400 to-amber-600 shadow-2xl rounded-[40px] p-1 group hover:scale-[1.02] transition-all">
            <div className="bg-slate-900/40 backdrop-blur-xl h-full w-full rounded-[38px] p-10 relative overflow-hidden">
               <div className="absolute -top-10 -right-10 h-32 w-32 bg-amber-500/10 rounded-full blur-3xl" />
               <div className="flex justify-between items-start mb-12">
                  <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center text-white backdrop-blur-md">
                     <Smartphone className="h-7 w-7" />
                  </div>
                  <Badge className="bg-white/10 text-white border-none uppercase text-[9px] px-3 font-black tracking-widest">MTN Ghana</Badge>
               </div>
               <div className="text-[10px] font-black uppercase tracking-widest text-amber-500/60 italic mb-2">Current Balance</div>
               <div className="text-4xl font-black italic tracking-tighter uppercase text-white mb-6">GH₵ 42,150.80</div>
               <div className="flex items-center gap-2 text-xs font-bold text-amber-100/60 uppercase tracking-widest">
                  <ShieldCheck className="h-4 w-4" /> Transaction Secure
               </div>
            </div>
         </Card>

         {/* Telecel Section */}
         <Card className="border-none bg-gradient-to-br from-rose-500 to-rose-700 shadow-2xl rounded-[40px] p-1 group hover:scale-[1.02] transition-all">
            <div className="bg-slate-900/40 backdrop-blur-xl h-full w-full rounded-[38px] p-10 relative overflow-hidden">
               <div className="absolute -top-10 -right-10 h-32 w-32 bg-rose-500/10 rounded-full blur-3xl" />
               <div className="flex justify-between items-start mb-12">
                  <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center text-white backdrop-blur-md">
                     <Zap className="h-7 w-7" />
                  </div>
                  <Badge className="bg-white/10 text-white border-none uppercase text-[9px] px-3 font-black tracking-widest">Telecel Cash</Badge>
               </div>
               <div className="text-[10px] font-black uppercase tracking-widest text-rose-500/60 italic mb-2">Current Balance</div>
               <div className="text-4xl font-black italic tracking-tighter uppercase text-white mb-6">GH₵ 12,400.00</div>
               <div className="flex items-center gap-2 text-xs font-bold text-rose-100/60 uppercase tracking-widest">
                  <History className="h-4 w-4" /> Last Sync: 2m ago
               </div>
            </div>
         </Card>

         {/* AirtelTigo Section */}
         <Card className="border-none bg-gradient-to-br from-blue-500 to-blue-700 shadow-2xl rounded-[40px] p-1 group hover:scale-[1.02] transition-all">
            <div className="bg-slate-900/40 backdrop-blur-xl h-full w-full rounded-[38px] p-10 relative overflow-hidden">
               <div className="absolute -top-10 -right-10 h-32 w-32 bg-blue-500/10 rounded-full blur-3xl" />
               <div className="flex justify-between items-start mb-12">
                  <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center text-white backdrop-blur-md">
                     <Wallet className="h-7 w-7" />
                  </div>
                  <Badge className="bg-white/10 text-white border-none uppercase text-[9px] px-3 font-black tracking-widest">AirtelTigo</Badge>
               </div>
               <div className="text-[10px] font-black uppercase tracking-widest text-blue-500/60 italic mb-2">Current Balance</div>
               <div className="text-4xl font-black italic tracking-tighter uppercase text-white mb-6">GH₵ 8,750.25</div>
               <div className="flex items-center gap-2 text-xs font-bold text-blue-100/60 uppercase tracking-widest">
                  <TrendingUp className="h-4 w-4" /> +12% growth today
               </div>
            </div>
         </Card>
      </div>

      {/* Merchant USSD Dial & Sandbox Checker */}
      <Card className="border-none bg-gradient-to-br from-slate-900 via-slate-950 to-black/90 p-1 shadow-2xl rounded-[40px] border border-white/5">
         <div className="bg-slate-900/30 backdrop-blur-xl rounded-[38px] p-6 sm:p-8 flex flex-col xl:flex-row gap-8 items-center justify-between">
           <div className="space-y-3.5 xl:max-w-2xl">
             <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider">Telecom USSD Dialer Simulation</span>
             </div>
             <h3 className="text-xl sm:text-2xl font-black italic uppercase text-slate-100 leading-none">
               Manual Balance & Webhook <span className="text-amber-500">Resolver Sandbox</span>
             </h3>
             <p className="text-xs text-slate-400 font-bold leading-relaxed max-w-xl">
               West African retail operations require cashiers to dial quick shortcodes to override network dropouts or verify client deposits manually. Replicate dialing standard telecom gateways to cross-reconcile transactions!
             </p>
             <div className="flex flex-wrap gap-2.5 pt-2">
               <Button
                 onClick={() => triggerUSSDDialer('*170#')}
                 className="h-9 px-4 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black text-[10px] font-black uppercase tracking-wider cursor-pointer"
               >
                 Dial MTN (*170#)
               </Button>
               <Button
                 onClick={() => triggerUSSDDialer('*110#')}
                 className="h-9 px-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black uppercase tracking-wider cursor-pointer"
               >
                 Dial Telecel (*110#)
               </Button>
               <Button
                 onClick={() => triggerUSSDDialer('*150#')}
                 className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-wider cursor-pointer"
               >
                 Dial AirtelTigo (*150#)
               </Button>
             </div>
           </div>

           {/* Animated phone element mimicking USSD gray network menu popup */}
           <div className="relative w-full sm:w-80 h-[280px] bg-slate-950 rounded-[32px] p-4 border-2 border-slate-900 shadow-2xl flex flex-col justify-between shrink-0 overflow-hidden select-none">
             {/* Notch */}
             <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full z-10" />
             
             {/* Dial Display / Simulation body */}
             <div className="flex-1 rounded-[24px] bg-black p-4 flex flex-col justify-end relative">
               
               {/* USSD Dialog Overlays */}
               {ussdState ? (
                 <motion.div 
                   initial={{ scale: 0.9, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   className="absolute inset-x-3 bottom-1 bg-[#2d2d30] border border-white/10 rounded-2xl p-4 shadow-2xl z-25 text-white flex flex-col space-y-3"
                 >
                   <p className="text-[10px] font-mono whitespace-pre-line text-slate-200 leading-relaxed font-bold">
                     {ussdState.text}
                   </p>
                   
                   {ussdState.inputRequired && (
                     <div className="space-y-2">
                       <Input 
                         placeholder="Type choice and click send"
                         value={ussdInput}
                         onChange={(e) => setUssdInput(e.target.value)}
                         className="h-8 bg-black/40 border-white/5 rounded-lg text-xs font-mono font-bold text-slate-100 px-3 pl-3"
                         onKeyDown={(e) => {
                           if (e.key === 'Enter') handleUSSDAction();
                         }}
                       />
                       <div className="flex gap-2">
                         <button 
                           onClick={() => setUssdState(null)}
                           className="w-1/2 py-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                         >
                           Cancel
                         </button>
                         <button 
                           onClick={handleUSSDAction}
                           className="w-1/2 py-2 rounded-xl bg-yellow-400 text-black hover:bg-yellow-500 text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                         >
                           Send
                         </button>
                       </div>
                     </div>
                   )}
                 </motion.div>
               ) : (
                 <div className="flex flex-col items-center justify-center h-full space-y-2 p-4 text-center text-slate-700">
                   <Smartphone className="h-10 w-10 text-slate-800 animate-pulse" />
                   <p className="text-[8px] font-black uppercase tracking-widest leading-normal">Interactive Terminal Emulator</p>
                   <p className="text-[7px] text-slate-600 font-bold uppercase italic max-w-[180px]">Dial any telecom shortcode above to query logs natively...</p>
                 </div>
               )}

               {/* Lock Indicator */}
               <div className="text-center pt-2">
                 <span className="text-[6px] font-black text-slate-800 uppercase tracking-widest leading-none block">SME SECURED TRANSACTIONS</span>
               </div>
             </div>
           </div>
         </div>
      </Card>

      {/* Transaction Manager */}
      <Card className="border-none bg-card/40 backdrop-blur-md shadow-2xl rounded-[50px] overflow-hidden border border-white/5">
         <div className="p-10 border-b border-white/5 flex flex-col md:flex-row gap-8 justify-between items-center">
            <div className="flex gap-4">
               {["all", "received", "collections", "payments"].map((tab) => (
                  <button 
                     key={tab}
                     onClick={() => setActiveTab(tab)}
                     className={cn(
                        "h-12 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer",
                        activeTab === tab ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" : "text-slate-500 hover:text-slate-300"
                     )}
                  >
                     {tab} History
                  </button>
               ))}
            </div>
            <div className="relative w-full md:w-80">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search records..." 
                  className="h-12 pl-11 bg-white/5 border-none rounded-xl italic font-bold" 
               />
            </div>
         </div>
         <CardContent className="p-0">
            <Table>
               <TableHeader className="bg-white/5">
                  <TableRow className="border-none hover:bg-transparent">
                     <TableHead className="py-8 px-10 text-[9px] font-black uppercase tracking-widest italic text-slate-500">ID</TableHead>
                     <TableHead className="py-8 text-[9px] font-black uppercase tracking-widest italic text-slate-500">Service</TableHead>
                     <TableHead className="py-8 text-[9px] font-black uppercase tracking-widest italic text-slate-500">Client Name</TableHead>
                     <TableHead className="py-8 text-[9px] font-black uppercase tracking-widest italic text-slate-500">Status</TableHead>
                     <TableHead className="py-8 text-[9px] font-black uppercase tracking-widest italic text-slate-500">Amount</TableHead>
                     <TableHead className="py-8 text-[9px] font-black uppercase tracking-widest italic text-slate-500">Date</TableHead>
                     <TableHead className="py-8 px-10 text-right text-[9px] font-black uppercase tracking-widest italic text-slate-500">Actions</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {filteredTransactions.map((tx) => (
                     <TableRow key={tx.id} className="group hover:bg-white/[0.03] transition-all border-b border-white/5">
                        <TableCell className="px-10 py-8 font-black italic text-base text-slate-300 tracking-tight">{tx.id}</TableCell>
                        <TableCell>
                           <div className="flex items-center gap-3">
                              <div className={cn(
                                 "h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-black",
                                 tx.provider === "MTN" ? "bg-amber-500 text-black" : 
                                 tx.provider === "Telecel" ? "bg-rose-600 text-white" : "bg-blue-600 text-white"
                              )}>
                                 {tx.provider.charAt(0)}
                              </div>
                              <span className="font-bold text-xs text-slate-100">{tx.provider}</span>
                           </div>
                        </TableCell>
                        <TableCell className="font-black italic text-slate-400 uppercase tracking-tight text-sm">{tx.client}</TableCell>
                        <TableCell>
                           <div className="flex items-center gap-2">
                              {tx.status === "Pending" ? (
                                <Badge className="bg-amber-500/10 text-amber-500 border-none uppercase text-[8px] font-black py-1 px-2.5 animate-pulse">Pending Auth</Badge>
                              ) : tx.status === "Failed" ? (
                                <Badge className="bg-red-500/10 text-red-500 border-none uppercase text-[8px] font-black py-1 px-2.5">Failed</Badge>
                              ) : tx.type === "Inward" ? (
                                 <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                       <ArrowDownLeft className="h-4 w-4" />
                                    </div>
                                    <span className="text-[9px] font-black uppercase text-emerald-500">Inbound</span>
                                 </div>
                              ) : (
                                 <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                                       <ArrowUpRight className="h-4 w-4" />
                                    </div>
                                    <span className="text-[9px] font-black uppercase text-rose-500">Payout</span>
                                 </div>
                              )}
                           </div>
                        </TableCell>
                        <TableCell className={cn(
                           "font-black italic text-lg tracking-tighter",
                           tx.type === "Inward" ? "text-slate-100" : "text-rose-400"
                        )}>
                           {tx.type === "Inward" ? "+" : "-"} GH₵ {Number(tx.amount).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-[10px] font-bold text-slate-600 italic uppercase">{tx.date}</TableCell>
                        <TableCell className="text-right px-10">
                           <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                 <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:bg-amber-500 hover:text-black rounded-xl transition-all cursor-pointer">
                                    <MoreVertical className="h-5 w-5" />
                                 </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-64 p-3 rounded-2xl bg-[#111114] border-white/5 shadow-2xl backdrop-blur-3xl">
                                 <DropdownMenuItem 
                                    onClick={() => toast.info(`Fetching audit logs on core transaction reference: ${tx.id}...`)}
                                    className="h-12 rounded-xl focus:bg-amber-500/10 focus:text-amber-500 transition-all gap-3 font-black uppercase tracking-widest text-[10px] cursor-pointer"
                                 >
                                    <FileSearch className="h-4 w-4" /> Check Record
                                 </DropdownMenuItem>
                                 <DropdownMenuItem 
                                    onClick={() => toast.info(`Carrier Route Status: OK. Hop Latency: 42ms.`)}
                                    className="h-12 rounded-xl focus:bg-amber-500/10 focus:text-amber-500 transition-all gap-3 font-black uppercase tracking-widest text-[10px] cursor-pointer"
                                 >
                                    <ExternalLink className="h-4 w-4" /> View Info
                                 </DropdownMenuItem>
                                 <DropdownMenuSeparator className="bg-white/5 my-2" />
                                 <DropdownMenuItem 
                                    onClick={() => toast.error("Refund requests must be filed via official channels.")}
                                    className="h-12 rounded-xl focus:bg-red-500/10 focus:text-red-500 transition-all gap-3 font-black uppercase tracking-widest text-[10px] text-red-500 cursor-pointer"
                                 >
                                    <ArrowRightLeft className="h-4 w-4" /> Request Refund
                                 </DropdownMenuItem>
                              </DropdownMenuContent>
                           </DropdownMenu>
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </CardContent>
      </Card>

      {/* Ghana Mobile Money Collection Modal */}
      {showCollectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative max-w-md w-full bg-slate-900 border border-white/10 rounded-[32px] p-8 shadow-2xl overflow-hidden text-white"
          >
            <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-amber-500 via-rose-500 to-blue-500" />
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-black tracking-tighter uppercase italic text-white leading-none mb-1">
                  Trigger MoMo <span className="text-amber-500">Collection</span>
                </h2>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Instant GHS Telecom Prompt</p>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => setShowCollectModal(false)}
                className="h-8 w-8 hover:bg-white/10 text-slate-400 hover:text-white rounded-full p-0 flex items-center justify-center text-xs"
              >
                ✕
              </Button>
            </div>

            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Dispatch an instant secure push-to-pay authorization instruction directly to any Ghanaian customer's mobile money wallet over active telecom APIs.
            </p>

            <form onSubmit={triggerCollection} className="space-y-4">
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                  Ghana Mobile Number (024xxxxxxx)
                </label>
                <div className="relative">
                  <Input 
                    type="text" 
                    value={phoneNumber}
                    onChange={handlePhoneNumberChange}
                    maxLength={10}
                    placeholder="e.g. 0244123456"
                    disabled={isSubmitting}
                    className="h-11 bg-white/5 border-white/5 rounded-xl text-xs font-bold font-mono tracking-widest pl-4 text-white placeholder-slate-600 focus:ring-1 focus:ring-amber-500"
                  />
                  {detectedProvider && (
                    <span className={cn(
                      "absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md",
                      detectedProvider === "MTN" ? "bg-amber-500 text-black" :
                      detectedProvider === "Telecel" ? "bg-rose-600 text-white" : "bg-blue-600 text-white"
                    )}>
                      {detectedProvider}
                    </span>
                  )}
                </div>
                {phoneNumber && phoneNumber.length >= 3 && !detectedProvider && (
                  <p className="text-[9px] text-rose-500 font-bold mt-1 uppercase tracking-wider">Unrecognized Ghanaian network prefix.</p>
                )}
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                  Customer Name
                </label>
                <Input 
                  type="text" 
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Kwame Mensah"
                  disabled={isSubmitting}
                  className="h-11 bg-white/5 border-white/5 rounded-xl text-xs font-bold pl-4 text-white placeholder-slate-600 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                  Collection Amount (GH₵)
                </label>
                <Input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  disabled={isSubmitting}
                  className="h-11 bg-white/5 border-white/5 rounded-xl text-xs font-mono font-bold pl-4 text-white placeholder-slate-600 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setShowCollectModal(false)}
                  disabled={isSubmitting}
                  className="w-1/2 h-11 border-white/5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer text-white"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting || !detectedProvider}
                  className="w-1/2 h-11 bg-amber-500 text-black hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/10 cursor-pointer"
                >
                  {isSubmitting ? "Triggering API..." : "Send push prompt"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
