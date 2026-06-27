import * as React from "react";
import { useState, useEffect } from "react";
import {
  FileBarChart, Printer, TrendingUp, TrendingDown, Wallet,
  Banknote, Smartphone, CreditCard, Clock, CheckCircle2, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import apiClient from "@/lib/api-client";

export default function ZReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [openingFloat, setOpeningFloat] = useState("");
  const [countedCash, setCountedCash] = useState("");
  const [notes, setNotes] = useState("");
  const [creating, setCreating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/api/z-reports");
      const data = res.data?.data || res.data || [];
      setReports(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load Z-reports");
    } finally {
      setLoading(false);
    }
  };

  const createReport = async () => {
    try {
      setCreating(true);
      await apiClient.post("/api/z-reports", {
        openingFloat: parseFloat(openingFloat) || 0,
        countedCash: parseFloat(countedCash) || 0,
        notes,
      });
      toast.success("Z-Report generated successfully!");
      setShowCreateForm(false);
      setOpeningFloat(""); setCountedCash(""); setNotes("");
      fetchReports();
    } catch {
      toast.error("Failed to create Z-report");
    } finally {
      setCreating(false);
    }
  };

  const fmt = (v: any) => `₵${Number(v || 0).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Z-Reports & End-of-Day</h1>
          <p className="text-sm text-muted-foreground">Daily cash reconciliation and sales summary</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)} className="gap-2">
          <FileBarChart className="h-4 w-4" />
          Close Day & Generate Z-Report
        </Button>
      </div>

      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Close Day — Generate Z-Report</CardTitle>
                <CardDescription>Count your cash drawer and close the day. This will aggregate all sales since the last Z-Report.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Opening Float (₵)</label>
                    <Input type="number" placeholder="0.00" value={openingFloat} onChange={e => setOpeningFloat(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Counted Cash (₵)</label>
                    <Input type="number" placeholder="0.00" value={countedCash} onChange={e => setCountedCash(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notes</label>
                    <Input placeholder="Optional notes..." value={notes} onChange={e => setNotes(e.target.value)} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={createReport} disabled={creating}>
                    {creating ? "Generating..." : "Generate Z-Report"}
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedReport ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Z-Report {selectedReport.reportNumber}</CardTitle>
              <CardDescription>{new Date(selectedReport.closingTime).toLocaleString()}</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setSelectedReport(null)}>Back to List</Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={Banknote} label="Cash Sales" value={fmt(selectedReport.cashSales)} color="text-green-500" />
              <StatCard icon={Smartphone} label="MoMo Sales" value={fmt(selectedReport.momoSales)} color="text-blue-500" />
              <StatCard icon={CreditCard} label="Card Sales" value={fmt(selectedReport.cardSales)} color="text-purple-500" />
              <StatCard icon={Clock} label="Credit Sales" value={fmt(selectedReport.creditSales)} color="text-orange-500" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={TrendingUp} label="Total Sales" value={fmt(selectedReport.totalSales)} color="text-primary" />
              <StatCard icon={TrendingDown} label="Refunds" value={fmt(selectedReport.totalRefunds)} color="text-red-500" />
              <StatCard icon={Wallet} label="Expenses" value={fmt(selectedReport.totalExpenses)} color="text-red-500" />
              <StatCard icon={TrendingUp} label="Net Profit" value={fmt(selectedReport.totalProfit)} color="text-green-500" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={Wallet} label="Opening Float" value={fmt(selectedReport.openingFloat)} />
              <StatCard icon={Wallet} label="Expected Cash" value={fmt(selectedReport.expectedCash)} />
              <StatCard icon={Wallet} label="Counted Cash" value={fmt(selectedReport.countedCash)} />
              <StatCard
                icon={selectedReport.cashVariance < 0 ? AlertTriangle : CheckCircle2}
                label="Variance"
                value={fmt(selectedReport.cashVariance)}
                color={Math.abs(Number(selectedReport.cashVariance)) > 1 ? "text-red-500" : "text-green-500"}
              />
            </div>
            <div className="flex items-center gap-4 pt-4 border-t">
              <Badge variant="outline">Transactions: {selectedReport.transactionCount}</Badge>
              <Badge variant="outline">Total Tax: {fmt(selectedReport.totalTax)}</Badge>
              <Button variant="outline" size="sm" className="gap-2 ml-auto" onClick={() => window.print()}>
                <Printer className="h-4 w-4" /> Print Report
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent Z-Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : reports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No Z-reports yet. Close your first day to generate one.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total Sales</TableHead>
                    <TableHead>Cash</TableHead>
                    <TableHead>MoMo</TableHead>
                    <TableHead>Profit</TableHead>
                    <TableHead>Variance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((r) => (
                    <TableRow key={r.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedReport(r)}>
                      <TableCell className="font-mono text-xs">{r.reportNumber}</TableCell>
                      <TableCell>{new Date(r.closingTime).toLocaleDateString()}</TableCell>
                      <TableCell className="font-semibold">{fmt(r.totalSales)}</TableCell>
                      <TableCell>{fmt(r.cashSales)}</TableCell>
                      <TableCell>{fmt(r.momoSales)}</TableCell>
                      <TableCell className="text-green-500">{fmt(r.totalProfit)}</TableCell>
                      <TableCell className={cn("font-semibold", Math.abs(Number(r.cashVariance)) > 1 ? "text-red-500" : "text-green-500")}>
                        {fmt(r.cashVariance)}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-2">
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4", color || "text-muted-foreground")} />
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <p className={cn("text-lg font-bold", color)}>{value}</p>
    </div>
  );
}
