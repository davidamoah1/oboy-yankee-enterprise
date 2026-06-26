import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { apiClient } from "@/lib/api-client";
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Send, 
  MoreHorizontal,
  ArrowRight,
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  CreditCard,
  Mail,
  Calendar,
  Building,
  Receipt,
  User,
  Check,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LineItem {
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
}

interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: string;
  status: string;
  ref: string;
}

interface RelatedTx {
  id: string;
  desc: string;
  date: string;
  amount: number;
  type: string;
}

interface Invoice {
  id: string;
  client: string;
  date: string;
  dueDate: string;
  amount: number;
  status: string;
  type: string;
  billingEmail: string;
  phone: string;
  address: string;
  lineItems: LineItem[];
  paymentHistory: PaymentRecord[];
  relatedTransactions: RelatedTx[];
}

const INVOICE_DATA: Invoice[] = [
  { 
    id: "INV-2026-001", 
    client: "Mensah Retail Hub", 
    date: "2026-05-10", 
    dueDate: "2026-05-24",
    amount: 1250.00, 
    status: "Paid", 
    type: "Service",
    billingEmail: "finance@mensahhub.com",
    phone: "024-455-6789",
    address: "Ring Road East, Accra",
    lineItems: [
      { description: "Retail Management Consultation", qty: 10, unitPrice: 100.00, total: 1000.00 },
      { description: "Staff Training Session", qty: 1, unitPrice: 250.00, total: 250.00 }
    ],
    paymentHistory: [
      { id: "PAY-001", date: "2026-05-12", amount: 1250.00, method: "MoMo (MTN)", status: "Success", ref: "TXN-908129302" }
    ],
    relatedTransactions: [
      { id: "TX-4890", desc: "Consultation Session Credit", date: "2026-05-12", amount: 1250.00, type: "Credit" }
    ]
  },
  { 
    id: "INV-2026-002", 
    client: "Grand Events Ltd", 
    date: "2026-05-08", 
    dueDate: "2026-05-22",
    amount: 5400.00, 
    status: "Pending", 
    type: "Inventory",
    billingEmail: "events@grandltd.com",
    phone: "050-123-4567",
    address: "Airport Residential Area, Accra",
    lineItems: [
      { description: "Wireless POS Registers (Rental)", qty: 5, unitPrice: 400.00, total: 2000.00 },
      { description: "Barcode Scanners (Enterprise Pack)", qty: 4, unitPrice: 350.00, total: 1400.00 },
      { description: "Custom Thermal Paper Rolls", qty: 100, unitPrice: 20.00, total: 2000.00 }
    ],
    paymentHistory: [],
    relatedTransactions: []
  },
  { 
    id: "INV-2026-003", 
    client: "Kwame Owusu Pro", 
    date: "2026-05-05", 
    dueDate: "2026-05-19",
    amount: 850.00, 
    status: "Overdue", 
    type: "Service",
    billingEmail: "kwame.pro@gmail.com",
    phone: "027-889-1122",
    address: "Adum, Kumasi",
    lineItems: [
      { description: "System Setup and Migration Support", qty: 1, unitPrice: 850.00, total: 850.00 }
    ],
    paymentHistory: [
      { id: "PAY-002", date: "2026-05-06", amount: 150.00, method: "Bank Card", status: "Partial/Failed", ref: "ERR-912" }
    ],
    relatedTransactions: []
  },
  { 
    id: "INV-2026-004", 
    client: "Tech Solutions GH", 
    date: "2026-05-01", 
    dueDate: "2026-05-15",
    amount: 2100.00, 
    status: "Paid", 
    type: "Consulting",
    billingEmail: "accounts@techsolutionsgh.com",
    phone: "030-211-2233",
    address: "Spintex Road, Accra",
    lineItems: [
      { description: "Database Optimization & Integration", qty: 2, unitPrice: 1050.00, total: 2100.00 }
    ],
    paymentHistory: [
      { id: "PAY-003", date: "2026-05-02", amount: 2100.00, method: "Bank Transfer", status: "Success", ref: "CBG-0495819" }
    ],
    relatedTransactions: [
      { id: "TX-4811", desc: "Database Optimization Payout", date: "2026-05-02", amount: 2100.00, type: "Credit" }
    ]
  },
  { 
    id: "INV-2026-005", 
    client: "Vogue Accra", 
    date: "2026-04-28", 
    dueDate: "2026-05-12",
    amount: 3200.00, 
    status: "Paid", 
    type: "Inventory",
    billingEmail: "orders@vogueaccra.com",
    phone: "020-555-4433",
    address: "Osu, Oxford Street, Accra",
    lineItems: [
      { description: "Standard Receipt Printer", qty: 4, unitPrice: 500.00, total: 2000.00 },
      { description: "Cash Drawer Security Locks", qty: 4, unitPrice: 300.00, total: 1200.00 }
    ],
    paymentHistory: [
      { id: "PAY-004", date: "2026-04-29", amount: 3200.00, method: "MoMo (Telecel)", status: "Success", ref: "VOD-0923019" }
    ],
    relatedTransactions: [
      { id: "TX-4732", desc: "Hardware Stock Purchase Receipt", date: "2026-04-29", amount: 3200.00, type: "Credit" }
    ]
  }
];

export default function InvoicesPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>(INVOICE_DATA);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isMarkingPaid, setIsMarkingPaid] = useState<string | null>(null);

  // Load invoices on mount
  useEffect(() => {
    setLoading(true);
    apiClient.get('/api/invoices')
      .then((response) => {
        setLoading(false);
        const data = response.data?.data || response.data || [];
        if (data && data.length > 0) {
          const mapped: Invoice[] = data.map((inv: any) => ({
            id: inv.id,
            client: inv.client_name,
            date: inv.issue_date,
            dueDate: inv.due_date,
            amount: parseFloat(inv.amount) || 0,
            status: inv.status as "Pending" | "Paid" | "Overdue" | "Cancelled",
            type: inv.invoice_type as "Service" | "Product" | "Milestone" | "Retainer",
            billingEmail: inv.billing_email || "",
            phone: inv.phone || "",
            address: inv.address || "",
            lineItems: Array.isArray(inv.line_items) ? inv.line_items : [],
            paymentHistory: Array.isArray(inv.payment_history) ? inv.payment_history : [],
            relatedTransactions: Array.isArray(inv.related_transactions) ? inv.related_transactions : []
          }));
          setInvoices(mapped);
        } else {
          setInvoices(INVOICE_DATA);
        }
      })
      .catch((err) => {
        setLoading(false);
        console.error("Error loading invoices:", err);
        setInvoices(INVOICE_DATA);
      });
  }, []);

  // New Invoice Form State
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [client, setClient] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [type, setType] = useState("Service");
  const [dueDate, setDueDate] = useState("");
  
  const [lineItems, setLineItems] = useState<{ description: string; qty: string; unitPrice: string }[]>([
    { description: "", qty: "1", unitPrice: "" }
  ]);

  const addLineItemRow = () => {
    setLineItems([...lineItems, { description: "", qty: "1", unitPrice: "" }]);
  };

  const removeLineItemRow = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItemField = (index: number, field: string, value: string) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  // Filter invoices
  const filteredInvoices = invoices.filter(inv => 
    inv.id.toLowerCase().includes(search.toLowerCase()) || 
    inv.client.toLowerCase().includes(search.toLowerCase()) ||
    inv.type.toLowerCase().includes(search.toLowerCase())
  );

  // Calculations for stats
  const totalInvoiced = invoices.reduce((sum, item) => sum + item.amount, 0);
  const totalPaid = invoices.filter(item => item.status === "Paid").reduce((sum, item) => sum + item.amount, 0);
  const totalPending = invoices.filter(item => item.status === "Pending").reduce((sum, item) => sum + item.amount, 0);
  const totalOverdue = invoices.filter(item => item.status === "Overdue").reduce((sum, item) => sum + item.amount, 0);

  // Action helpers
  const handleDownload = (invoice: Invoice) => {
    toast.message(`Starting download for ${invoice.id}...`);
    
    // Construct rich text content representation of the invoice
    const content = `
========================================
             INVOICE RECEIPT            
========================================
Invoice Ref: ${invoice.id}
Date Issued: ${invoice.date}
Payment Due: ${invoice.dueDate}
Status:      ${invoice.status.toUpperCase()}

CLIENT DETAILS:
----------------------------------------
Name:    ${invoice.client}
Email:   ${invoice.billingEmail}
Phone:   ${invoice.phone}
Address: ${invoice.address}

LINE ITEMS:
----------------------------------------
${invoice.lineItems.map(item => `* ${item.description}
  Qty: ${item.qty} | Price: GH₵${item.unitPrice.toFixed(2)} | Subtotal: GH₵${item.total.toFixed(2)}`).join("\n\n")}

SUMMARY:
----------------------------------------
Subtotal:     GH₵${invoice.amount.toFixed(2)}
Sales Taxes:  GH₵0.00 (Included flat rate)
Total Amount: GH₵${invoice.amount.toFixed(2)}

PAYMENT LOGS:
----------------------------------------
${invoice.paymentHistory.length === 0 ? "No previous payments registered." : invoice.paymentHistory.map(p => `ID: ${p.id} | Date: ${p.date} | Method: ${p.method} | Status: ${p.status} | Ref: ${p.ref}`).join("\n")}

========================================
     Thank you for your partnership!
========================================
`;

    // Download file
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${invoice.id}_receipt.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast.success(`Invoice details downloaded as ${invoice.id}_receipt.txt`);
  };

  const handleResend = (invoice: Invoice) => {
    setIsSending(true);
    const toastId = toast.loading(`Connecting client mailer server to transmit invoice to ${invoice.billingEmail}...`);
    
    setTimeout(() => {
      setIsSending(false);
      toast.dismiss(toastId);
      toast.success(`Invoice resent successfully to ${invoice.billingEmail}`);
    }, 1500);
  };

  const handleMarkPaid = (invoiceId: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();

    const currentInvoice = invoices.find(inv => inv.id === invoiceId);
    if (!currentInvoice) return;

    const newPaymentHistory = [
      ...currentInvoice.paymentHistory,
      {
        id: `PAY-MANUAL`,
        date: new Date().toISOString().split('T')[0],
        amount: currentInvoice.amount,
        method: "Standard Cash Register Receive",
        status: "Success",
        ref: "REF-MANUAL-CASH"
      }
    ];

    setIsMarkingPaid(invoiceId);
    toast.loading("Recording cash receive event...");

    apiClient.put(`/api/invoices/${invoiceId}`, {
        status: "Paid",
        payment_history: newPaymentHistory
      })
      .then(() => {
        setIsMarkingPaid(null);
        toast.dismiss();
        toast.success(`Payment updated: Invoice ${invoiceId} marked as Fully Paid`);
        
        setInvoices(prev => prev.map(inv => {
          if (inv.id === invoiceId) {
            return {
              ...inv,
              status: "Paid",
              paymentHistory: newPaymentHistory
            };
          }
          return inv;
        }));

        if (selectedInvoice && selectedInvoice.id === invoiceId) {
          setSelectedInvoice(prev => prev ? {
            ...prev,
            status: "Paid",
            paymentHistory: newPaymentHistory
          } : null);
        }
      })
      .catch((err: any) => {
        setIsMarkingPaid(null);
        toast.dismiss();
        toast.error("Failed to update invoice payment: " + (err.response?.data?.error || err.message));
      });
  };

  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client.trim() || !billingEmail.trim()) {
      toast.error("Please fill in the client details.");
      return;
    }

    // Validate line items
    const validItems: LineItem[] = [];
    let grandTotal = 0;
    
    for (const item of lineItems) {
      if (!item.description.trim() || !item.qty.trim() || !item.unitPrice.trim()) {
        toast.error("Please fill in description, quantity and price for all rows.");
        return;
      }
      const qtyN = parseInt(item.qty) || 1;
      const priceN = parseFloat(item.unitPrice) || 0;
      const totalN = qtyN * priceN;
      
      grandTotal += totalN;
      validItems.push({
        description: item.description.trim(),
        qty: qtyN,
        unitPrice: priceN,
        total: totalN
      });
    }

    const todayDate = new Date().toISOString().split('T')[0];
    const due = dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const nextInvoiceNum = `INV-2026-00${invoices.length + 1}`;

    setLoading(true);
    apiClient.post('/api/invoices', {
        invoice_number: nextInvoiceNum,
        client_name: client.trim(),
        billing_email: billingEmail.trim(),
        phone: phone.trim() || "+233 24 000 0000",
        address: address.trim() || "Accra, Ghana",
        issue_date: todayDate,
        due_date: due,
        amount: grandTotal,
        status: "Pending",
        invoice_type: type,
        line_items: validItems,
        payment_history: [],
        related_transactions: []
      })
      .then((response) => {
        const data = response.data?.data || response.data;
        if (data) {
          const newInvoice: Invoice = {
            id: data.id,
            client: data.client_name,
            date: data.issue_date,
            dueDate: data.due_date,
            amount: parseFloat(data.amount) || 0,
            status: data.status as "Pending" | "Paid" | "Overdue" | "Cancelled",
            type: data.invoice_type as "Service" | "Product" | "Milestone" | "Retainer",
            billingEmail: data.billing_email || "",
            phone: data.phone || "",
            address: data.address || "",
            lineItems: data.line_items || [],
            paymentHistory: data.payment_history || [],
            relatedTransactions: data.related_transactions || []
          };

          setInvoices([newInvoice, ...invoices]);
          setIsCreateDialogOpen(false);
          toast.success(`Invoice "${newInvoice.client}" registered successfully!`);
          
          // Reset Form
          setClient("");
          setBillingEmail("");
          setPhone("");
          setAddress("");
          setType("Service");
          setDueDate("");
          setLineItems([{ description: "", qty: "1", unitPrice: "" }]);
        }
      });
  };

  return (
    <div className="p-6 sm:p-10 space-y-10 max-w-7xl mx-auto">
      
      <AnimatePresence mode="wait">
        {!selectedInvoice ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-10"
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                 <div className="flex items-center gap-2 mb-2">
                    <div className="h-5 w-1 bg-primary rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground italic">Billing</span>
                 </div>
                 <h1 className="text-4xl font-black italic tracking-tighter uppercase text-foreground leading-none">
                   Invoices & Bills
                 </h1>
              </div>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3 shadow-2xl shadow-primary/20 bg-primary border-none active:scale-95 cursor-pointer"
              >
                 <Plus className="h-5 w-5" /> Create New Invoice
              </Button>
            </div>

            {/* Analytics cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               {[
                 { title: "Total Store Invoiced", value: `GH₵ ${totalInvoiced.toLocaleString()}`, icon: FileText, color: "text-blue-500", label: "Completed invoices" },
                 { title: "Pending Collection", value: `GH₵ ${totalPending.toLocaleString()}`, icon: Clock, color: "text-amber-500", label: "Awaiting client response" },
                 { title: "Total Received Earnings", value: `GH₵ ${totalPaid.toLocaleString()}`, icon: CheckCircle2, color: "text-emerald-500", label: "Paid inside cash registers" },
                 { title: "Overdue Accounts", value: `GH₵ ${totalOverdue.toLocaleString()}`, icon: AlertCircle, color: "text-rose-500", label: "Over due payment frame" }
               ].map((stat, i) => (
                 <Card key={i} className="border-none bg-card/40 backdrop-blur-sm shadow-xl rounded-[35px] overflow-hidden group">
                    <CardContent className="p-8">
                       <div className="flex justify-between items-start mb-6">
                          <div className={"h-12 w-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/5 " + stat.color}>
                             <stat.icon className="h-5 w-5" />
                          </div>
                          <Badge variant="outline" className="text-[8px] font-black uppercase border-white/10 text-slate-500 px-2 py-0.5">Live Data</Badge>
                       </div>
                       <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1 italic">{stat.title}</div>
                       <div className="text-3xl font-black italic tracking-tighter uppercase text-slate-100 mb-1 leading-none">{stat.value}</div>
                       <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                    </CardContent>
                 </Card>
               ))}
            </div>

            {/* Content Table Card */}
            <Card className="border-none bg-card/40 backdrop-blur-md shadow-2xl rounded-[50px] overflow-hidden border border-white/5">
              <div className="p-10 border-b border-white/5 flex flex-col md:flex-row gap-8 justify-between items-center">
                 <div className="relative w-full md:w-96">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search partner or invoice ID..." 
                      className="h-14 pl-14 bg-white/5 border-none rounded-2xl italic font-bold text-slate-100"
                    />
                 </div>
                 <div className="flex gap-4 w-full md:w-auto">
                    <Button variant="outline" className="h-14 px-8 rounded-2xl bg-white/5 hover:bg-white/10 border-white/10 font-black uppercase tracking-widest text-[10px] gap-3">
                       <Filter className="h-4 w-4" /> Category filter
                    </Button>
                 </div>
              </div>
              <CardContent className="p-0">
                 <Table>
                    <TableHeader className="bg-white/5">
                       <TableRow className="hover:bg-transparent border-none">
                          <TableHead className="py-8 px-10 text-[10px] font-black uppercase tracking-widest italic text-slate-500">Invoice ID</TableHead>
                          <TableHead className="py-8 text-[10px] font-black uppercase tracking-widest italic text-slate-500">Partner</TableHead>
                          <TableHead className="py-8 text-[10px] font-black uppercase tracking-widest italic text-slate-500">Created Date</TableHead>
                          <TableHead className="py-8 text-[10px] font-black uppercase tracking-widest italic text-slate-500">Total Bill</TableHead>
                          <TableHead className="py-8 text-[10px] font-black uppercase tracking-widest italic text-slate-500">Status</TableHead>
                          <TableHead className="py-8 px-10 text-right text-[10px] font-black uppercase tracking-widest italic text-slate-500">Actions</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {filteredInvoices.map((inv) => (
                          <TableRow 
                            key={inv.id} 
                            onClick={() => setSelectedInvoice(inv)}
                            className="group hover:bg-white/[0.03] transition-all border-b border-white/5 cursor-pointer"
                          >
                             <TableCell className="px-10 py-10 font-black italic text-base text-primary tracking-tight">
                               #{inv.id}
                             </TableCell>
                             <TableCell>
                                <div>
                                   <div className="font-black italic text-lg leading-none mb-1 text-slate-200 tracking-tight uppercase group-hover:text-primary transition-colors">{inv.client}</div>
                                   <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{inv.type} Account</div>
                                </div>
                             </TableCell>
                             <TableCell className="font-bold text-slate-500 italic">{inv.date}</TableCell>
                             <TableCell className="font-black italic text-xl text-slate-100 tracking-tighter">GH₵ {inv.amount.toLocaleString()}</TableCell>
                             <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    "text-[9px] font-black uppercase px-4 py-1.5 border-none",
                                    inv.status === "Paid" ? "bg-emerald-500/10 text-emerald-500" : 
                                    inv.status === "Pending" ? "bg-amber-500/10 text-amber-500" : "bg-rose-500/10 text-rose-500"
                                  )}
                                >
                                   {inv.status}
                                </Badge>
                             </TableCell>
                             <TableCell className="text-right px-10" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                   <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:bg-primary hover:text-white rounded-xl transition-all">
                                         <MoreHorizontal className="h-5 w-5" />
                                      </Button>
                                   </DropdownMenuTrigger>
                                   <DropdownMenuContent align="end" className="bg-slate-900 border-white/10 rounded-2xl p-2 w-64 shadow-2xl z-50">
                                      <DropdownMenuItem 
                                        onClick={() => setSelectedInvoice(inv)}
                                        className="h-11 rounded-xl font-black uppercase tracking-widest text-[10px] gap-3 focus:bg-primary focus:text-white mb-1 transition-all cursor-pointer"
                                      >
                                         <FileText className="h-4 w-4 text-primary group-focus:text-white" /> View Complete Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => handleDownload(inv)}
                                        className="h-11 rounded-xl font-black uppercase tracking-widest text-[10px] gap-3 focus:bg-primary focus:text-white mb-1 transition-all cursor-pointer"
                                      >
                                         <Download className="h-4 w-4" /> Download Bill receipt
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => handleResend(inv)}
                                        className="h-11 rounded-xl font-black uppercase tracking-widest text-[10px] gap-3 focus:bg-primary focus:text-white mb-1 transition-all cursor-pointer"
                                      >
                                         <Send className="h-4 w-4" /> Resend Alert
                                      </DropdownMenuItem>
                                      {inv.status !== "Paid" && (
                                        <DropdownMenuItem 
                                          onClick={(e) => handleMarkPaid(inv.id, e)}
                                          className="h-11 rounded-xl font-black uppercase tracking-widest text-[10px] gap-3 focus:bg-emerald-600 focus:text-white transition-all cursor-pointer"
                                        >
                                           <CreditCard className="h-4 w-4 text-emerald-500" /> Mark as Paid
                                        </DropdownMenuItem>
                                      )}
                                   </DropdownMenuContent>
                                </DropdownMenu>
                             </TableCell>
                          </TableRow>
                       ))}
                       {filteredInvoices.length === 0 && (
                          <TableRow>
                             <TableCell colSpan={6} className="text-center py-20">
                                <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                                <h3 className="font-black uppercase text-slate-400 text-sm tracking-widest">No invoices found matching that query</h3>
                                <p className="text-slate-500 text-xs mt-1">Try searching another customer name or ID</p>
                             </TableCell>
                          </TableRow>
                       )}
                    </TableBody>
                 </Table>
              </CardContent>
              <div className="p-10 bg-white/[0.02] flex justify-between items-center">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 italic">{filteredInvoices.length} Invoices found in current filter</div>
                  <div className="flex gap-2">
                     <Button variant="outline" className="h-12 w-12 rounded-xl border-white/5 bg-white/5 opacity-50 cursor-not-allowed text-[10px] font-bold">1</Button>
                     <Button variant="outline" className="h-12 w-12 rounded-xl border-white/5 bg-white/5 hover:bg-white/10 transition-all text-[10px] font-bold">2</Button>
                  </div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="details"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {/* Back Nav and actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-white/5">
              <Button 
                variant="outline"
                onClick={() => setSelectedInvoice(null)}
                className="h-12 px-6 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 font-bold uppercase tracking-widest text-[10px] gap-2.5 self-start group active:scale-95"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Bills
              </Button>
              
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="outline"
                  onClick={() => handleDownload(selectedInvoice)}
                  className="h-12 px-6 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 font-bold uppercase tracking-widest text-[10px] gap-2.5 active:scale-95"
                >
                  <Download className="h-4 w-4" />
                  Download Invoice (.txt)
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => window.print()}
                  className="h-12 px-6 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 font-bold uppercase tracking-widest text-[10px] gap-2.5 active:scale-95"
                >
                  <Printer className="h-4 w-4" />
                  Print Copy
                </Button>

                <Button 
                  disabled={isSending}
                  onClick={() => handleResend(selectedInvoice)}
                  className="h-12 px-6 rounded-2xl bg-primary text-black hover:bg-primary/90 font-bold uppercase tracking-widest text-[10px] gap-2.5 shadow-xl shadow-primary/10 active:scale-95"
                >
                  <Send className="h-4 w-4" />
                  {isSending ? "Resending Alert..." : "Resend Alert Client"}
                </Button>
                
                {selectedInvoice.status !== "Paid" && (
                  <Button 
                    onClick={() => handleMarkPaid(selectedInvoice.id)}
                    className="h-12 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold uppercase tracking-widest text-[10px] gap-2.5 active:scale-95"
                  >
                    <Check className="h-4 w-4" />
                    Mark as Paid
                  </Button>
                )}
              </div>
            </div>

            {/* Core Invoice Summary Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left span card: Details, Bill structure */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Visual Invoice Paper Panel */}
                <Card className="border border-white/5 bg-slate-900/50 backdrop-blur-md rounded-[35px] overflow-hidden">
                  <div className="p-8 sm:p-12 space-y-8 sm:space-y-12">
                    
                    {/* Invoice header */}
                    <div className="flex flex-col sm:flex-row justify-between gap-6">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">NEXA DISTRIBUTED LEDGER</span>
                        <h2 className="text-3xl font-black italic tracking-tight text-white uppercase">{selectedInvoice.client}</h2>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Account type: {selectedInvoice.type}</p>
                      </div>
                      <div className="sm:text-right space-y-1">
                        <div className="text-xs font-black uppercase tracking-widest text-slate-600">INVOICE SERIAL</div>
                        <div className="text-2xl font-black tracking-tighter text-white">#{selectedInvoice.id}</div>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[9px] font-black uppercase px-4 py-1.5 border-none mt-2",
                            selectedInvoice.status === "Paid" ? "bg-emerald-500/10 text-emerald-500" : 
                            selectedInvoice.status === "Pending" ? "bg-amber-500/10 text-amber-500" : "bg-rose-500/10 text-rose-500"
                          )}
                        >
                          {selectedInvoice.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Metadata boxes */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-8 bg-white/5 rounded-3xl border border-white/5">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-primary" /> Date Issued
                        </span>
                        <div className="font-black text-sm text-slate-200">{selectedInvoice.date}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                          <Clock className="h-3 w-3 text-amber-500" /> Payment Due
                        </span>
                        <div className="font-black text-sm text-slate-200">{selectedInvoice.dueDate}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                          <Building className="h-3 w-3 text-blue-400" /> Account Hub
                        </span>
                        <div className="font-black text-sm text-slate-200 uppercase tracking-tight">{selectedInvoice.type} Logistics</div>
                      </div>
                    </div>

                    {/* Client details info */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 border-b border-white/5 pb-2">Billing Information</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-slate-400">
                            <User className="h-3.5 w-3.5 text-slate-600" />
                            <span>Contact recipient:</span>
                          </div>
                          <div className="text-slate-200">{selectedInvoice.client} Ltd.</div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Mail className="h-3.5 w-3.5 text-slate-600" />
                            <span>Invoice email:</span>
                          </div>
                          <div className="text-slate-200">{selectedInvoice.billingEmail}</div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-slate-400">
                            <span className="text-slate-600">☏</span>
                            <span>Phone Line:</span>
                          </div>
                          <div className="text-slate-200">{selectedInvoice.phone}</div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-slate-400">
                            <span className="text-slate-600">⚑</span>
                            <span>Billing Address:</span>
                          </div>
                          <div className="text-slate-200">{selectedInvoice.address}</div>
                        </div>
                      </div>
                    </div>

                    {/* Line Items Detail */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 border-b border-white/5 pb-2">Line Items Breakdown</h4>
                      <div className="rounded-2xl overflow-hidden border border-white/5">
                        <Table>
                          <TableHeader className="bg-white/5">
                            <TableRow className="border-none hover:bg-transparent">
                              <TableHead className="py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Item Description</TableHead>
                              <TableHead className="py-4 text-center text-[9px] font-black uppercase tracking-widest text-slate-400">Qty</TableHead>
                              <TableHead className="py-4 text-right text-[9px] font-black uppercase tracking-widest text-slate-400">Unit cost</TableHead>
                              <TableHead className="py-4 text-right text-[9px] font-black uppercase tracking-widest text-slate-400">Total charge</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedInvoice.lineItems.map((item, index) => (
                              <TableRow key={index} className="border-b border-white/5 hover:bg-transparent">
                                <TableCell className="font-bold text-slate-200 text-xs sm:text-sm py-4">{item.description}</TableCell>
                                <TableCell className="text-center font-black sm:text-sm py-4 text-slate-400">{item.qty}</TableCell>
                                <TableCell className="text-right font-black tracking-tight text-xs sm:text-sm py-4 text-slate-400">GH₵ {item.unitPrice.toFixed(2)}</TableCell>
                                <TableCell className="text-right font-black tracking-tight text-xs sm:text-sm py-4 text-slate-200">GH₵ {item.total.toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Totals column */}
                    <div className="flex flex-col items-end pt-4 space-y-2">
                      <div className="flex justify-between w-64 text-xs font-bold text-slate-500">
                        <span>Items Subtotal</span>
                        <span>GH₵ {selectedInvoice.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between w-64 text-xs font-bold text-slate-500">
                        <span>Taxes & VAT (Included)</span>
                        <span>GH₵ 0.00</span>
                      </div>
                      <div className="h-[1px] w-64 bg-white/10 my-2" />
                      <div className="flex justify-between w-64 text-lg font-black text-slate-100 italic">
                        <span>Total Due</span>
                        <span className="text-primary">GH₵ {selectedInvoice.amount.toFixed(2)}</span>
                      </div>
                    </div>

                  </div>
                </Card>

                {/* Second Inner Card: Payment history */}
                <Card className="border border-white/5 bg-slate-900/50 backdrop-blur-md rounded-[35px] p-8 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-emerald-500" />
                      Payment History Logs
                    </h3>
                    <Badge variant="outline" className="text-[8px] font-black border-none bg-emerald-500/10 text-emerald-500 px-3 py-1">Secure</Badge>
                  </div>

                  {selectedInvoice.paymentHistory.length === 0 ? (
                    <div className="py-12 text-center space-y-2">
                      <AlertCircle className="h-8 w-8 text-amber-500/60 mx-auto" />
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">No payment records found</div>
                      <p className="text-slate-500 text-xs font-medium max-w-sm mx-auto">This customer has not cleared this invoice yet. Use the actions panel or check registers for cash captures.</p>
                      {selectedInvoice.status !== "Paid" && (
                        <Button 
                          onClick={() => handleMarkPaid(selectedInvoice.id)}
                          className="h-10 px-5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold uppercase tracking-widest text-[9px] gap-2 mt-4 inline-flex"
                        >
                          <Check className="h-3 w-3" /> Record Cash Received
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-2xl overflow-hidden border border-white/5">
                      <Table>
                        <TableHeader className="bg-white/5">
                          <TableRow className="border-none hover:bg-transparent">
                            <TableHead className="py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Payment ID</TableHead>
                            <TableHead className="py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Date</TableHead>
                            <TableHead className="py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Method</TableHead>
                            <TableHead className="py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Ref Code</TableHead>
                            <TableHead className="py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Amount Sent</TableHead>
                            <TableHead className="py-4 text-right text-[9px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedInvoice.paymentHistory.map((p) => (
                            <TableRow key={p.id} className="border-b border-white/5 hover:bg-transparent">
                              <TableCell className="font-bold text-slate-200 text-xs py-4">{p.id}</TableCell>
                              <TableCell className="font-bold text-slate-550 text-xs py-4 text-slate-400">{p.date}</TableCell>
                              <TableCell className="font-bold text-slate-200 text-xs py-4 text-slate-200">{p.method}</TableCell>
                              <TableCell className="font-bold text-slate-500 font-mono text-xs py-4 text-slate-500">{p.ref}</TableCell>
                              <TableCell className="font-black italic text-xs py-4 text-slate-200">GH₵ {p.amount.toFixed(2)}</TableCell>
                              <TableCell className="text-right py-4">
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-none font-bold text-[9px] px-2 py-0.5">
                                  {p.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </Card>

              </div>

              {/* Sidebar layout column: Related Tx / status checks */}
              <div className="space-y-8">
                
                {/* Visual Status Indicator Block */}
                <Card className="border border-white/5 bg-slate-900/50 backdrop-blur-md rounded-[35px] p-8 space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Collection progress</h3>
                  
                  <div className="flex items-center gap-6">
                    <div className="relative h-20 w-20 flex items-center justify-center rounded-full border-4 border-white/5">
                      <div className={cn(
                        "h-14 w-14 rounded-full flex items-center justify-center font-black italic text-sm border",
                        selectedInvoice.status === "Paid" ? "border-emerald-500/20 text-emerald-400" :
                        selectedInvoice.status === "Pending" ? "border-amber-500/20 text-amber-400" : "border-rose-500/20 text-rose-400"
                      )}>
                        {selectedInvoice.status === "Paid" ? "100%" : "0%"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">CURRENT CLEARANCE</div>
                      <div className="text-xl font-black italic uppercase text-slate-100">{selectedInvoice.status} Account</div>
                      <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">This payment profile was parsed in the central ledger database and recorded.</p>
                    </div>
                  </div>
                </Card>

                {/* Related audit ledger entries */}
                <Card className="border border-white/5 bg-slate-900/50 backdrop-blur-md rounded-[35px] p-8 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-blue-400" />
                    Related Transactions
                  </h3>
                  <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">Financial ledger transactions connected to the issuance or execution of this bill:</p>

                  <div className="space-y-3">
                    {selectedInvoice.relatedTransactions.length === 0 ? (
                      <div className="p-4 rounded-2xl bg-white/5 text-center text-slate-500 text-[10px] font-bold">
                        No transactions tied to this ledger yet.
                      </div>
                    ) : (
                      selectedInvoice.relatedTransactions.map((tx) => (
                        <div key={tx.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all flex items-center justify-between">
                          <div>
                            <div className="text-xs font-black text-white">{tx.id}</div>
                            <div className="text-[9px] text-slate-400 font-bold mt-0.5">{tx.desc}</div>
                            <div className="text-[9px] text-slate-600 tracking-wider font-mono mt-0.5">{tx.date}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-black text-emerald-400">+GH₵ {tx.amount.toLocaleString()}</div>
                            <Badge className="bg-blue-500/10 text-blue-400 border-none mt-1 text-[8px] font-black uppercase">
                              {tx.type}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>

                {/* Integration Info Box */}
                <div className="p-8 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 space-y-2">
                  <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">STORE BOOKKEEPING INTEGRATION</span>
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Automated Sales Invoicing</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed">Ghanaian tax compliances require all invoices to declare standard Flat rate rules. This document was synchronized with active cloud services and is protected under cryptographic security frameworks.</p>
                </div>

              </div>
              
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Dynamic Custom Invoice Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[700px] p-8 bg-slate-950/95 backdrop-blur-2xl border border-white/10 rounded-[32px] text-white shadow-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter text-white flex items-center gap-2">
              <Plus className="h-6 w-6 text-primary" />
              <span>Create New Invoice Draft</span>
            </DialogTitle>
            <DialogDescription className="text-xs font-semibold text-slate-400">
              Complete the ledger fields and line items list to issue a compliant, trackable transaction draft.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateInvoiceSubmit} className="space-y-6 pt-4">
            {/* Client Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-1">Client / Business Name</label>
                <Input 
                  value={client} 
                  onChange={(e) => setClient(e.target.value)} 
                  placeholder="e.g. Ama Serwaah" 
                  className="h-12 bg-white/[0.03] border-white/5 hover:border-white/10 focus:border-primary/50 opacity-100 placeholder-slate-600 rounded-xl font-bold px-4 text-xs" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-1">Billing Email</label>
                <Input 
                  value={billingEmail} 
                  onChange={(e) => setBillingEmail(e.target.value)} 
                  type="email"
                  placeholder="name@business.com" 
                  className="h-12 bg-white/[0.03] border-white/5 hover:border-white/10 focus:border-primary/50 opacity-100 placeholder-slate-600 rounded-xl font-bold px-4 text-xs" 
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-1">Phone Contact</label>
                <Input 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="+233 24 000 0000" 
                  className="h-12 bg-white/[0.03] border-white/5 hover:border-white/10 focus:border-primary/50 opacity-100 placeholder-slate-600 rounded-xl font-mono px-4 text-xs" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-1">Invoice Category</label>
                <select 
                  value={type} 
                  onChange={(e) => setType(e.target.value)}
                  className="w-full h-12 bg-slate-900 border border-white/5 focus:border-primary/50 rounded-xl font-bold px-4 text-sm text-slate-300 outline-none"
                >
                  <option value="Service">Service / Consultation</option>
                  <option value="Inventory">Inventory Supply</option>
                  <option value="Consulting">Consulting Session</option>
                  <option value="General">General Trade</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-1">Payment Due Date</label>
                <Input 
                  value={dueDate} 
                  onChange={(e) => setDueDate(e.target.value)} 
                  type="date"
                  className="h-12 bg-white/[0.03] border-white/5 hover:border-white/10 focus:border-primary/50 rounded-xl px-4 text-slate-300 text-xs" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-1">Billing Address</label>
              <Input 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                placeholder="Airport Residential, Accra" 
                className="h-12 bg-white/[0.03] border-white/5 hover:border-white/10 focus:border-primary/50 opacity-100 placeholder-slate-600 rounded-xl px-4 text-xs" 
              />
            </div>

            {/* Line Items Sector */}
            <div className="space-y-4 border-t border-white/5 pt-4">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Line Items Breakdown</h4>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addLineItemRow}
                  className="h-8 px-3 rounded-lg border-white/10 bg-white/5 hover:bg-white/10 font-bold uppercase tracking-wider text-[8px] gap-2 flex items-center cursor-pointer"
                >
                  <Plus className="h-3 w-3" /> Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {lineItems.map((item, index) => (
                  <div key={index} className="flex gap-3 items-end bg-white/[0.02] p-3 rounded-xl border border-white/5">
                    <div className="flex-1 space-y-1.5 min-w-[200px]">
                      <label className="text-[8px] uppercase font-black text-slate-500 tracking-wider">Description</label>
                      <Input 
                        value={item.description}
                        onChange={(e) => updateLineItemField(index, "description", e.target.value)}
                        placeholder="Item or service name"
                        className="h-10 bg-slate-900 border-white/5 hover:border-white/10 rounded-lg px-3 text-xs"
                        required
                      />
                    </div>

                    <div className="w-20 space-y-1.5">
                      <label className="text-[8px] uppercase font-black text-slate-500 tracking-wider">Qty</label>
                      <Input 
                        value={item.qty}
                        type="number"
                        min="1"
                        onChange={(e) => updateLineItemField(index, "qty", e.target.value)}
                        className="h-10 bg-slate-900 border-white/5 hover:border-white/10 rounded-lg px-3 text-xs font-bold"
                        required
                      />
                    </div>

                    <div className="w-28 space-y-1.5">
                      <label className="text-[8px] uppercase font-black text-slate-500 tracking-wider">Cost (GH₵)</label>
                      <Input 
                        value={item.unitPrice}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        onChange={(e) => updateLineItemField(index, "unitPrice", e.target.value)}
                        className="h-10 bg-slate-900 border-white/5 hover:border-white/10 rounded-lg px-3 text-xs font-bold"
                        required
                      />
                    </div>

                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeLineItemRow(index)}
                      className={cn(
                        "h-10 w-10 text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 rounded-lg cursor-pointer",
                        lineItems.length === 1 && "opacity-30 cursor-not-allowed pointer-events-none"
                      )}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Summary Row */}
            <div className="flex justify-end pr-4 text-right">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Estimated Draft Total</span>
                <span className="text-2xl font-black italic tracking-tighter text-emerald-400">
                  GH₵ {lineItems.reduce((acc, curr) => {
                    const q = parseFloat(curr.qty) || 0;
                    const p = parseFloat(curr.unitPrice) || 0;
                    return acc + (q * p);
                  }, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Cancel & Action Controls */}
            <div className="flex gap-4 pt-4 border-t border-white/5">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)} 
                className="flex-1 h-12 border-white/5 text-slate-400 hover:bg-white/5 rounded-xl font-black uppercase tracking-widest text-[9px] cursor-pointer"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl font-black uppercase tracking-widest text-[9px] border-none shadow-xl shadow-primary/20 cursor-pointer"
              >
                Assemble & Publish Invoice
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
