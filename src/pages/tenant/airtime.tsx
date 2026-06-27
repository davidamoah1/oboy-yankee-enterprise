import * as React from "react";
import { useState, useEffect } from "react";
import {
  Phone, Smartphone, Wifi, ArrowRight, History, CheckCircle2,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import apiClient from "@/lib/api-client";

const NETWORKS = [
  { id: "mtn", name: "MTN", color: "bg-yellow-500", textColor: "text-black" },
  { id: "telecel", name: "Telecel", color: "bg-red-500", textColor: "text-white" },
  { id: "airteltigo", name: "AirtelTigo", color: "bg-blue-500", textColor: "text-white" },
];

const DATA_BUNDLES = [
  { label: "Daily 50MB", amount: 0.5 },
  { label: "Daily 150MB", amount: 1 },
  { label: "Weekly 350MB", amount: 2 },
  { label: "Weekly 1GB", amount: 5 },
  { label: "Monthly 2GB", amount: 10 },
  { label: "Monthly 5GB", amount: 25 },
  { label: "Monthly 10GB", amount: 50 },
  { label: "Monthly 20GB", amount: 100 },
];

const QUICK_AMOUNTS = [1, 2, 5, 10, 20, 50];

export default function AirtimePage() {
  const [tab, setTab] = useState<"airtime" | "data">("airtime");
  const [network, setNetwork] = useState("mtn");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedBundle, setSelectedBundle] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await apiClient.get("/api/airtime");
      const data = res.data?.data || res.data || [];
      setHistory(Array.isArray(data) ? data : []);
    } catch {
      // silent
    } finally {
      setLoadingHistory(false);
    }
  };

  const handlePurchase = async () => {
    if (!phoneNumber || !amount) {
      toast.error("Phone number and amount are required");
      return;
    }
    if (phoneNumber.length < 9) {
      toast.error("Enter a valid phone number");
      return;
    }
    try {
      setProcessing(true);
      await apiClient.post("/api/airtime", {
        network,
        productType: tab,
        phoneNumber,
        amount: parseFloat(amount),
      });
      toast.success(`${tab === "airtime" ? "Airtime" : "Data"} purchased successfully!`);
      setPhoneNumber(""); setAmount(""); setSelectedBundle(null);
      fetchHistory();
    } catch {
      toast.error("Failed to process purchase");
    } finally {
      setProcessing(false);
    }
  };

  const fmt = (v: any) => `₵${Number(v || 0).toFixed(2)}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Airtime & Data Bundles</h1>
        <p className="text-sm text-muted-foreground">Sell MTN, Telecel, and AirtelTigo airtime and data bundles</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex gap-2">
                <Button
                  variant={tab === "airtime" ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setTab("airtime"); setSelectedBundle(null); setAmount(""); }}
                  className="gap-2"
                >
                  <Phone className="h-4 w-4" /> Airtime
                </Button>
                <Button
                  variant={tab === "data" ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setTab("data"); setAmount(""); }}
                  className="gap-2"
                >
                  <Wifi className="h-4 w-4" /> Data Bundle
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Network</label>
                <div className="grid grid-cols-3 gap-2">
                  {NETWORKS.map(n => (
                    <button
                      key={n.id}
                      onClick={() => setNetwork(n.id)}
                      className={cn(
                        "rounded-xl p-3 text-center font-bold text-sm transition-all border-2",
                        network === n.id ? "border-primary scale-105" : "border-transparent opacity-60 hover:opacity-100"
                      )}
                    >
                      <div className={cn("h-8 w-8 rounded-lg mx-auto mb-1 flex items-center justify-center", n.color)}>
                        <Smartphone className={cn("h-4 w-4", n.textColor)} />
                      </div>
                      {n.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <Input
                  placeholder="e.g. 0241234567"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  maxLength={15}
                />
              </div>

              {tab === "airtime" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount (₵)</label>
                  <Input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
                  <div className="flex flex-wrap gap-2 pt-2">
                    {QUICK_AMOUNTS.map(a => (
                      <Button
                        key={a}
                        variant={amount === String(a) ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAmount(String(a))}
                      >
                        ₵{a}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Bundle</label>
                  <div className="grid grid-cols-2 gap-2">
                    {DATA_BUNDLES.map((b, i) => (
                      <button
                        key={i}
                        onClick={() => { setSelectedBundle(i); setAmount(String(b.amount)); }}
                        className={cn(
                          "rounded-xl p-3 text-left border-2 transition-all",
                          selectedBundle === i ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                        )}
                      >
                        <p className="text-sm font-bold">{b.label}</p>
                        <p className="text-xs text-muted-foreground">₵{b.amount}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Commission (3%)</p>
                  <p className="text-sm font-bold text-green-500">{fmt(parseFloat(amount) * 0.03)}</p>
                </div>
                <Button onClick={handlePurchase} disabled={processing || !amount || !phoneNumber} className="gap-2">
                  {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  {processing ? "Processing..." : `Sell ${tab === "airtime" ? "Airtime" : "Data"}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" /> Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingHistory ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No airtime sales yet</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Network</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.slice(0, 15).map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <Badge variant="outline" className="uppercase">{s.network}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{s.phoneNumber}</TableCell>
                      <TableCell className="capitalize">{s.productType}</TableCell>
                      <TableCell className="font-semibold">{fmt(s.amount)}</TableCell>
                      <TableCell className="text-green-500">{fmt(s.commission)}</TableCell>
                      <TableCell className="text-xs">{new Date(s.createdAt).toLocaleDateString()}</TableCell>
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
