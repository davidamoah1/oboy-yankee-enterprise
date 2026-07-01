import { useState, useEffect } from 'react';
import { Store, Plus, Pencil, Trash2, Phone, MapPin, User, X } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Branch } from '@/types/auth';
import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function BranchesPage() {
  const { branches, refreshProfile } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    code: '',
    phone: '',
    address: '',
    city: '',
    region: '',
    managerName: '',
  });

  const activeBranchCount = branches.filter(b => b.isActive).length;
  const MAX_BRANCHES = 5;
  const atBranchLimit = activeBranchCount >= MAX_BRANCHES;

  const resetForm = () => {
    setForm({ name: '', code: '', phone: '', address: '', city: '', region: '', managerName: '' });
    setEditingBranch(null);
    setShowForm(false);
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setForm({
      name: branch.name,
      code: branch.code || '',
      phone: branch.phone || '',
      address: branch.address || '',
      city: branch.city || '',
      region: branch.region || '',
      managerName: branch.managerName || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Branch name is required');
      return;
    }
    setSaving(true);
    try {
      if (editingBranch) {
        await apiClient.put(`/api/branches/${editingBranch.id}`, form);
        toast.success('Branch updated successfully');
      } else {
        await apiClient.post('/api/branches', form);
        toast.success('Branch created successfully');
      }
      resetForm();
      await refreshProfile();
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to save branch';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (branch: Branch) => {
    if (!confirm(`Deactivate "${branch.name}"? This will not delete associated data.`)) return;
    try {
      await apiClient.delete(`/api/branches/${branch.id}`);
      toast.success('Branch deactivated');
      await refreshProfile();
    } catch (err: any) {
      toast.error(err.message || 'Failed to deactivate branch');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black italic uppercase tracking-tight">Branches</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your shop locations ({activeBranchCount}/{MAX_BRANCHES} active)</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Button onClick={() => { resetForm(); setShowForm(true); }} disabled={atBranchLimit} className="gap-2 rounded-xl font-bold">
            <Plus className="h-4 w-4" />
            Add Branch
          </Button>
          {atBranchLimit && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Maximum of {MAX_BRANCHES} branches reached</span>
          )}
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">{editingBranch ? 'Edit Branch' : 'New Branch'}</h2>
            <Button type="button" variant="ghost" size="icon" onClick={resetForm} className="rounded-xl">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Accra Central Shop" className="rounded-xl" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input id="code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. SHOP-02" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+233 ..." className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="managerName">Manager Name</Label>
              <Input id="managerName" value={form.managerName} onChange={(e) => setForm({ ...form, managerName: e.target.value })} placeholder="Manager name" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street address" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Input id="region" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="Region" className="rounded-xl" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={saving} className="rounded-xl font-bold">
              {saving ? 'Saving...' : editingBranch ? 'Update Branch' : 'Create Branch'}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm} className="rounded-xl">Cancel</Button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Store className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-bold">No branches yet</p>
            <p className="text-sm mt-1">Click "Add Branch" to create your first shop location</p>
          </div>
        )}
        {branches.map((branch) => (
          <div key={branch.id} className={`rounded-2xl border border-border bg-card p-5 space-y-3 ${!branch.isActive ? 'opacity-50' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <Store className="h-5 w-5 text-indigo-500" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{branch.name}</h3>
                  {branch.code && <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{branch.code}</p>}
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(branch)} className="h-8 w-8 rounded-lg">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                {branch.isActive && (
                  <Button variant="ghost" size="icon" onClick={() => handleDeactivate(branch)} className="h-8 w-8 rounded-lg text-red-500 hover:text-red-600">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              {branch.managerName && (
                <div className="flex items-center gap-2"><User className="h-3 w-3" /> {branch.managerName}</div>
              )}
              {branch.phone && (
                <div className="flex items-center gap-2"><Phone className="h-3 w-3" /> {branch.phone}</div>
              )}
              {branch.address && (
                <div className="flex items-center gap-2"><MapPin className="h-3 w-3" /> {branch.address}{branch.city ? `, ${branch.city}` : ''}</div>
              )}
            </div>
            {!branch.isActive && (
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-red-500 bg-red-500/10 px-2 py-1 rounded-lg">Inactive</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
