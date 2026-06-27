import * as React from "react";
import { useState, useEffect } from "react";
import {
  TrendingUp, TrendingDown, DollarSign, Percent, Package, Loader2, Award
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

export default function ProfitAnalysisPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => { fetchAnalysis(); }, []);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      const res = await apiClient.get(`/api/profit-analysis?${params.toString()}`);
      setData(res.data);
    } catch {
      toast.error("Failed to load profit analysis");
    } finally {
      setLoading(false);
    }
  };

  const fmt = (v: any) => `₵${Number(v || 0).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const pct = (v: any) => `${Number(v || 0).toFixed(1)}%`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profit & Margin Analysis</h1>
        <p className="text-sm text-muted-foreground">Track revenue, cost, and profit margins by product</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Start Date</label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-auto" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">End Date</label>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-auto" />
            </div>
            <Button onClick={fetchAnalysis} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
              Analyze
            </Button>
          </div>
        </CardContent>
      </Card>

      {data && !loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard icon={DollarSign} label="Total Revenue" value={fmt(data.totalRevenue)} color="text-blue-500" />
            <StatCard icon={TrendingDown} label="Total Cost" value={fmt(data.totalCost)} color="text-orange-500" />
            <StatCard icon={TrendingUp} label="Total Profit" value={fmt(data.totalProfit)} color="text-green-500" />
            <StatCard icon={Percent} label="Profit Margin" value={pct(data.margin)} color="text-primary" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Profit by Product</CardTitle>
              <CardDescription>{data.transactionCount} transactions analyzed</CardDescription>
            </CardHeader>
            <CardContent>
              {data.productProfits.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No sales data for this period</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Qty Sold</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Profit</TableHead>
                      <TableHead>Margin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.productProfits.slice(0, 30).map((p: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {i < 3 && <Award className="h-4 w-4 text-yellow-500" />}
                            {p.productName}
                          </div>
                        </TableCell>
                        <TableCell>{p.quantity}</TableCell>
                        <TableCell className="font-semibold">{fmt(p.revenue)}</TableCell>
                        <TableCell className="text-orange-500">{fmt(p.cost)}</TableCell>
                        <TableCell className={cn("font-bold", p.profit >= 0 ? "text-green-500" : "text-red-500")}>
                          {fmt(p.profit)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={p.margin >= 30 ? "default" : p.margin >= 15 ? "secondary" : "destructive"}>
                            {pct(p.margin)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
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
      <p className={cn("text-xl font-bold", color)}>{value}</p>
    </div>
  );
}
