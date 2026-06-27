import * as React from "react";
import { useState, useEffect } from "react";
import {
  Tag, Plus, Calendar, Edit2, Trash2, Percent, Gift, Package, Loader2
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import apiClient from "@/lib/api-client";

const PROMO_TYPES = [
  { value: "percentage", label: "Percentage Off" },
  { value: "fixed", label: "Fixed Amount Off" },
  { value: "bogo", label: "Buy X Get Y Free" },
  { value: "bulk", label: "Bulk Discount" },
];

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    name: "", description: "", type: "percentage", value: "",
    minQuantity: "0", freeQuantity: "0",
    startDate: "", endDate: "", appliesTo: "all",
  });

  useEffect(() => { fetchPromotions(); }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/api/promotions");
      const data = res.data?.data || res.data || [];
      setPromotions(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load promotions");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        name: form.name,
        description: form.description,
        type: form.type,
        value: parseFloat(form.value) || 0,
        minQuantity: parseInt(form.minQuantity) || 0,
        freeQuantity: parseInt(form.freeQuantity) || 0,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : new Date().toISOString(),
        endDate: form.endDate ? new Date(form.endDate).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        appliesTo: form.appliesTo,
        isActive: true,
      };

      if (editing) {
        await apiClient.put(`/api/promotions/${editing.id}`, payload);
        toast.success("Promotion updated!");
      } else {
        await apiClient.post("/api/promotions", payload);
        toast.success("Promotion created!");
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: "", description: "", type: "percentage", value: "", minQuantity: "0", freeQuantity: "0", startDate: "", endDate: "", appliesTo: "all" });
      fetchPromotions();
    } catch {
      toast.error("Failed to save promotion");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this promotion?")) return;
    try {
      await apiClient.delete(`/api/promotions/${id}`);
      toast.success("Promotion deleted");
      fetchPromotions();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const isPromoActive = (p: any) => {
    const now = new Date();
    return p.isActive && new Date(p.startDate) <= now && new Date(p.endDate) >= now;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Promotions & Discounts</h1>
          <p className="text-sm text-muted-foreground">Create seasonal sales, bulk discounts, and BOGO offers</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); setForm({ name: "", description: "", type: "percentage", value: "", minQuantity: "0", freeQuantity: "0", startDate: "", endDate: "", appliesTo: "all" }); }} className="gap-2">
          <Plus className="h-4 w-4" /> New Promotion
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : promotions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Tag className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No promotions yet. Create your first one!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{p.type}</Badge>
                    </TableCell>
                    <TableCell>
                      {p.type === "percentage" ? `${p.value}%` : p.type === "bogo" ? `Buy ${p.minQuantity} get ${p.freeQuantity} free` : `₵${p.value}`}
                    </TableCell>
                    <TableCell className="text-xs">
                      {new Date(p.startDate).toLocaleDateString()} — {new Date(p.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={isPromoActive(p) ? "default" : "secondary"}>
                        {isPromoActive(p) ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => {
                          setEditing(p);
                          setShowForm(true);
                          setForm({
                            name: p.name, description: p.description || "", type: p.type,
                            value: String(p.value), minQuantity: String(p.minQuantity),
                            freeQuantity: String(p.freeQuantity),
                            startDate: new Date(p.startDate).toISOString().split("T")[0],
                            endDate: new Date(p.endDate).toISOString().split("T")[0],
                            appliesTo: p.appliesTo,
                          });
                        }}>
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(p.id)}>
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Promotion" : "New Promotion"}</DialogTitle>
            <DialogDescription>Create discounts, BOGO offers, and seasonal sales</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Promotion Name</label>
              <Input placeholder="e.g. Christmas Sale 20% Off" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PROMO_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {form.type === "percentage" ? "Percentage (%)" : form.type === "bogo" ? "Free Quantity" : "Value (₵)"}
                </label>
                <Input type="number" placeholder="0" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} />
              </div>
            </div>
            {form.type === "bogo" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum Quantity to Buy</label>
                <Input type="number" placeholder="0" value={form.minQuantity} onChange={e => setForm({ ...form, minQuantity: e.target.value })} />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name || !form.value}>
              {editing ? "Update" : "Create"} Promotion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
