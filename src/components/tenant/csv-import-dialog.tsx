import * as React from "react";
import { useState, useRef } from "react";
import { 
  Upload, 
  Download, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  FileSpreadsheet, 
  ArrowLeft,
  Info 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

interface CsvImportDialogProps {
  onSuccess: () => void;
}

interface ParsedRow {
  index: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  cost_price: number | null;
  description: string;
  isValid: boolean;
  errors: string[];
}

const getHeaderValue = (row: any, keys: string[]) => {
  for (const k of keys) {
    if (row[k] !== undefined) return row[k];
  }
  const rowKeys = Object.keys(row);
  for (const rk of rowKeys) {
    const normalizedRowKey = rk.toLowerCase().replace(/[\s_-]/g, '');
    for (const k of keys) {
      const normalizedKey = k.toLowerCase().replace(/[\s_-]/g, '');
      if (normalizedRowKey === normalizedKey) {
        return row[rk];
      }
    }
  }
  return undefined;
};

export function CsvImportDialog({ onSuccess }: CsvImportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState<"upload" | "preview">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse CSV function
  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/);
    if (lines.length === 0) return [];
    
    // Parse header row
    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
    
    const result = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values: string[] = [];
      let current = "";
      let inQuotes = false;
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      
      const row: any = {};
      headers.forEach((header, index) => {
        let value = values[index] || '';
        value = value.replace(/^["']|["']$/g, '');
        row[header] = value;
      });
      
      result.push(row);
    }
    return result;
  };

  const validateRows = (rawRows: any[]): ParsedRow[] => {
    return rawRows.map((row, index) => {
      const errors: string[] = [];
      
      let name = getHeaderValue(row, ["name", "product_name", "product", "title"]) || "";
      if (typeof name === "string") name = name.trim();
      
      let sku = getHeaderValue(row, ["sku", "code", "product_code", "item_code", "barcode"]) || "";
      if (typeof sku === "string") sku = sku.trim();
      
      let category = getHeaderValue(row, ["category", "type", "tag", "group", "department"]) || "General";
      if (typeof category === "string") category = category.trim();
      
      let priceStr = getHeaderValue(row, ["price", "selling_price", "unit_price", "rate"]) || "";
      let price = 0;
      
      let stockStr = getHeaderValue(row, ["stock_quantity", "stock", "quantity", "qty", "count"]) || "";
      let stock = 0;
      
      let thresholdStr = getHeaderValue(row, ["low_stock_threshold", "threshold", "alert", "reorder_level"]) || "10";
      let threshold = 10;
      
      let costPriceStr = getHeaderValue(row, ["cost_price", "cost", "purchase_price"])?.toString() || "";
      let costPrice: number | null = null;
      
      let description = getHeaderValue(row, ["description", "desc", "details", "notes"]) || "";
      if (typeof description === "string") description = description.trim();

      // 1. Validate Name
      if (!name) {
        errors.push("Product name is required.");
      }

      // 2. Validate Price
      if (priceStr === "" || priceStr === null || priceStr === undefined) {
        errors.push("Selling price is required.");
      } else {
        // Strip out Currency codes or symbols like ₵, $, etc. keep only numbers and dot
        const cleanedPrice = priceStr.toString().replace(/[^0-9.]/g, "");
        const parsedPrice = parseFloat(cleanedPrice);
        if (isNaN(parsedPrice)) {
          errors.push("Price must be a valid number.");
        } else if (parsedPrice < 0) {
          errors.push("Price cannot be negative.");
        } else {
          price = parsedPrice;
        }
      }

      // 3. Validate Stock
      if (stockStr === "" || stockStr === null || stockStr === undefined) {
        errors.push("Stock quantity is required.");
      } else {
        const cleanedStock = stockStr.toString().replace(/[^0-9]/g, "");
        const parsedStock = parseInt(cleanedStock, 10);
        if (isNaN(parsedStock)) {
          errors.push("Stock quantity must be a valid integer.");
        } else if (parsedStock < 0) {
          errors.push("Stock quantity cannot be negative.");
        } else {
          stock = parsedStock;
        }
      }

      // 4. Validate Threshold
      if (thresholdStr) {
        const cleanedThreshold = thresholdStr.toString().replace(/[^0-9]/g, "");
        const parsedThreshold = parseInt(cleanedThreshold, 10);
        if (!isNaN(parsedThreshold) && parsedThreshold >= 0) {
          threshold = parsedThreshold;
        }
      }

      // 5. Validate Cost Price
      if (costPriceStr) {
        const cleanedCost = costPriceStr.replace(/[^0-9.]/g, "");
        const parsedCost = parseFloat(cleanedCost);
        if (!isNaN(parsedCost) && parsedCost >= 0) {
          costPrice = parsedCost;
        }
      }

      return {
        index: index + 1,
        name: name.toString(),
        sku: sku.toString() || `SKU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        category: category.toString(),
        price,
        stock_quantity: stock,
        low_stock_threshold: threshold,
        cost_price: costPrice,
        description: description.toString(),
        isValid: errors.length === 0,
        errors
      };
    });
  };

  const handleFile = (file: File) => {
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a valid CSV file (.csv)");
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        const rawRows = parseCSV(text);
        if (rawRows.length === 0) {
          toast.error("The selected CSV file appears to be empty.");
          return;
        }
        const validated = validateRows(rawRows);
        setParsedRows(validated);
        setStep("preview");
        toast.success(`Successfully parsed ${validated.length} rows`);
      } catch (err: any) {
        toast.error("Failed to parse CSV: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Generate and Download sample template
  const downloadTemplate = () => {
    const csvContent = 
      "name,category,sku,price,stock_quantity,low_stock_threshold,cost_price,description\n" +
      '"Ghanaian Rich Chocolate","Snacks","SNK-001",15.00,50,10,10.00,"Delicious rich Ghanaian milk chocolate bar"\n' +
      '"Premium Hand-Picked Tea","Beverages","BEV-042",45.00,24,5,30.00,"Organic green tea leaves from local farms"\n' +
      '"Local Forest Wild Honey","Groceries","GRC-099",65.00,12,5,45.00,"Pure raw organic wild forest honey"\n' +
      '"Natural Unrefined Shea Butter","Self Care","BTY-012",35.00,8,10,22.00,"100% pure organic raw unrefined shea butter"\n' +
      '"Aromatic Garlic Spiky Ginger","Spices","SPC-033",25.00,40,10,15.00,"Freshly ground local ginger and garlic mix"\n';

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "nexa_products_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Import Template downloaded successfully!");
  };

  const handleImport = async () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      toast.error("There are no valid products to import.");
      return;
    }

    setIsUploading(true);
    try {
      // Chunk insertions to limit payload spikes
      const batchSize = 50;
      for (let i = 0; i < validRows.length; i += batchSize) {
        const chunk = validRows.slice(i, i + batchSize).map(row => ({
          name: row.name,
          sku: row.sku,
          category: row.category,
          price: row.price,
          stock_quantity: row.stock_quantity,
          low_stock_threshold: row.low_stock_threshold,
          cost_price: row.cost_price,
          description: row.description,
          is_active: true
        }));

        await apiClient.post('/api/products/bulk', { products: chunk });
      }

      toast.success(`Successfully imported ${validRows.length} products into stock`);
      setResetState();
      onSuccess();
    } catch (err: any) {
      toast.error("Failed to complete bulk upload: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const setResetState = () => {
    setStep("upload");
    setParsedRows([]);
    setFileName("");
    setIsOpen(false);
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const invalidCount = parsedRows.filter(r => !r.isValid).length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setResetState();
      } else {
        setIsOpen(true);
      }
    }}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full lg:w-auto h-16 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3 border-2 border-border/80 hover:bg-muted bg-transparent hover:translate-y-[-4px] transition-all duration-300"
        >
          <Upload className="h-4 w-4" /> Import CSV
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl p-0 bg-card/95 backdrop-blur-3xl border-border/50 rounded-[32px] overflow-hidden shadow-3xl">
        <div className="p-8 pb-6 border-b border-border/50">
          <DialogHeader className="flex flex-row justify-between items-start">
            <div>
              <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter">Bulk Import Products</DialogTitle>
              <DialogDescription className="font-bold text-muted-foreground text-sm mt-1">
                Upload your inventory in bulk using a standard comma-separated file.
              </DialogDescription>
            </div>
          </DialogHeader>
        </div>

        {step === "upload" ? (
          <div className="p-8 space-y-8">
            <div className="flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center bg-primary/5 border border-primary/10 rounded-2xl p-6">
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-primary/10 rounded-xl text-primary mt-1">
                  <Info className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-black uppercase tracking-wider text-[11px] text-primary">Need the correct column structure?</h4>
                  <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
                    Make sure your CSV contains required fields like <strong className="text-foreground">name</strong>, <strong className="text-foreground">price</strong>, and <strong className="text-foreground">stock_quantity</strong>. Click download to get a sample template configured to work right away.
                  </p>
                </div>
              </div>
              <Button 
                onClick={downloadTemplate} 
                className="w-full sm:w-auto h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 bg-primary/20 text-primary border border-primary/25 hover:bg-primary hover:text-black hover:border-transparent transition-all shrink-0 self-center sm:self-auto"
              >
                <Download className="h-4 w-4" /> Download Sample File
              </Button>
            </div>

            {/* Drag & Drop File Upload Zone */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`h-72 border-2 border-dashed rounded-[24px] flex flex-col items-center justify-center p-8 transition-all cursor-pointer group hover:bg-muted/35 ${
                dragActive ? "border-primary bg-primary/5 scale-[0.99]" : "border-border/80"
              }`}
            >
              <input 
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div className="h-16 w-16 rounded-2xl bg-muted group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-300 flex items-center justify-center mb-5 border border-border/30 group-hover:border-primary/20 text-muted-foreground group-hover:text-primary">
                <Upload className="h-7 w-7" />
              </div>
              <p className="text-sm font-black uppercase tracking-wider text-center">Click to browse or Drag & Drop File</p>
              <p className="text-xs text-muted-foreground font-semibold mt-2">Only .CSV files are accepted</p>
            </div>
          </div>
        ) : (
          <div className="p-0 flex flex-col h-[65vh]">
            {/* Status Summary */}
            <div className="px-8 py-5 bg-muted/20 border-b border-border/50 flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setStep("upload")}
                  className="p-2 hover:bg-muted rounded-xl transition-all mr-1 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex flex-col">
                  <span className="font-mono text-xs text-muted-foreground leading-none mb-1">Uploaded file</span>
                  <span className="font-black uppercase tracking-wider text-sm">{fileName}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex items-center gap-2 bg-muted/65 px-4 py-2 rounded-xl border border-border/40">
                  <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none">{parsedRows.length} Rows</span>
                </div>
                <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 text-emerald-500">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none">{validCount} Ready</span>
                </div>
                {invalidCount > 0 && (
                  <div className="flex items-center gap-2 bg-red-500/10 px-4 py-2 rounded-xl border border-red-500/20 text-red-500">
                    <XCircle className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">{invalidCount} Incomplete</span>
                  </div>
                )}
              </div>
            </div>

            {/* Error notifications or partial warnings */}
            {invalidCount > 0 && (
              <div className="mx-8 mt-5 bg-red-500/5 border border-red-500/10 rounded-2xl p-5 flex gap-4 items-start">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-[11px] font-black uppercase text-red-500 tracking-wider">Incomplete Rows Detected</h5>
                  <p className="text-xs text-muted-foreground font-semibold mt-1">
                    {invalidCount} products cannot be imported because they are missing critical fields. Nexa will skip these and import the remaining {validCount} properly formatted products.
                  </p>
                </div>
              </div>
            )}

            {/* Table Area */}
            <div className="flex-1 overflow-auto px-8 py-5 custom-scrollbar">
              <Table>
                <TableHeader className="bg-muted/10 sticky top-0 bg-card z-10">
                  <TableRow className="border-b border-border/50">
                    <TableHead className="w-[80px] text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Row</TableHead>
                    <TableHead className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Product Name</TableHead>
                    <TableHead className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Category</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">SKU</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-right">Price</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-center">Stock</TableHead>
                    <TableHead className="w-[180px] text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Status / Errors</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedRows.map((row) => (
                    <TableRow key={row.index} className={`border-b border-border/20 ${!row.isValid ? "bg-red-500/[0.01]" : ""}`}>
                      <TableCell className="font-mono text-xs text-muted-foreground font-bold">{row.index}</TableCell>
                      <TableCell className="font-extrabold uppercase text-xs tracking-tight">{row.name || <span className="text-red-500/50 italic font-semibold">Missing Name</span>}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[8px] font-black uppercase tracking-wider h-6 rounded-md px-2 bg-muted/40 text-muted-foreground/80">
                          {row.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{row.sku}</TableCell>
                      <TableCell className="text-right font-black italic">
                        {row.isValid ? (
                          `₵${Number(row.price).toFixed(2)}`
                        ) : (
                          <span className="text-red-500/50">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-extrabold">{row.isValid ? row.stock_quantity : <span className="text-red-500/50">-</span>}</TableCell>
                      <TableCell>
                        {row.isValid ? (
                          <Badge className="bg-emerald-500/15 text-emerald-500 border-none hover:bg-emerald-500/15 gap-1.5 py-1 text-[8px] font-black uppercase tracking-wider">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Valid Product
                          </Badge>
                        ) : (
                          <div className="flex flex-col gap-1 max-w-[180px]">
                            {row.errors.map((error, idx) => (
                              <span key={idx} className="text-[9px] text-red-500 font-bold leading-tight flex items-center gap-1">
                                <span className="h-1 w-1 rounded-full bg-red-500 shrink-0" /> {error}
                              </span>
                            ))}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <DialogFooter className="p-8 bg-muted/30 border-t border-border/50 flex flex-col sm:flex-row gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setStep("upload")} 
                className="flex-1 h-14 rounded-xl uppercase tracking-widest text-[10px] font-black border-2 transition-all mt-0"
              >
                Choose Different File
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={isUploading || validCount === 0} 
                className="flex-1 h-14 rounded-xl uppercase tracking-widest text-[10px] font-black bg-primary text-black shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" /> Importing...
                  </>
                ) : (
                  `Import ${validCount} Valid Products`
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
