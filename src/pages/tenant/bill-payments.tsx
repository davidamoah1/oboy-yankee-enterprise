import * as React from "react";
import { useState, useEffect } from "react";
import {
  Zap, Droplets, Tv, GraduationCap, ArrowRight, History, CheckCircle2, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import apiClient from "@/lib/api-client";

const PROVIDERS = [
  { id: "ecg", name: "ECG (Electricity)", icon: Zap, color: "text-yellow-500" },
  { id: "ghana_water", name: "Ghana Water", icon: Droplets, color: "text-blue-500" },
  { id: "dstv", name: "DSTV", icon: Tv, color: "text-purple-500" },
  { id: "gotv", name: "GOtv", icon: Tv, color: "text-green-500" },
  { id: "school_fees", name: "School Fees", icon: GraduationCap, color: "text-orange-500" },
];

export default function BillPaymentsPage() {
  const [provider, setProvider] = useState("ecg");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await apiClient.get("/api/bill-payments");
      const data = res.data?.data || res.data || [];
      setHistory(Array.isArray(data) ? data : []);
    } catch {
      // silent
    } finally {
      setLoadingHistory(false);
    }
  };

  const handlePay = async () => {
    if (!accountNumber || !amount) {
      toast.error("Account number and amount are required");
      return;
    }
    try {
      setProcessing(true);
      await apiClient.post("/api/bill-payments", {
        provider,
        accountNumber,
        accountName,
        amount: parseFloat(amount),
      });
      toast.success("Bill payment processed successfully!");
      setAccountNumber(""); setAccountName(""); setAmount("");
      fetchHistory();
    } catch {
      toast.error("Failed to process bill payment");
    } finally {
      setProcessing(false);
    }
  };

  const fmt = (v: any) => `₵${Number(v || 0).toFixed(2)}`;
  const selectedProvider = PROVIDERS.find(p => p.id === provider);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bill Payments</h1>
        <p className="text-sm text-muted-foreground">Pay ECG, Ghana Water, DSTV, GOtv, and school fees for customers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>New Bill Payment</CardTitle>
            <CardDescription>Select provider and enter customer details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Provider</label>
              <div className="grid grid-cols-1 gap-2">
                {PROVIDERS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setProvider(p.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl p-3 border-2 transition-all text-left",
                      provider === p.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    )}
                  >
                    <p.icon className={cn("h-5 w-5", p.color)} />
                    <span className="text-sm font-medium">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Account / Meter Number</label>
              <Input placeholder="e.g. 1234567890" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Account Name (Optional)</label>
              <Input placeholder="e.g. Kofi Mensah" value={accountName} onChange={e => setAccountName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (₵)</label>
              <Input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="text-xs text-muted-foreground">Commission (2%)</p>
                <p className="text-sm font-bold text-green-500">{fmt(parseFloat(amount) * 0.02)}</p>
              </div>
              <Button onClick={handlePay} disabled={processing || !amount || !accountNumber} className="gap-2">
                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                {processing ? "Processing..." : "Process Payment"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" /> Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingHistory ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No bill payments yet</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.slice(0, 15).map((p) => (
                    <TableRow key={p.id}>
                      <TableCell><Badge variant="outline" className="uppercase">{p.provider}</Badge></TableCell>
                      <TableCell className="font-mono text-xs">{p.accountNumber}</TableCell>
                      <TableCell className="font-semibold">{fmt(p.amount)}</TableCell>
                      <TableCell className="text-green-500">{fmt(p.commission)}</TableCell>
                      <TableCell className="text-xs">{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
