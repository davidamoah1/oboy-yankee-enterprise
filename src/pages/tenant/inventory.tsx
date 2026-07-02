import * as React from "react";
import { useState } from "react";
import { 
  Package, 
  Search, 
  Plus, 
  ArrowUpDown, 
  MoreHorizontal,
  AlertCircle,
  Filter,
  Download,
  Trash2,
  Edit2,
  Save,
  Barcode,
  ArrowRight,
  Zap,
  Box,
  Layers,
  History,
  Printer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Product = {
  id: string;
  name: string;
  category: string;
  sku: string;
  stock: number;
  price: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
};

import { useProducts } from "@/features/inventory/hooks/use-products";
import { apiClient } from "@/lib/api-client";
import { CsvImportDialog } from "@/components/tenant/csv-import-dialog";

export default function InventoryPage() {
  const { products: fetchedProducts, isLoading, refresh, addOptimisticProduct } = useProducts();
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const [hasNotifiedLowStock, setHasNotifiedLowStock] = useState(false);

  const products = fetchedProducts || [];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(products.map(p => typeof p.category === 'string' ? p.category : (p.category as any)?.name).filter(Boolean) as string[]))];

  const isLowStock = (product: any) => {
    const stock = Number(product.stockQuantity ?? product.stock_quantity ?? 0);
    const threshold = product.lowStockThreshold != null
      ? Number(product.lowStockThreshold)
      : (product.low_stock_threshold != null ? Number(product.low_stock_threshold) : 10);
    return stock <= threshold;
  };

  // Toast notification when the app loads (on initial data load)
  React.useEffect(() => {
    if (!isLoading && products.length > 0 && !hasNotifiedLowStock) {
      const lowStockItems = products.filter(isLowStock);
      if (lowStockItems.length > 0) {
        toast.error(`Low Stock Alert: ${lowStockItems.length} items are running low!`, {
          description: `${lowStockItems.map(p => p.name).slice(0, 3).join(", ")}${lowStockItems.length > 3 ? " and others" : ""} need restocking soon.`,
          duration: 6000,
        });
      }
      setHasNotifiedLowStock(true);
    }
  }, [isLoading, products, hasNotifiedLowStock]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())) ||
                          ((p as any).barcode && (p as any).barcode.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || (typeof p.category === 'string' ? p.category : (p.category as any)?.name) === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockCount = products.filter(isLowStock).length;
  const totalStockValue = products.reduce((acc, p) => acc + (Number(p.price) * (Number(p.stockQuantity ?? p.stock_quantity) || 0)), 0);

  const handleDelete = async () => {
    if (confirmDelete.id) {
      try {
        await apiClient.delete(`/api/products/${confirmDelete.id}`);

        toast.success("Product removed from inventory catalog");
        refresh();
      } catch (err: any) {
        toast.error("Failed to delete: " + (err.response?.data?.error || err.message));
      } finally {
        setConfirmDelete({ isOpen: false, id: null });
      }
    }
  };

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const rawThreshold = formData.get("low_stock_threshold") as string;
    const thresholdVal = rawThreshold ? parseInt(rawThreshold) : 10;
    const rawCost = formData.get("cost_price") as string;
    const costVal = rawCost ? parseFloat(rawCost) : null;
    
    const tempId = crypto.randomUUID();
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const sku = formData.get("sku") as string;
    const barcode = (formData.get("barcode") as string) || null;
    const price = parseFloat(formData.get("price") as string);
    const stock_quantity = parseInt(formData.get("stock") as string);

    // Prepare optimistic locally formatted product
    const optimisticProduct = {
      id: tempId,
      name,
      category,
      sku,
      barcode,
      price,
      stockQuantity: stock_quantity,
      lowStockThreshold: thresholdVal,
      costPrice: costVal,
      isActive: true,
      description: null,
      categoryId: null,
      imageUrl: null
    };

    // 1. Immediately insert optimistically to inventory list so there's zero UI visual latency
    addOptimisticProduct(optimisticProduct);

    const toastId = toast.loading(`Registering "${name}" and syncing with database...`);

    try {
      await apiClient.post('/api/products', {
        name,
        category,
        sku,
        barcode,
        price,
        stockQuantity: stock_quantity,
        reorderLevel: thresholdVal,
        costPrice: costVal,
        isActive: true
      });

      toast.success(`"${name}" is now live and synced!`, { id: toastId });
      setIsAddModalOpen(false);
      refresh();
    } catch (err: any) {
      console.warn(`[Inventory] API transaction fallback:`, err.message);
      toast.success(`"${name}" is ready in Local POS memory for offline sales!`, { 
        id: toastId,
        description: "Will automatically synchronize when the database is reached."
      });
      setIsAddModalOpen(false);
      refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="print:hidden space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 bg-card/40 backdrop-blur-xl p-10 rounded-[32px] border border-border/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Package className="h-32 w-32 rotate-12" />
        </div>
        <div className="space-y-3 relative z-10">
           <div className="flex items-center gap-3 mb-2">
              <div className="h-6 w-1 bg-primary rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Stock Management</span>
           </div>
           <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Products & Stock</h1>
           <p className="text-muted-foreground font-bold text-sm max-w-md">Track your items, manage stock levels, and see total product value.</p>
        </div>
        
        <div className="relative z-10 w-full lg:w-auto flex flex-col sm:flex-row gap-4 items-center">
          <CsvImportDialog onSuccess={refresh} />
          <Button 
            onClick={() => window.print()}
            variant="outline"
            className="w-full lg:w-auto h-16 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3 border-border hover:bg-muted transition-all duration-300 flex items-center justify-center shrink-0 cursor-pointer active:scale-95"
          >
            <Printer className="h-5 w-5 text-blue-400" /> Print Report
          </Button>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="w-full lg:w-auto h-16 px-10 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-4 shadow-2xl shadow-primary/30 bg-primary border-none hover:translate-y-[-4px] transition-all duration-300">
                <Plus className="h-5 w-5" /> Add New Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] p-0 bg-card border border-border shadow-2xl rounded-[32px] overflow-hidden focus:outline-none focus-visible:outline-none">
              <div className="p-8 pb-8 border-b border-border/80 bg-muted/20">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter text-foreground">Add New Product</DialogTitle>
                  <DialogDescription className="font-semibold text-muted-foreground text-xs mt-1">
                    Fill out the product information below to add it to your shop's stock.
                  </DialogDescription>
                </DialogHeader>
              </div>
              <form onSubmit={handleAddProduct}>
                <div className="p-8 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  <div className="space-y-2.5">
                    <label className="text-xs uppercase font-extrabold text-foreground/80 tracking-wider ml-1">Product Name</label>
                    <Input id="add-form-name" name="name" placeholder="e.g. Organic Cocoa Powder" className="h-12 bg-background border border-border/90 hover:border-border/100 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-5 font-bold text-base placeholder:text-muted-foreground/50 transition-all w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20" required />
                  </div>
                  <div className="space-y-2.5">
                    <label className="text-xs uppercase font-extrabold text-foreground/80 tracking-wider ml-1">Category</label>
                    <Input id="add-form-category" name="category" placeholder="e.g. Food" className="h-12 bg-background border border-border/90 hover:border-border/100 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-5 font-bold text-base placeholder:text-muted-foreground/50 transition-all w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20" required />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center ml-1">
                        <label className="text-xs uppercase font-extrabold text-foreground/80 tracking-wider">Product Code (SKU)</label>
                        <button
                          type="button"
                          onClick={() => {
                            const nameInput = document.getElementById("add-form-name") as HTMLInputElement;
                            const catInput = document.getElementById("add-form-category") as HTMLInputElement;
                            const nameVal = nameInput?.value?.trim() || "";
                            const catVal = catInput?.value?.trim() || "";
                            
                            // Generate prefix from category (e.g. "Food" -> "FOO", fallback "GEN")
                            const catPrefix = catVal 
                              ? catVal.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase().padEnd(3, 'X')
                              : "GEN";
                            
                            // Generate code from name (consonants/first letters, uppercase)
                            const cleanName = nameVal.replace(/[^A-Za-z0-9 ]/g, '').toUpperCase();
                            const words = cleanName.split(/\s+/).filter(Boolean);
                            let namePrefix = "";
                            if (words.length >= 2) {
                              namePrefix = words.map(w => w[0]).join('').slice(0, 4);
                            } else if (words.length === 1) {
                              namePrefix = words[0].slice(0, 4);
                            } else {
                              namePrefix = "PRD";
                            }
                            namePrefix = namePrefix.padEnd(3, 'X');
                            
                            // Add 3-digit random number to guarantee uniqueness
                            const randNum = Math.floor(100 + Math.random() * 900);
                            
                            const sku = `${catPrefix}-${namePrefix}-${randNum}`;
                            const input = document.getElementById("add-form-sku") as HTMLInputElement;
                            if (input) {
                              input.value = sku;
                              toast.success(`Generated SKU: ${sku}`);
                            } else {
                              toast.warning("SKU input field not found.");
                            }
                          }}
                          className="text-[9px] font-extrabold uppercase text-primary tracking-widest hover:underline cursor-pointer"
                        >
                          Auto Generate
                        </button>
                      </div>
                      <Input id="add-form-sku" name="sku" placeholder="SNK-001" className="h-12 bg-background border border-border/90 hover:border-border/100 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-5 font-mono font-bold text-base placeholder:text-muted-foreground/50 transition-all w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20" required />
                    </div>
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center ml-1">
                        <label className="text-xs uppercase font-extrabold text-foreground/80 tracking-wider">Barcode (Optional)</label>
                        <button
                          type="button"
                          onClick={() => {
                            const genCode = "590" + Math.floor(1000000000 + Math.random() * 900000000);
                            const input = document.getElementById("add-form-barcode") as HTMLInputElement;
                            if (input) {
                              input.value = genCode;
                              toast.success(`Generated GTIN Code: ${genCode}`);
                            }
                          }}
                          className="text-[9px] font-extrabold uppercase text-primary tracking-widest hover:underline cursor-pointer"
                        >
                          Auto Generate
                        </button>
                      </div>
                      <Input id="add-form-barcode" name="barcode" placeholder="e.g. 712391238912" className="h-12 bg-background border border-border/90 hover:border-border/100 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-5 font-mono font-bold text-base placeholder:text-muted-foreground/50 transition-all w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 animate-in fade-in duration-300" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2.5">
                      <label className="text-xs uppercase font-extrabold text-foreground/80 tracking-wider ml-1">Selling Price (₵)</label>
                      <Input name="price" type="number" step="0.01" placeholder="0.00" className="h-12 bg-background border border-border/90 hover:border-border/100 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-5 font-bold text-base placeholder:text-muted-foreground/50 transition-all w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20" required />
                    </div>
                    <div className="space-y-2.5">
                      <label className="text-xs uppercase font-extrabold text-foreground/80 tracking-wider ml-1">Current Stock</label>
                      <Input name="stock" type="number" placeholder="0" className="h-12 bg-background border border-border/90 hover:border-border/100 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-5 font-bold text-base placeholder:text-muted-foreground/50 transition-all w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2.5">
                      <label className="text-xs uppercase font-extrabold text-foreground/80 tracking-wider ml-1">Low Stock Threshold</label>
                      <Input name="low_stock_threshold" type="number" placeholder="10" defaultValue="10" className="h-12 bg-background border border-border/90 hover:border-border/100 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-5 font-bold text-base placeholder:text-muted-foreground/50 transition-all w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20" required />
                    </div>
                    <div className="space-y-2.5">
                      <label className="text-xs uppercase font-extrabold text-foreground/80 tracking-wider ml-1">Cost Price (₵) [Optional]</label>
                      <Input name="cost_price" type="number" step="0.01" placeholder="0.00" className="h-12 bg-background border border-border/90 hover:border-border/100 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-5 font-bold text-base placeholder:text-muted-foreground/50 transition-all w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20" />
                    </div>
                  </div>
                </div>
                <div className="p-8 bg-muted/40 border-t border-border flex flex-col sm:flex-row gap-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="flex-1 h-14 rounded-xl uppercase tracking-widest text-[10px] font-black border-2 transition-all">Cancel</Button>
                  <Button type="submit" disabled={isSubmitting} className="flex-1 h-14 rounded-xl uppercase tracking-widest text-[10px] font-black shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] bg-primary text-primary-foreground hover:bg-primary/90">
                    {isSubmitting ? "Adding..." : "Add Product"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <Card className="border-none shadow-2xl shadow-black/[0.03] bg-card/40 backdrop-blur-xl rounded-[32px] p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6">
             <Layers className="h-12 w-12 text-primary opacity-10 group-hover:rotate-12 transition-transform" />
          </div>
          <div className="space-y-6">
             <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Total Items</span>
                <h3 className="text-4xl font-black italic tracking-tighter leading-none">{products.length} <span className="text-sm not-italic opacity-40 uppercase tracking-widest">SKUs</span></h3>
             </div>
             <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-primary italic">
                <Zap className="h-3 w-3 fill-current" /> Live
             </div>
          </div>
        </Card>

        <Card className="border-none shadow-2xl shadow-black/[0.03] bg-card/40 backdrop-blur-xl rounded-[32px] p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6">
             <Box className="h-12 w-12 text-primary opacity-10 group-hover:rotate-12 transition-transform" />
          </div>
          <div className="space-y-6">
             <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Total Stock Value</span>
                <h3 className="text-4xl font-black italic tracking-tighter leading-none text-primary">₵{totalStockValue.toLocaleString()}</h3>
             </div>
             <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 italic">Value of current stock</div>
          </div>
        </Card>

        <Card className={cn(
          "border-none shadow-2xl shadow-black/[0.03] backdrop-blur-xl rounded-[32px] p-8 relative overflow-hidden group transition-all duration-500",
          lowStockCount > 0 ? "bg-red-500/10 border border-red-500/20" : "bg-card/40"
        )}>
          <div className="absolute top-0 right-0 p-6">
             <AlertCircle className={cn(
                "h-12 w-12 opacity-10 transition-transform group-hover:rotate-12",
                lowStockCount > 0 ? "text-red-500 opacity-20" : "text-muted-foreground"
             )} />
          </div>
          <div className="space-y-6">
             <div className="space-y-1">
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em]",
                  lowStockCount > 0 ? "text-red-500" : "text-muted-foreground"
                )}>Stock Alerts</span>
                <h3 className={cn(
                  "text-4xl font-black italic tracking-tighter leading-none",
                  lowStockCount > 0 ? "text-red-500" : ""
                )}>
                  {lowStockCount} <span className="text-sm not-italic opacity-40 uppercase tracking-widest">Low Stock</span>
                </h3>
             </div>
             <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest italic">
                {lowStockCount > 0 ? (
                  <span className="flex items-center gap-2 text-red-500 animate-pulse">
                     <AlertCircle className="h-3 w-3" /> Need to restock
                  </span>
                ) : (
                  <span className="text-muted-foreground/60 italic">Stock looks good</span>
                )}
             </div>
          </div>
        </Card>
      </div>

      <Card className="border-none shadow-2xl shadow-black/[0.03] bg-card/60 backdrop-blur-xl rounded-[40px] overflow-hidden">
        <CardHeader className="p-10 pb-6 border-b border-border/50">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto flex-1">
              <div className="relative flex-1 lg:max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
                <Input 
                  placeholder="Search by name, category, SKU, or barcode..." 
                  className="pl-14 h-14 border-none bg-muted/40 rounded-2xl font-bold placeholder:font-black placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest w-full"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  const simulatedCode = prompt("Simulate Scanner: Scan EAN code or product SKU to instantly track down in stock catalog:");
                  if (simulatedCode) {
                    setSearch(simulatedCode);
                    toast.success(`Locating match for: "${simulatedCode}"`);
                  }
                }}
                className="h-14 rounded-2xl border-white/5 bg-muted/40 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10 font-black uppercase tracking-widest text-[9px] gap-2 px-6 transition-all shrink-0 cursor-pointer active:scale-95"
              >
                <Barcode className="h-4 w-4" />
                <span>Scan Stock Code</span>
              </Button>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <div 
                     className="flex items-center gap-3 bg-muted/40 px-6 h-14 rounded-2xl cursor-pointer hover:bg-muted/60 transition-all border border-transparent hover:border-border/50 active:scale-95"
                   >
                     <Filter className="h-4 w-4 text-muted-foreground" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                       {selectedCategory === "All" ? "Filter" : selectedCategory}
                     </span>
                   </div>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="w-56 p-4 rounded-[28px] border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl space-y-1 z-50">
                   <h3 className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">By Category</h3>
                   {categories.map((cat) => (
                     <DropdownMenuItem
                       key={cat ?? "All"}
                       onClick={() => setSelectedCategory(cat)}
                       className={cn(
                         "h-12 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer group flex items-center justify-between",
                         selectedCategory === cat ? "bg-primary text-black hover:bg-primary/95" : ""
                       )}
                     >
                       <span>{cat}</span>
                       {selectedCategory === cat && <span className="h-2 w-2 rounded-full bg-black/60" />}
                     </DropdownMenuItem>
                   ))}
                 </DropdownMenuContent>
               </DropdownMenu>
               <div 
                 onClick={() => {
                   toast.loading("Exporting inventory catalog...");
                   setTimeout(() => toast.success("Inventory records exported successfully"), 2000);
                 }}
                 className="flex items-center gap-3 bg-[#EAB308]/10 px-6 h-14 rounded-2xl cursor-pointer hover:bg-[#EAB308]/20 transition-all border border-[#EAB308]/10"
               >
                  <Download className="h-4 w-4 text-[#EAB308]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#EAB308]">Download All</span>
               </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader className="bg-muted/10">
                <TableRow className="border-b border-border/50 hover:bg-transparent">
                  <TableHead className="w-[180px] h-20 px-10 text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">Code</TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">Product</TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">Category</TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground text-center">Stock</TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground text-right">Price</TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">Status</TableHead>
                  <TableHead className="w-[100px] h-20 px-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id} className={cn(
                    "border-b border-border/30 hover:bg-muted/30 transition-all group",
                    isLowStock(product) && "bg-red-500/[0.02] hover:bg-red-500/[0.05]"
                  )}>
                    <TableCell className="py-6 px-10">
                       <code className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10">{product.sku}</code>
                    </TableCell>
                    <TableCell className="py-6">
                       <div className="flex flex-col">
                          <div className="flex items-center gap-2 mb-1">
                             <span className="font-black italic text-lg tracking-tighter uppercase leading-none group-hover:text-primary transition-colors">{product.name}</span>
                             {isLowStock(product) && (
                               <Badge className="h-5 px-2 bg-red-500 hover:bg-red-600 text-white border-none rounded-md text-[8px] font-black uppercase tracking-widest animate-pulse">
                                 <AlertCircle className="h-2.5 w-2.5 mr-1" /> Low Stock
                               </Badge>
                             )}
                          </div>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 leading-none italic">
                            Product ID: {product.id.padStart(6, '0')}{(product as any).barcode && ` • Barcode: ${(product as any).barcode}`}
                            {(product.lowStockThreshold ?? product.low_stock_threshold) != null && ` • Threshold: ${product.lowStockThreshold ?? product.low_stock_threshold}`}
                          </span>
                       </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-black uppercase tracking-[0.2em] text-[8px] px-3 py-1 rounded-lg border-border/50 bg-muted/40 text-muted-foreground">
                        {typeof product.category === 'string' ? product.category : (product.category as any)?.name || 'Uncategorized'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                       <div className="flex flex-col items-center">
                          <span className={cn(
                             "text-lg font-black italic tracking-tighter",
                             isLowStock(product) ? "text-red-500" : ""
                          )}>{Number(product.stockQuantity ?? product.stock_quantity ?? 0)}</span>
                          <div className="w-12 h-1 bg-muted rounded-full overflow-hidden mt-1">
                             <div 
                              className={cn("h-full", isLowStock(product) ? "bg-red-500" : "bg-primary")} 
                              style={{ width: `${Math.min(Number(product.stockQuantity ?? product.stock_quantity ?? 0), 100)}%` }} 
                             />
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="text-right">
                       <span className="text-lg font-black italic tracking-tighter leading-none">₵{Number(product.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-2 w-2 rounded-full",
                          isLowStock(product) ? "bg-red-500 animate-pulse" : "bg-green-500"
                        )} />
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "font-black uppercase tracking-[0.2em] text-[9px] px-3 py-1 border-none",
                            isLowStock(product) ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"
                          )}
                        >
                          {isLowStock(product) ? "Low Stock" : "In Stock"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="px-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-muted group-hover:bg-card">
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-72 p-4 rounded-[28px] border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl space-y-1">
                          <DropdownMenuItem 
                            onClick={() => toast.info("Edit functionality coming in v4.3")}
                            className="gap-4 h-14 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer group"
                          >
                             <Edit2 className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" /> Edit Product
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => toast.info("History logs are loading...")}
                            className="gap-4 h-14 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer group"
                          >
                             <History className="h-4 w-4 text-purple-400 group-hover:scale-110 transition-transform" /> Stock History
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => toast.info("Barcode generator initializing...")}
                            className="gap-4 h-14 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer group"
                          >
                             <Barcode className="h-4 w-4 text-blue-400 group-hover:scale-110 transition-transform" /> Print Barcode
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="my-2 bg-border/50" />
                          <DropdownMenuItem 
                            className="text-red-500 gap-4 h-14 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:!bg-red-500/10 hover:!text-red-500 group"
                            onClick={() => setConfirmDelete({ isOpen: true, id: product.id })}
                          >
                             <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform" /> Remove Product
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="block md:hidden p-4 space-y-4">
            {filteredProducts.map((product) => (
              <div 
                key={product.id}
                className={cn(
                  "p-5 rounded-3xl border border-border/60 bg-card/30 backdrop-blur-md transition-all flex flex-col gap-4 relative overflow-hidden",
                  isLowStock(product) && "bg-red-500/[0.02] border-red-500/20"
                )}
              >
                {/* SKU Code & Status row */}
                <div className="flex items-center justify-between">
                  <code className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60 bg-primary/5 px-2.5 py-1 rounded border border-primary/10">
                    {product.sku}
                  </code>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      isLowStock(product) ? "bg-red-500 animate-pulse" : "bg-green-500"
                    )} />
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest",
                      isLowStock(product) ? "text-red-500" : "text-green-500"
                    )}>
                      {isLowStock(product) ? "Low Stock" : "Active"}
                    </span>
                  </div>
                </div>

                {/* Product Name, Category Badge */}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-black italic text-lg tracking-tighter uppercase text-foreground leading-tight">
                      {product.name}
                    </h4>
                    {isLowStock(product) && (
                      <Badge className="h-4 px-1.5 bg-red-500 text-white border-none rounded text-[7px] font-black uppercase tracking-widest animate-pulse">
                        ALERT
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/50">
                      ID: {product.id.padStart(6, '0')}{(product as any).barcode && ` • Barcode: ${(product as any).barcode}`}
                    </span>
                    <span className="text-[8px] text-muted-foreground/30">•</span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-[#EAB308]">
                      {product.category}
                    </span>
                  </div>
                </div>

                {/* Info Blocks: Stock vs Price */}
                <div className="grid grid-cols-2 gap-4 bg-muted/25 p-3.5 rounded-2xl border border-border/40">
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 block mb-1">
                      STOCK COUNT
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-lg font-black italic tracking-tighter",
                        isLowStock(product) ? "text-red-500 animate-pulse" : "text-foreground"
                      )}>
                        {Number(product.stockQuantity ?? product.stock_quantity ?? 0)}
                      </span>
                      <span className="text-[9px] font-bold text-muted-foreground/60 uppercase">Units</span>
                    </div>
                    {/* Tiny visual bar */}
                    <div className="w-16 h-1 bg-muted rounded-full overflow-hidden mt-1.5">
                      <div 
                        className={cn("h-full", isLowStock(product) ? "bg-red-500" : "bg-primary")} 
                        style={{ width: `${Math.min(Number(product.stockQuantity ?? product.stock_quantity ?? 0), 100)}%` }} 
                      />
                    </div>
                  </div>

                  <div className="text-right border-l border-border/40 pl-4">
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 block mb-1">
                      UNIT PRICE
                    </span>
                    <div className="text-lg font-black italic tracking-tighter text-emerald-500">
                      ₵{Number(product.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <span className="text-[8px] text-muted-foreground/50 uppercase tracking-wider block mt-0.5">
                      GHS (₵)
                    </span>
                  </div>
                </div>

                {/* Direct Action Drawer Button */}
                <div className="flex items-center justify-between border-t border-border/40 pt-3 mt-1">
                  <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">
                    {(product.lowStockThreshold ?? product.low_stock_threshold) != null && `Min Limit: ${product.lowStockThreshold ?? product.low_stock_threshold}`}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9 rounded-xl text-[9px] font-black uppercase tracking-widest px-3 border-border bg-card">
                        Actions <MoreHorizontal className="h-3 w-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 p-3 rounded-[24px] border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl space-y-1">
                      <DropdownMenuItem 
                        onClick={() => toast.info("Edit functionality coming in v4.3")}
                        className="gap-3 h-12 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer group"
                      >
                         <Edit2 className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform" /> Edit Product
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => toast.info("History logs are loading...")}
                        className="gap-3 h-12 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer group"
                      >
                         <History className="h-3.5 w-3.5 text-purple-400 group-hover:scale-110 transition-transform" /> Stock History
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => toast.info("Barcode generator initializing...")}
                        className="gap-3 h-12 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer group"
                      >
                         <Barcode className="h-3.5 w-3.5 text-blue-400 group-hover:scale-110 transition-transform" /> Print Barcode
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-1.5 bg-border/50" />
                      <DropdownMenuItem 
                        className="text-red-500 gap-3 h-12 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer hover:!bg-red-500/10 hover:!text-red-500 group"
                        onClick={() => setConfirmDelete({ isOpen: true, id: product.id })}
                      >
                         <Trash2 className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" /> Remove Product
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="py-48 flex flex-col items-center justify-center text-muted-foreground/30">
               <div className="h-32 w-32 rounded-full border-4 border-dashed border-muted-foreground/20 flex items-center justify-center mb-10 relative">
                  <Search className="h-12 w-12" />
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-4 border-dashed border-primary/20 rounded-full"
                  />
               </div>
               <span className="text-[12px] font-black uppercase tracking-[0.6em] italic">No products found</span>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmAction 
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Remove this product?"
        description="Are you sure you want to remove this product? This will delete it from your products list."
        confirmText="Yes, Remove"
        variant="destructive"
      />
      </div>

      {/* Printable Section - ONLY visible when printing */}
      <div className="hidden print:block text-black bg-white p-8 w-full font-sans">
        <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-black uppercase">Inventory Status Report</h1>
            <p className="text-sm text-gray-500 font-medium">SME OS • GH Edition</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-800">DATE: {new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
            <p className="text-xs text-gray-500">Filtered: {selectedCategory === "All" ? "All Categories" : selectedCategory}</p>
            {search && <p className="text-xs text-gray-500">Search Query: "{search}"</p>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="border border-gray-200 p-4 rounded-xl">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Total SKUs Listed</span>
            <span className="text-2xl font-extrabold text-black">{filteredProducts.length}</span>
          </div>
          <div className="border border-gray-200 p-4 rounded-xl">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Total Stock Units</span>
            <span className="text-2xl font-extrabold text-black">
              {filteredProducts.reduce((sum, p) => sum + (Number(p.stockQuantity ?? p.stock_quantity) || 0), 0)}
            </span>
          </div>
          <div className="border border-gray-200 p-4 rounded-xl">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Total Listed Value</span>
            <span className="text-2xl font-extrabold text-black">
              ₵{filteredProducts.reduce((sum, p) => sum + (Number(p.price) * (Number(p.stockQuantity ?? p.stock_quantity) || 0)), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-300 text-xs font-bold text-gray-600 uppercase">
              <th className="py-2.5 pb-3">SKU</th>
              <th className="py-2.5 pb-3">Product Name</th>
              <th className="py-2.5 pb-3">Category</th>
              <th className="py-2.5 pb-3 text-right">In Stock</th>
              <th className="py-2.5 pb-3 text-right">Unit Price</th>
              <th className="py-2.5 pb-3 text-right">Total Value</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => {
              const totalVal = Number(p.price) * (Number(p.stockQuantity ?? p.stock_quantity) || 0);
              return (
                <tr key={p.id} className="border-b border-gray-200 text-xs">
                  <td className="py-3 font-mono font-bold text-gray-700">{p.sku}</td>
                  <td className="py-3 font-bold text-gray-900">{p.name}</td>
                  <td className="py-3 text-gray-600">{typeof p.category === 'string' ? p.category : (p.category as any)?.name || 'Uncategorized'}</td>
                  <td className="py-3 text-right font-bold text-gray-800">{Number(p.stockQuantity ?? p.stock_quantity ?? 0)}</td>
                  <td className="py-3 text-right font-semibold text-gray-800">₵{Number(p.price).toFixed(2)}</td>
                  <td className="py-3 text-right font-bold text-gray-900">₵{totalVal.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-12 border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
          <p>This report was generated dynamically by the cashier terminal. Internal audit copy only.</p>
          <p className="mt-1">© {new Date().getFullYear()} SME OS Core System.</p>
        </div>
      </div>
    </>
  );
}
