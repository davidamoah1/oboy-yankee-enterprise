import * as React from "react";
import { useState, useEffect } from "react";
import {
  HandCoins, Plus, Search, CheckCircle2, Clock, AlertCircle, Phone, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import apiClient from "@/lib/api-client";

export default function CreditSalesPage() {
  const [creditSales, setCreditSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [paymentDialog, setPaymentDialog] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [processing, setProcessing] = useState(false);

  useEffect(() => { fetchCreditSales(); }, []);

  const fetchCreditSales = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/api/credit-sales");
      const data = res.data?.data || res.data || [];
      setCreditSales(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load credit sales");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!paymentAmount || !paymentDialog) return;
    try {
      setProcessing(true);
      await apiClient.post("/api/credit-payments", {
        saleId: paymentDialog.id,
        customerId: paymentDialog.customerId,
        amount: parseFloat(paymentAmount),
        paymentMethod,
      });
      toast.success("Credit payment recorded successfully!");
      setPaymentDialog(null);
      setPaymentAmount("");
      fetchCreditSales();
    } catch {
      toast.error("Failed to record payment");
    } finally {
      setProcessing(false);
    }
  };

  const fmt = (v: any) => `₵${Number(v || 0).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const filtered = creditSales.filter(s =>
    !search ||
    s.receiptNumber?.toLowerCase().includes(search.toLowerCase()) ||
    s.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.customer?.phone?.includes(search)
  );

  const totalDebt = creditSales.reduce((sum, s) => sum + Number(s.totalAmount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Credit Sales & Debt Tracking</h1>
          <p className="text-sm text-muted-foreground">Track owed money and collect payments from customers</p>
        </div>
        <Card className="px-4 py-2">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total Outstanding Debt</p>
            <p className="text-xl font-bold text-red-500">{fmt(totalDebt)}</p>
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by receipt or customer..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>No outstanding credit sales. All debts settled!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Total Owed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs">{s.receiptNumber}</TableCell>
                    <TableCell className="font-medium">{s.customer?.name || "Walk-in"}</TableCell>
                    <TableCell className="text-xs">{s.customer?.phone || "—"}</TableCell>
                    <TableCell className="font-bold text-red-500">{fmt(s.totalAmount)}</TableCell>
                    <TableCell>
                      <Badge variant={s.paymentStatus === "partial" ? "secondary" : "destructive"}>
                        {s.paymentStatus === "partial" ? "Partial" : "Unpaid"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{new Date(s.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => { setPaymentDialog(s); setPaymentAmount(String(Number(s.totalAmount))); }}
                      >
                        <HandCoins className="h-4 w-4" /> Collect
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!paymentDialog} onOpenChange={(open) => !open && setPaymentDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Collect Credit Payment</DialogTitle>
            <DialogDescription>
              {paymentDialog?.customer?.name || "Walk-in customer"} — Receipt: {paymentDialog?.receiptNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-xl bg-muted p-4 space-y-1">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Owed</span>
                <span className="font-bold text-red-500">{fmt(paymentDialog?.totalAmount)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Amount (₵)</label>
              <Input type="number" placeholder="0.00" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Method</label>
              <div className="flex gap-2">
                {["cash", "momo", "card"].map(m => (
                  <Button
                    key={m}
                    variant={paymentMethod === m ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPaymentMethod(m)}
                    className="capitalize"
                  >
                    {m}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialog(null)}>Cancel</Button>
            <Button onClick={handlePayment} disabled={processing || !paymentAmount}>
              {processing ? "Processing..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
