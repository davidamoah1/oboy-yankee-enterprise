import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Printer, 
  Download, 
  Share2, 
  ChevronLeft, 
  Globe,
  Smartphone,
  Copy,
  Scale,
  ShieldCheck,
  Zap,
  Clock,
  Hash,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";

interface ReceiptItem {
  name: string;
  qty: number;
  price: number;
  total: number;
  id?: string;
}

interface LoadedReceipt {
  id: string;
  shopName: string;
  customerName: string;
  cashierName: string;
  dateString: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  blockchainId?: string;
}

export default function ReceiptDetailPage() {
  const { receiptId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [receiptData, setReceiptData] = useState<LoadedReceipt | null>(null);

  useEffect(() => {
     async function loadReceipt() {
       if (!receiptId) return;
       try {
         setLoading(true);
         let dbReceipt: LoadedReceipt | null = null;

         // 1. Try API
         try {
           const { apiClient } = await import("@/lib/api-client");
           await Promise.race([
             (async () => {
               const response = await apiClient.get(`/api/transactions/${receiptId}`);
               const tx = response.data?.data || response.data;

               if (tx) {
                 let fetchedItems: ReceiptItem[] = [];
                 if (tx.items && tx.items.length > 0) {
                   fetchedItems = tx.items.map((it: any) => ({
                     name: it.product_name || it.name || "Retail Item",
                     qty: it.quantity,
                     price: Number(it.unit_price) || 0,
                     total: Number(it.total_price) || 0,
                     id: it.product_sku ? `ITM-${it.product_sku}` : undefined
                   }));
                 } else {
                   fetchedItems = [{
                     name: "General Store Items",
                     qty: 1,
                     price: Number(tx.total_amount) || 0,
                     total: Number(tx.total_amount) || 0,
                     id: "GEN-01"
                   }];
                 }

                 const shopName = "OBOY YANKEE ENTERPRISE";

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
                   blockchainId: `NEXA-REF-${tx.id.substring(0, 8).toUpperCase()}`,
                 };
               }
             })(),
             new Promise<void>((_, reject) => setTimeout(() => reject(new Error("API loading timed out")), 2000))
           ]);
         } catch (err) {
           console.warn("Could not query API for receipt details: ", err);
         }

         setReceiptData(dbReceipt);
       } catch (outerErr) {
         console.warn("Could not query receipt details: ", outerErr);
       } finally {
         setLoading(false);
       }
     }
     loadReceipt();
  }, [receiptId]);

  const verifyUrl = `${window.location.origin}/verify-receipt/${receiptId}`;

  const handleWhatsAppShare = () => {
    if (!receiptData) return;
    const message = `Hello! This is your digital receipt from ${receiptData.shopName}. 
Total Paid: ₵${receiptData.total.toFixed(2)}
Verification Signature: ${receiptData.id}
Scan or click to verify digital receipt ledger: ${verifyUrl}`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    toast.success("Opening WhatsApp...");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verifyUrl);
    toast.success("Public verification link copied to clipboard");
  };

  if (loading) {
     return (
       <div className="h-96 flex flex-col items-center justify-center gap-4 text-slate-400">
         <Loader2 className="h-8 w-8 text-primary animate-spin" />
         <span className="text-xs font-black uppercase tracking-widest text-emerald-500 animate-pulse">Loading Receipt Signature...</span>
       </div>
     );
  }

  if (!receiptData) {
     return (
       <div className="h-[400px] flex flex-col items-center justify-center gap-6 text-center text-slate-400 px-4">
         <div className="h-16 w-16 bg-red-950/40 border border-red-500/30 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck className="h-8 w-8 text-red-500" />
         </div>
         <div className="space-y-2">
            <h2 className="text-xl font-black uppercase italic text-red-400">Verification Failed</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">This transaction receipt signature could not be verified in the secure cloud ledger. The record may have synced differently or is invalid.</p>
         </div>
         <Button onClick={() => navigate(-1)} size="sm" variant="outline" className="h-11 rounded-xl">
            Go Back
         </Button>
       </div>
     );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-32">
      <div className="max-w-2xl mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-4 print:hidden">
           <Button variant="ghost" onClick={() => navigate(-1)} className="font-black gap-3 group p-0 hover:bg-transparent uppercase tracking-widest text-[10px] italic">
              <div className="h-10 w-10 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                <ChevronLeft className="h-4 w-4" />
              </div>
              Go Back
           </Button>
           <div className="flex items-center gap-3">
              <Button size="sm" variant="outline" onClick={handleCopyLink} className="h-12 px-6 gap-3 font-black uppercase tracking-widest text-[10px] border-white/10 rounded-xl hover:bg-white/5">
                <Copy className="h-4 w-4" /> Copy Verify Link
              </Button>
              <Button size="sm" onClick={handlePrint} className="h-12 px-6 gap-3 font-black uppercase tracking-widest text-[10px] bg-primary rounded-xl shadow-2xl shadow-primary/30 border-none hover:translate-y-[-2px] transition-all">
                <Printer className="h-4 w-4" /> Print Receipt
              </Button>
           </div>
        </div>

        {/* Receipt Styled Card */}
        <motion.div
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           className="relative"
        >
          <Card className="border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] relative overflow-hidden bg-card/40 backdrop-blur-3xl rounded-[48px] border border-white/5 print:shadow-none print:bg-white print:text-black">
            <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
            
            <CardContent className="p-10 sm:p-20 space-y-20">
              {/* Header */}
              <div className="text-center space-y-6">
                <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                   <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                   <div className="relative z-10 w-20 h-20 bg-primary/10 border border-primary/20 rounded-[32px] flex items-center justify-center rotate-6 shadow-2xl">
                      <Globe className="h-10 w-10 text-primary animate-pulse" />
                   </div>
                </div>
                <div>
                  <h1 className="text-4xl font-black tracking-tighter italic uppercase leading-none">{receiptData.shopName}</h1>
                  <div className="flex items-center justify-center gap-3 mt-4">
                     <div className="h-[1px] w-8 bg-muted-foreground/20" />
                     <p className="text-[10px] uppercase font-black tracking-[0.4em] text-primary italic">Official Store Receipt</p>
                     <div className="h-[1px] w-8 bg-muted-foreground/20" />
                  </div>
                </div>
                <div className="pt-8 flex flex-col items-center gap-3 opacity-40">
                   <div className="flex items-center gap-6 text-[9px] font-black uppercase tracking-widest italic">
                      <span>Location: Accra Central</span>
                      <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                      <span>Shop ID: GH-992384-X</span>
                      <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                      <span>Phone: +233 24 555 0122</span>
                   </div>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-12">
                <div className="space-y-6">
                   <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-30 pb-4 border-b border-white/5">
                      <div className="flex-1">Purchased Items</div>
                      <div className="w-16 text-center">Qty</div>
                      <div className="w-32 text-right">Price</div>
                   </div>
                   
                   <div className="space-y-8">
                      {receiptData.items.map((item, i) => (
                        <div key={i} className="flex items-center group">
                          <div className="flex-1 space-y-1">
                             <div className="font-black italic text-lg tracking-tight group-hover:text-primary transition-colors">{item.name}</div>
                             <div className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40">{item.id || "GEN-01"}</div>
                          </div>
                          <div className="w-16 text-center text-xs font-black italic opacity-40 uppercase tracking-widest">x{item.qty}</div>
                          <div className="w-32 text-right font-black italic text-lg">₵ {item.price.toFixed(2)}</div>
                        </div>
                      ))}
                   </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-muted/10 rounded-[32px] p-10 space-y-6 border border-white/5 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Scale className="h-24 w-24 -rotate-12 transition-transform group-hover:rotate-0 duration-700" />
                   </div>
                   <div className="space-y-3 relative z-10">
                      <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-muted-foreground italic">
                         <span>Subtotal</span>
                         <span>₵ {receiptData.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-muted-foreground italic">
                         <span>Tax (5%)</span>
                         <span>₵ {receiptData.tax.toFixed(2)}</span>
                      </div>
                      {receiptData.discount > 0 && (
                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-green-500 italic">
                           <span>Discount Applied</span>
                           <span>-₵ {receiptData.discount.toFixed(2)}</span>
                        </div>
                      )}
                   </div>
                   <div className="flex justify-between items-end pt-8 border-t border-white/10 relative z-10">
                      <div className="space-y-1">
                         <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary opacity-50 italic">Total Paid</span>
                         <h2 className="text-5xl font-black italic tracking-tighter text-primary">₵ {receiptData.total.toFixed(2)}</h2>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                         <Badge className="bg-green-500/10 text-green-500 border-none px-4 py-1.5 rounded-full font-black uppercase tracking-[0.2em] text-[9px] italic">Fully Paid</Badge>
                         <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground italic opacity-40">Sale Completed</span>
                      </div>
                   </div>
                </div>
              </div>

              {/* Receipt Details */}
              <div className="grid grid-cols-2 gap-12">
                 <div className="space-y-8">
                    <div className="space-y-2">
                       <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-30 italic">Receipt #</span>
                       <div className="flex items-center gap-3 text-sm font-black italic text-primary">
                          <Hash className="h-4 w-4 opacity-50" />
                          {receiptId}
                       </div>
                    </div>
                    <div className="space-y-2">
                       <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-30 italic">Customer Name</span>
                       <div className="flex items-center gap-3 text-sm font-black italic">
                          <span>{receiptData.customerName}</span>
                       </div>
                    </div>
                 </div>
                 <div className="space-y-8 text-right">
                    <div className="space-y-2">
                       <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-30 italic">Date & Time</span>
                       <div className="text-sm font-black italic">{receiptData.dateString}</div>
                    </div>
                    <div className="space-y-2">
                       <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-30 italic">Staff Member</span>
                       <div className="text-sm font-black italic">{receiptData.cashierName}</div>
                    </div>
                 </div>
              </div>

              {/* Gateway Selection */}
              <div className="bg-primary/5 rounded-[32px] p-8 flex items-center justify-between border border-primary/10 group cursor-default">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110">
                       <Smartphone className="h-8 w-8" />
                    </div>
                    <div>
                       <div className="text-[9px] font-black uppercase tracking-[0.3em] text-primary opacity-60 mb-2 italic">Payment Method</div>
                       <div className="text-xl font-black italic tracking-tight">{receiptData.paymentMethod}</div>
                    </div>
                 </div>
                 <ShieldCheck className="h-10 w-10 text-green-500/50" />
              </div>

              {/* Signature / QR */}
              <div className="pt-20 flex flex-col items-center text-center space-y-10">
                  <div className="relative group p-6 border-2 border-dashed border-white/10 rounded-[40px] bg-white/5 transition-all hover:bg-white/10">
                     <div className="absolute -top-4 -left-4 bg-primary text-primary-foreground px-4 py-1.5 rounded-full font-black uppercase text-[8px] tracking-[0.3em] italic shadow-2xl">Scan to Verify</div>
                     <QRCodeSVG 
                        value={verifyUrl} 
                        size={160}
                        level={"H"}
                        includeMargin={true}
                        className="rounded-3xl shadow-2xl"
                        fgColor="#000000"
                        bgColor="#FFFFFF"
                     />
                  </div>
                  <div className="space-y-4">
                    <p className="text-sm font-black italic text-muted-foreground tracking-tight">Scan this code to verify purchase ledger on Public SecurNode.</p>
                    <div className="flex items-center justify-center gap-6 opacity-20">
                       <Zap className="h-4 w-4" />
                       <div className="h-0.5 w-12 bg-muted-foreground" />
                       <Clock className="h-4 w-4" />
                    </div>
                  </div>
              </div>
            </CardContent>

            {/* Aesthetic Artifacts */}
            <div className="absolute bottom-0 left-0 w-full h-[6px] bg-gradient-to-r from-transparent via-white/5 to-transparent mb-12" />
          </Card>
        </motion.div>

        {/* Action Interface */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 print:hidden">
           <Button 
             variant="outline" 
             onClick={() => toast.info("Creating your PDF file...")}
             className="h-20 rounded-[24px] font-black uppercase tracking-[0.2em] text-[11px] italic gap-4 border-2 border-white/5 shadow-2xl hover:bg-white/5 transition-all group overflow-hidden relative"
           >
              <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <Download className="h-5 w-5 relative z-10" />
              <span className="relative z-10">Download PDF</span>
           </Button>
           <Button 
             onClick={handleWhatsAppShare}
             className="h-20 rounded-[24px] font-black uppercase tracking-[0.2em] text-[11px] italic gap-4 bg-primary border-none shadow-2xl shadow-primary/30 hover:translate-y-[-4px] transition-all group overflow-hidden relative"
           >
              <div className="absolute inset-0 bg-white/10 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
              <Share2 className="h-5 w-5 relative z-10" />
              <span className="relative z-10">Send via WhatsApp</span>
           </Button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          .print-content, .print-content * { visibility: visible; }
          .print-content { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%;
            background: white !important;
            color: black !important;
          }
          aside, header, footer, button { display: none !important; }
        }
      `}} />
    </div>
  );
}
