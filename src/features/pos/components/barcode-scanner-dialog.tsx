import { useState, useEffect, useRef } from "react";
import { 
  Barcode, 
  X, 
  Keyboard, 
  Sparkles, 
  AlertCircle, 
  Check, 
  Scan, 
  Volume2, 
  HelpCircle,
  Lightbulb,
  CornerDownLeft
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

// Web Audio API cash-register style beep generator
export function playScanBeep(volume = 0.08) {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const audioCtx = new AudioCtx();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(950, audioCtx.currentTime); // Pitch
    
    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.12);
  } catch (e) {
    console.warn("[Barcode] AudioContext playback blocked:", e);
  }
}

interface BarcodeScannerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  products: any[];
  addToCart: (product: any) => void;
}

export function BarcodeScannerDialog({ isOpen, onClose, products, addToCart }: BarcodeScannerDialogProps) {
  const [manualCode, setManualCode] = useState("");
  const [continuousMode, setContinuousMode] = useState(true);
  const [scanState, setScanState] = useState<"idle" | "success" | "error">("idle");
  const [scannedProduct, setScannedProduct] = useState<any | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus input when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      setScanState("idle");
      setScannedProduct(null);
    }
  }, [isOpen]);

  const handleScanCode = (code: string) => {
    const cleaned = code.trim();
    if (!cleaned) return;

    // Search product list for matching SKU or Barcode
    const match = products.find(
      p => 
        (p.barcode && p.barcode.toLowerCase() === cleaned.toLowerCase()) || 
        (p.sku && p.sku.toLowerCase() === cleaned.toLowerCase())
    );

    if (match) {
      if (audioEnabled) playScanBeep();
      addToCart(match);
      setScannedProduct(match);
      setScanState("success");
      toast.success(`Added to Cart: ${match.name} (₵${match.price})`);

      // Reset feedback after 1.5s
      setTimeout(() => {
        setScanState("idle");
        setScannedProduct(null);
      }, 1500);

      if (!continuousMode) {
        onClose();
      }
    } else {
      setScanState("error");
      toast.error(`Unknown barcode scan: "${cleaned}"`, {
        description: "Verify that the product code or barcode exists in the inventory Catalog.",
      });
      setTimeout(() => setScanState("idle"), 2500);
    }
    setManualCode("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleScanCode(manualCode);
  };

  const testProducts = products
    .filter(p => p.barcode || p.sku)
    .slice(0, 6); // Limit to first few items for simulation list

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[620px] p-0 bg-slate-950/95 backdrop-blur-2xl border border-white/10 rounded-[40px] overflow-hidden text-white shadow-2xl">
        
        {/* Banner with Animated Laser */}
        <div className="relative h-44 bg-slate-900 flex items-center justify-center border-b border-white/5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-80" />
          
          {/* Simulated Scanner viewfinder overlay */}
          <div className={cn(
            "relative w-72 h-24 rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-300 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]",
            scanState === "success" && "border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3),inset_0_0_20px_rgba(16,185,129,0.1)]",
            scanState === "error" && "border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3),inset_0_0_20px_rgba(239,68,68,0.1)]",
            scanState === "idle" && "border-primary/40"
          )}>
            {/* Corner Bracket Accents */}
            <div className="absolute top-1 left-1.5 w-4 h-4 border-t-2 border-l-2 border-white/30 rounded-tl" />
            <div className="absolute top-1 right-1.5 w-4 h-4 border-t-2 border-r-2 border-white/30 rounded-tr" />
            <div className="absolute bottom-1 left-1.5 w-4 h-4 border-b-2 border-l-2 border-white/30 rounded-bl" />
            <div className="absolute bottom-1 right-1.5 w-4 h-4 border-b-2 border-r-2 border-white/30 rounded-br" />

            {/* Sweep laser bar animation */}
            <div className={cn(
              "absolute left-0 right-0 h-0.5 shadow-md transition-colors",
              scanState === "success" && "bg-emerald-500 shadow-emerald-500/50",
              scanState === "error" && "bg-red-500 shadow-red-500/50",
              scanState === "idle" && "bg-red-500 shadow-red-500/80 animate-[bounce_2s_infinite_ease-in-out]"
            )} />

            <div className="z-10 flex flex-col items-center gap-1.5 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/5">
              <Barcode className={cn(
                "h-5 w-5",
                scanState === "success" && "text-emerald-500 animate-pulse",
                scanState === "error" && "text-red-500",
                scanState === "idle" && "text-white/40"
              )} />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] leading-none">
                {scanState === "success" && scannedProduct ? "CHECKOUT MATCHED!" : scanState === "error" ? "NO PATTERN MATCHED" : "ALIGNED_WITH_LASER"}
              </span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8 space-y-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter text-white flex items-center justify-between">
              <span>Smart Barcode System</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center border border-white/5 text-xs transition-colors",
                    audioEnabled ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-white/5 text-slate-500"
                  )}
                  title="Toggle Scanning Audio Feedback Beep"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setContinuousMode(!continuousMode)}
                  className={cn(
                    "h-8 px-3 rounded-lg flex items-center gap-2 border border-white/5 text-[9px] font-black uppercase tracking-widest transition-colors",
                    continuousMode ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-white/5 text-slate-500"
                  )}
                >
                  <Scan className="h-3 w-3" />
                  <span>{continuousMode ? "Multi Scan" : "Single Scan"}</span>
                </button>
              </div>
            </DialogTitle>
            <DialogDescription className="text-xs font-semibold text-slate-400">
              Squeeze your plug-and-play USB scanner. Any codes scanned are processed instantly.
            </DialogDescription>
          </DialogHeader>

          {/* Form wrapper for manual or wedge scanning */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 flex items-center justify-center">
                <Keyboard className="h-4 w-4" />
              </div>
              <Input
                ref={inputRef}
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Click here to type, or scan with barcode gun..."
                className="pl-12 h-14 bg-white/[0.03] border-white/5 hover:border-white/10 focus:border-emerald-500/50 rounded-2xl font-black tracking-widest uppercase placeholder:font-bold placeholder:tracking-normal placeholder:capitalize placeholder:text-slate-600 text-sm w-full outline-none transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase tracking-widest text-slate-600 bg-white/5 px-2 py-1 rounded border border-white/5 flex items-center gap-1">
                Enter <CornerDownLeft className="h-2.5 w-2.5" />
              </span>
            </div>
          </form>

          {/* Scanned product response block */}
          <AnimatePresence mode="wait">
            {scannedProduct ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                    <Check className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-tight leading-none mb-1 text-white">{scannedProduct.name}</h4>
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Added Successfully</span>
                  </div>
                </div>
                <div className="font-black text-sm text-emerald-400">
                  ₵{scannedProduct.price}
                </div>
              </motion.div>
            ) : scanState === "error" ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400"
              >
                <AlertCircle className="h-5 w-5 shrink-0" />
                <div className="text-xs font-semibold">
                  Product not registered. Keep manual typing correct or register code in Inventory first.
                </div>
              </motion.div>
            ) : null}</AnimatePresence>

          {/* Sandbox Scanner Simulation Shortcuts for Frame Testing */}
          <div className="space-y-3 bg-white/[0.01] border border-white/5 p-5 rounded-3xl">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <Sparkles className="h-3 w-3 text-emerald-500 animate-pulse" />
              <span>Simulate Scan (Frame Shortcuts)</span>
            </h3>
            
            {testProducts.length > 0 ? (
              <div className="grid grid-cols-2 xs:grid-cols-3 gap-2">
                {testProducts.map((p) => {
                  const displayCode = p.barcode || p.sku;
                  return (
                    <Button
                      key={p.id}
                      type="button"
                      variant="outline"
                      onClick={() => handleScanCode(displayCode)}
                      className="h-11 justify-start gap-1 p-2 rounded-xl border-white/5 hover:border-emerald-500/30 bg-slate-900 hover:bg-emerald-500/5 text-slate-400 hover:text-white text-left overflow-hidden flex flex-col group transition-all"
                    >
                      <span className="text-[8px] font-black uppercase tracking-tight text-white block w-full truncate mb-0.5 leading-none">
                        {p.name}
                      </span>
                      <span className="text-[8px] font-mono leading-none tracking-wider text-slate-500 group-hover:text-emerald-500 block">
                        [{displayCode}]
                      </span>
                    </Button>
                  );
                })}
              </div>
            ) : (
              <div className="text-slate-600 text-center text-[10px] font-bold py-2">
                No products with SKU or Barcodes found in Catalog database.
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 bg-emerald-500/5 p-4 rounded-2xl text-slate-400 border border-emerald-500/10 text-xs">
            <Lightbulb className="h-5 w-5 text-emerald-500 shrink-0" />
            <span>
              <strong>Hardware Tip:</strong> Standard laser scanners will submit code matches on key sequence instantly. Focus won't conflict with checkout tabs.
            </span>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
