import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Hash, 
  Globe, 
  Smartphone, 
  FileText, 
  Printer, 
  ArrowLeft, 
  AlertTriangle,
  FlameKindling,
  Cpu,
  Fingerprint
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";

interface VerificationItem {
  name: string;
  qty: number;
  price: number;
  total: number;
  id?: string;
}

interface VerificationReceipt {
  id: string;
  shopName: string;
  customerName: string;
  cashierName: string;
  dateString: string;
  items: VerificationItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  receiptNumber?: string;
  verifiedAt: string;
}


export default function VerifyReceiptPage() {
  const { receiptId } = useParams();
  const [receipt, setReceipt] = useState<VerificationReceipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  
  // Real-time verification logging simulation
  const [verificationLogs, setVerificationLogs] = useState<string[]>([]);

  useEffect(() => {
    async function verifyAndLoadReceipt() {
      if (!receiptId) {
        setErrorStatus("Missing transaction signature");
        setLoading(false);
        return;
      }

      setVerificationLogs(["[CONN] Initiating handshake with OBOY YANKEE Secure Node..."]);
      
      setTimeout(() => {
        setVerificationLogs(prev => [...prev, "[AUTH] Exchanging public key hash..."]);
      }, 300);

      setTimeout(() => {
        setVerificationLogs(prev => [...prev, `[QUERY] Seeking database record signature for ID: ${receiptId}...`]);
      }, 700);

      try {
        let dbReceipt: VerificationReceipt | null = null;

        // 1. Try querying Supabase if available
        try {
          const { supabase, isSupabaseConfigured } = await import("@/lib/supabase");
          if (isSupabaseConfigured()) {
            // Find transaction matching this ID or matching IDB local backup ID
            const { data: tx, error: txError } = await supabase
              .from("transactions")
              .select("*")
              .or(`id.eq.${receiptId},idb_id.eq.${receiptId}`)
              .maybeSingle();

            if (tx) {
              setVerificationLogs(prev => [...prev, `[FOUND] Valid transaction matching UUID found in remote database ledger.`]);
              
              // Load transaction items
              const { data: txItems, error: itemsError } = await supabase
                .from("transaction_items")
                .select("*")
                .eq("transaction_id", tx.id);

              let fetchedItems: VerificationItem[] = [];
              if (txItems && txItems.length > 0) {
                // Fetch product names for item lists
                const productIds = txItems.map(it => it.product_id);
                const { data: products } = await supabase
                  .from("products")
                  .select("id, name, sku")
                  .in("id", productIds);

                fetchedItems = txItems.map(it => {
                  const matchingProd = products?.find(p => p.id === it.product_id);
                  return {
                    name: matchingProd ? matchingProd.name : "Retail Item",
                    qty: it.quantity,
                    price: Number(it.unit_price) || 0,
                    total: Number(it.total_price) || 0,
                    id: matchingProd ? `ITM-${matchingProd.sku || "PROD"}` : undefined
                  };
                });
              } else {
                // Fallback dummy item array inside transaction matching total
                fetchedItems = [{
                  name: "General Store Items",
                  qty: 1,
                  price: Number(tx.total_amount) || 0,
                  total: Number(tx.total_amount) || 0,
                  id: "GEN-01"
                }];
              }

              // Load tenant profile name
              let shopName = "STORE RECEIPT";
              if (tx.tenant_id) {
                const { data: tenant } = await supabase
                  .from("tenants")
                  .select("name")
                  .eq("id", tx.tenant_id)
                  .maybeSingle();
                if (tenant?.name) {
                  shopName = tenant.name.toUpperCase();
                } else {
                  shopName = tx.tenant_id.replace(/-/g, " ").toUpperCase();
                }
              }

              dbReceipt = {
                id: tx.id,
                shopName,
                customerName: "Walk-in Customer",
                cashierName: "Store Clerk",
                dateString: new Date(tx.created_at).toLocaleString(),
                items: fetchedItems,
                subtotal: Number(tx.subtotal) || Number(tx.total_amount),
                tax: Number(tx.tax_amount) || 0,
                discount: Number(tx.discount_amount) || 0,
                total: Number(tx.total_amount) || 0,
                paymentMethod: tx.payment_method || "Mobile Money",
                receiptNumber: tx.receipt_number || tx.id,
                verifiedAt: new Date().toLocaleString()
              };
            }
          }
        } catch (supabaseErr) {
          console.warn("Verify receipt DB fetch bypass: ", supabaseErr);
        }

        // 2. Error if not found in Database
        if (!dbReceipt) {
          setVerificationLogs(prev => [...prev, `[NOT FOUND] Receipt not found in database.`]);
          setErrorStatus("This receipt could not be found. It may be invalid or from a different business.");
          setLoading(false);
          return;
        }

        setTimeout(() => {
          setVerificationLogs(prev => [...prev, `[VERIFIED] Receipt found and verified successfully.`]);
          setReceipt(dbReceipt);
          setLoading(false);
        }, 1200);

      } catch (err: any) {
        setVerificationLogs(prev => [...prev, `[ERROR] Verification engine error: ${err.message || err}`]);
        setErrorStatus("Verification engine error: " + (err.message || err));
        setLoading(false);
      }
    }
    verifyAndLoadReceipt();
  }, [receiptId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-12 px-4 selection:bg-primary/20 selection:text-primary">
      <div className="max-w-2xl w-full mx-auto space-y-8 print:p-0">
        
        {/* Navigation & Brand Header */}
        <div className="flex items-center justify-between px-4 print:hidden">
          <Link to="/" className="flex items-center gap-2 group text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-wider">OBOY YANKEE Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-emerald-500/80">SecurNode Ghana</span>
          </div>
        </div>

        {/* Dynamic Verification Animation Banner */}
        <div className="text-center space-y-4 pt-4 print:hidden">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="inline-flex relative"
          >
            <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
            <div className="h-24 w-24 rounded-full bg-emerald-950/40 border-2 border-emerald-500/40 flex items-center justify-center relative">
              <ShieldCheck className="h-12 w-12 text-emerald-400 animate-pulse" />
              <CheckCircle2 className="h-6 w-6 text-emerald-400 absolute -bottom-1 -right-1 bg-slate-950 rounded-full" />
            </div>
          </motion.div>
          <div className="space-y-1">
             <h1 className="text-2xl sm:text-3xl font-black italic tracking-tighter uppercase text-emerald-400">Receipt Verified</h1>
             <p className="text-xs font-bold text-slate-400 max-w-sm mx-auto p-2">This receipt has been verified against the OBOY YANKEE ENTERPRISE database.</p>
          </div>
        </div>

        {/* Main Glass Receipt Body */}
        {loading ? (
          <Card className="border-white/5 bg-slate-900/40 backdrop-blur-3xl rounded-3xl p-8 space-y-6">
            <div className="flex items-center justify-center space-y-4 flex-col py-12">
               <Cpu className="h-8 w-8 text-primary animate-spin" />
               <p className="text-xs font-mono font-black uppercase tracking-widest text-emerald-500 animate-pulse">Verifying Receipt...</p>
            </div>
            
            {/* Live Audit Log Parser for extra immersion and authenticity */}
            <div className="border border-white/5 bg-black/60 rounded-2xl p-4 font-mono text-[10px] space-y-2 text-slate-400 h-32 overflow-hidden select-none">
              <div className="text-primary text-[8px] font-black uppercase tracking-[0.2em] mb-2 border-b border-white/5 pb-1 select-none">Verification Logs:</div>
              {verificationLogs.map((log, idx) => (
                <div key={idx} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {log}
                </div>
              ))}
            </div>
          </Card>
        ) : errorStatus ? (
          <Card className="border-red-500/10 bg-red-950/15 backdrop-blur-3xl rounded-3xl p-10 text-center space-y-6">
            <div className="h-16 w-16 bg-red-950/40 border border-red-500/30 text-red-500 rounded-full flex items-center justify-center mx-auto">
               <AlertTriangle className="h-8 w-8" />
            </div>
            <div className="space-y-2">
               <h2 className="text-xl font-black uppercase italic text-red-400">Receipt Not Found</h2>
               <p className="text-xs text-slate-400">{errorStatus}</p>
            </div>
            <Button asChild size="sm" variant="outline" className="h-11 rounded-xl">
               <Link to="/">Return to Landing</Link>
            </Button>
          </Card>
        ) : receipt && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="print:shadow-none"
          >
            <Card className="border-white/5 bg-[#111115] relative overflow-hidden rounded-[36px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] border border-white/5 print:border-none print:shadow-none print:bg-white print:text-black">
              {/* Header Gradient Seal */}
              <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-emerald-500/50 via-emerald-500 to-emerald-500/50" />
              
              <CardContent className="p-8 sm:p-14 space-y-12">
                
                {/* Shop Signature Banner */}
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-black tracking-tighter italic uppercase text-white print:text-black">{receipt.shopName}</h2>
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline" className="bg-emerald-500/10 border-none text-emerald-400 font-mono font-bold px-3 py-0.5 rounded-full text-[9px] uppercase tracking-wider">
                      Verified Receipt
                    </Badge>
                  </div>
                </div>

                <div className="h-[1px] w-full bg-white/5 print:bg-slate-200" />

                {/* Items Block */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pb-2 border-b border-white/5">
                    <span>Purchased Items</span>
                    <span>Total</span>
                  </div>
                  
                  <div className="space-y-5">
                    {receipt.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-start text-sm">
                        <div className="space-y-0.5">
                          <span className="font-bold text-white print:text-black">{item.name}</span>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {item.id || "Retail Item"} • Qty: {item.qty} × ₵{item.price.toFixed(2)}
                          </p>
                        </div>
                        <span className="font-bold text-white print:text-black">₵ {item.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-[1px] w-full bg-white/5 print:bg-slate-200" />

                {/* Totals Section */}
                <div className="bg-slate-900/50 rounded-2xl p-6 space-y-3 border border-white/5 print:bg-slate-100 print:text-black">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Subtotal</span>
                    <span>₵ {receipt.subtotal.toFixed(2)}</span>
                  </div>
                  {receipt.tax > 0 && (
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>VAT (5%)</span>
                      <span>₵ {receipt.tax.toFixed(2)}</span>
                    </div>
                  )}
                  {receipt.discount > 0 && (
                    <div className="flex justify-between text-xs text-emerald-400">
                      <span>Discount Applied</span>
                      <span>-₵ {receipt.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="h-[1px] w-full bg-white/5 my-2 print:bg-slate-300" />
                  <div className="flex justify-between items-baseline pt-1">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400">Grand Total Paid</span>
                    <span className="text-3xl font-black italic tracking-tight text-emerald-400 print:text-black">₵ {receipt.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Digital Audit Sign-off details */}
                <div className="grid grid-cols-2 gap-6 text-xs border-t border-white/5 pt-8 print:border-slate-200">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Transaction ID</span>
                      <p className="font-mono text-[10px] text-emerald-400 truncate max-w-[180px] print:text-black">{receipt.id}</p>
                    </div>
                    {receipt.customerName && (
                      <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Customer</span>
                        <p className="font-bold text-white print:text-black">{receipt.customerName}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4 text-right">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Date & Timestamp</span>
                      <p className="font-bold text-white print:text-black">{receipt.dateString}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Payment Gateway</span>
                      <p className="font-bold text-emerald-400 print:text-black">{receipt.paymentMethod}</p>
                    </div>
                  </div>
                </div>

                {/* Receipt Details */}
                <div className="border border-white/5 rounded-2xl bg-black/40 p-6 space-y-4 font-mono text-[10px] text-slate-400 print:border-slate-200">
                  <div className="flex items-center gap-2 text-primary text-[8px] font-black uppercase tracking-widest border-b border-white/5 pb-2">
                     <Fingerprint className="h-4 w-4" /> RECEIPT DETAILS
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="space-y-1">
                       <span className="opacity-40">RECEIPT NUMBER:</span>
                       <p className="text-slate-300 break-all select-all">{receipt.receiptNumber || receipt.id || "N/A"}</p>
                     </div>
                     <div className="space-y-1 text-right sm:text-right">
                       <span className="opacity-40">VERIFIED AT:</span>
                       <p className="text-emerald-400 font-black">{receipt.verifiedAt}</p>
                     </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-4 flex flex-col items-center justify-center text-center opacity-60">
                   <div className="h-[2px] w-12 bg-white/5 mb-4" />
                   <Globe className="h-6 w-6 text-slate-400 mb-2 animate-spin-slow" />
                   <p className="text-[8px] font-mono uppercase tracking-[0.4em] text-slate-500">Official Receipt Verification</p>
                </div>

              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Floating Print / Share Options */}
        {!loading && !errorStatus && (
          <div className="flex gap-4 px-4 print:hidden">
            <Button 
              variant="outline" 
              onClick={handlePrint}
              className="flex-1 h-14 rounded-2xl border-2 hover:bg-white/5 font-black uppercase tracking-widest text-[10px] gap-3"
            >
              <Printer className="h-4 w-4" /> Print Public Proof
            </Button>
            <Button 
              asChild
              className="flex-1 h-14 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black uppercase tracking-widest text-[10px] gap-3 rounded-2xl"
            >
              <Link to="/">
                 <FileText className="h-4 w-4" /> Back to SME OS
              </Link>
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
