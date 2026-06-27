import * as React from "react";
import { useState, useEffect } from "react";
import {
  RotateCcw, Search, AlertCircle, CheckCircle2, Loader2, Package
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";

export default function ReturnsPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [returnDialog, setReturnDialog] = useState<any>(null);
  const [reason, setReason] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [returnsRes, salesRes] = await Promise.all([
        apiClient.get("/api/returns"),
        apiClient.get("/api/sales?limit=50"),
      ]);
      const returnsData = returnsRes.data?.data || returnsRes.data || [];
      const salesData = salesRes.data?.data || salesRes.data || [];
      setReturns(Array.isArray(returnsData) ? returnsData : []);
      setSales(Array.isArray(salesData) ? salesData.filter((s: any) => s.status === "completed") : []);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!reason || !returnDialog) return;
    try {
      setProcessing(true);
      await apiClient.post("/api/returns", {
        saleId: returnDialog.id,
        reason,
      });
      toast.success("Return processed successfully! Items restocked.");
      setReturnDialog(null);
      setReason("");
      fetchData();
    } catch {
      toast.error("Failed to process return");
    } finally {
      setProcessing(false);
    }
  };

  const fmt = (v: any) => `₵${Number(v || 0).toFixed(2)}`;

  const filteredSales = sales.filter(s =>
    !search ||
    s.receiptNumber?.toLowerCase().includes(search.toLowerCase()) ||
    s.customer?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Returns & Refunds</h1>
        <p className="text-sm text-muted-foreground">Process product returns, restock items, and issue refunds</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search sales to return..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Sales (Select to Return)</CardTitle>
              <CardDescription>Click "Return" on a sale to process a refund</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : filteredSales.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No sales found</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Receipt</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.slice(0, 15).map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-mono text-xs">{s.receiptNumber}</TableCell>
                        <TableCell>{s.customer?.name || "Walk-in"}</TableCell>
                        <TableCell className="font-semibold">{fmt(s.totalAmount)}</TableCell>
                        <TableCell className="text-xs">{new Date(s.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" className="gap-1" onClick={() => setReturnDialog(s)}>
                            <RotateCcw className="h-3 w-3" /> Return
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Return History</CardTitle>
          </CardHeader>
          <CardContent>
            {returns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No returns processed yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Refund</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {returns.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs">{r.sale?.receiptNumber || "—"}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{r.reason}</TableCell>
                      <TableCell className="font-semibold text-red-500">{fmt(r.totalAmount)}</TableCell>
                      <TableCell className="text-xs">{new Date(r.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!returnDialog} onOpenChange={(open) => !open && setReturnDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Return & Refund</DialogTitle>
            <DialogDescription>
              Receipt: {returnDialog?.receiptNumber} — {returnDialog?.customer?.name || "Walk-in"}
              <br />
              Refund Amount: <span className="font-bold text-red-500">{fmt(returnDialog?.totalAmount)}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 flex gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                All items from this sale will be restocked automatically. The sale will be marked as refunded.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason for Return</label>
              <Textarea
                placeholder="e.g. Defective product, customer changed mind, wrong item..."
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReturn} disabled={processing || !reason}>
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
              {processing ? "Processing..." : "Process Return & Refund"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
