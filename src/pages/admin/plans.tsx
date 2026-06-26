import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { SubscriptionPlan } from '@/types/entities';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Check, X, Shield, Zap, Rocket } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

const withTimeout = <T,>(promise: Promise<T>, ms: number = 2000): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout of ${ms}ms exceeded`));
    }, ms);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
};

export default function PlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Partial<SubscriptionPlan> | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  async function fetchPlans() {
    try {
      setLoading(true);
      const localPlansKey = 'local_plans_store_v1';
      const localRaw = localStorage.getItem(localPlansKey);
      const localPlansList = localRaw ? JSON.parse(localRaw) : [];

      let mergedPlans = [...localPlansList];

      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await withTimeout(
            Promise.resolve(
              supabase
                .from('subscription_plans')
                .select('*')
                .order('monthly_price', { ascending: true })
            ),
            2000
          );
          
          if (!error && data) {
            const dbSlugs = new Set(data.map(item => String(item.slug || '').toLowerCase()));
            const nonDupLocal = localPlansList.filter((lp: any) => lp.slug && !dbSlugs.has(String(lp.slug).toLowerCase()));
            mergedPlans = [...data, ...nonDupLocal];
          } else if (error) {
            console.warn("Supabase relation fetch failed, utilizing cached subscription profiles:", error);
          }
        } catch (dbErr) {
          console.warn("Database response delayed, defaulting to static registry state:", dbErr);
        }
      }

      // If no subscription structures exist, pre-populate standard system models
      if (mergedPlans.length === 0) {
        const fallbacks: SubscriptionPlan[] = [
          {
            id: 'plan_starter',
            name: 'Starter',
            slug: 'starter',
            description: 'Essential toolkit for local startup stores & shopfronts.',
            monthly_price: 99,
            yearly_price: 990,
            currency: 'GHS',
            features: [
              "Up to 5 staff members",
              "Core point of sale system",
              "Basic inventory metrics",
              "Support ticketing"
            ],
            limits: {},
            is_active: true,
            is_popular: false,
            trial_days: 14,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'plan_business',
            name: 'Business Tier',
            slug: 'business',
            description: 'Complete operating system for rapidly climbing nodes.',
            monthly_price: 299,
            yearly_price: 2990,
            currency: 'GHS',
            features: [
              "Unlimited staff members",
              "Multi-terminal sales dashboard",
              "Advanced smart metrics",
              "Dynamic automated report dispatch",
              "Dedicated 24/7 priority support"
            ],
            limits: {},
            is_active: true,
            is_popular: true,
            trial_days: 14,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'plan_enterprise',
            name: 'Enterprise Protocol',
            slug: 'enterprise',
            description: 'Infinite scales for global corporate integrations & outlets.',
            monthly_price: 999,
            yearly_price: 9990,
            currency: 'GHS',
            features: [
              "Multi-branch cloud nodes link",
              "Unlimited analytics telemetry logs",
              "Custom API system integrations",
              "On-site systems management & engineers"
            ],
            limits: {},
            is_active: true,
            is_popular: false,
            trial_days: 14,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        localStorage.setItem(localPlansKey, JSON.stringify(fallbacks));
        mergedPlans = fallbacks;
      }

      setPlans(mergedPlans);
    } catch (err: any) {
      toast.error('Failed to fetch pricing architectures', { description: err.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleSavePlan() {
    if (!editingPlan?.name || !editingPlan?.slug) {
      toast.error('Name and Slug are required');
      return;
    }

    try {
      const planData = {
        name: editingPlan.name,
        slug: editingPlan.slug,
        description: editingPlan.description || '',
        monthly_price: Number(editingPlan.monthly_price || 0),
        yearly_price: Number(editingPlan.yearly_price || 0),
        currency: editingPlan.currency || 'GHS',
        features: Array.isArray(editingPlan.features) ? editingPlan.features : [],
        limits: editingPlan.limits || {},
        is_active: editingPlan.is_active ?? true,
        is_popular: editingPlan.is_popular ?? false,
        trial_days: Number(editingPlan.trial_days || 14),
      };

      let successOnServer = false;

      if (isSupabaseConfigured()) {
        try {
          if (editingPlan.id && !editingPlan.id.startsWith('temp_') && !editingPlan.id.startsWith('plan_')) {
            const { error } = await supabase
              .from('subscription_plans')
              .update(planData)
              .eq('id', editingPlan.id);
            if (!error) successOnServer = true;
          } else {
            const { error } = await supabase
              .from('subscription_plans')
              .insert(planData);
            if (!error) successOnServer = true;
          }
        } catch (dbErr) {
          console.warn("Failed to propagate pricing design change to remote database schema:", dbErr);
        }
      }

      // Sync local registry cache
      const localPlansKey = 'local_plans_store_v1';
      const localRaw = localStorage.getItem(localPlansKey);
      let localPlansList = localRaw ? JSON.parse(localRaw) : [];

      if (editingPlan.id) {
        localPlansList = localPlansList.map((p: any) => p.id === editingPlan.id ? { ...p, ...planData } : p);
      } else {
        const tempId = 'temp_' + Math.random().toString(36).substr(2, 9);
        localPlansList.push({ id: tempId, ...planData, created_at: new Date().toISOString() });
      }

      localStorage.setItem(localPlansKey, JSON.stringify(localPlansList));

      if (successOnServer) {
        toast.success('Strategy Plan synchronized with Cloud architecture.');
      } else {
        toast.success('Strategy Plan successfully deployed locally.');
      }

      setIsDialogOpen(false);
      setEditingPlan(null);
      await fetchPlans();
    } catch (err: any) {
      toast.error('Failed to commit pricing strategy', { description: err.message });
    }
  }

  async function handleDeletePlan(id: string) {
    if (!confirm('Are you sure you want to delete this plan? This may break existing subscriptions.')) return;

    try {
      let successOnServer = false;

      if (isSupabaseConfigured() && !id.startsWith('temp_') && !id.startsWith('plan_')) {
        try {
          const { error } = await supabase
            .from('subscription_plans')
            .delete()
            .eq('id', id);
          if (!error) successOnServer = true;
        } catch (dbErr) {
          console.warn("Could not delete from remote table. Continuing with local sync delete:", dbErr);
        }
      }

      // Sync local storage
      const localPlansKey = 'local_plans_store_v1';
      const localRaw = localStorage.getItem(localPlansKey);
      if (localRaw) {
        const localPlansList = JSON.parse(localRaw);
        const filtered = localPlansList.filter((p: any) => p.id !== id);
        localStorage.setItem(localPlansKey, JSON.stringify(filtered));
      }

      toast.success('Pricing strategy plan dismantled.');
      await fetchPlans();
    } catch (err: any) {
      toast.error('Failed to purge pricing plan', { description: err.message });
    }
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 border border-white/5 p-10 rounded-[32px] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(239,68,68,0.05),transparent_50%)] pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-8 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500 font-mono">Pricing Engine</span>
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white leading-none">
            Pricing <span className="text-red-500">Architecture</span>
          </h1>
          <p className="text-slate-400 font-bold text-sm leading-relaxed max-w-xl italic">
            Configure global software tier definitions, trial periods, and feature catalogs for all shop networks.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingPlan({ 
                  name: '',
                  slug: '',
                  description: '',
                  monthly_price: undefined, 
                  yearly_price: undefined, 
                  currency: 'GHS', 
                  is_active: true, 
                  features: [], 
                  limits: {},
                  trial_days: 14 
                });
                setIsDialogOpen(true);
              }}
              className="relative z-10 w-full md:w-auto h-14 px-8 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-red-500/10 border-none transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              New Structure Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-slate-900 border border-white/10 rounded-[32px] text-white shadow-3xl overflow-hidden p-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.08),transparent_50%)] pointer-events-none" />
            
            <DialogHeader className="p-8 pb-3 border-b border-white/5 relative z-10">
              <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter text-white flex items-center gap-3">
                <span className="h-6 w-1.5 rounded-full bg-red-500" />
                {editingPlan?.id ? 'Adjust Tier Strategy' : 'Define New Strategy Tier'}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-6 p-8 relative z-10">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Expansion Codename <span className="text-red-500">*</span>
                </Label>
                <Input 
                  value={editingPlan?.name || ''} 
                  placeholder="EX: BUSINESS TIER"
                  onChange={e => setEditingPlan({...editingPlan, name: e.target.value})}
                  className="h-12 rounded-xl border border-white/5 bg-slate-950 font-bold text-sm text-white placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-red-500/20 focus-visible:border-red-500 transition-all pl-4"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  System Slug <span className="text-slate-500 font-bold">(Format lock)</span>
                </Label>
                <Input 
                  value={editingPlan?.slug || ''} 
                  placeholder="EX: business-tier"
                  onChange={e => setEditingPlan({...editingPlan, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})}
                  className="h-12 rounded-xl border border-white/5 bg-slate-950 font-mono font-bold text-sm text-red-400 placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-red-500/20 focus-visible:border-red-500 transition-all pl-4"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Monthly Rate (GHS)
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-500 text-sm">₵</span>
                  <Input 
                    type="number"
                    value={editingPlan?.monthly_price ?? ''} 
                    placeholder="0.00"
                    onChange={e => {
                      const val = e.target.value;
                      setEditingPlan({...editingPlan, monthly_price: val === '' ? undefined : parseFloat(val)});
                    }}
                    className="h-12 pl-10 rounded-xl border border-white/5 bg-slate-950 font-black text-sm text-white placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-red-500/20 focus-visible:border-red-500 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Annual Cycle Rate (GHS)
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-500 text-sm">₵</span>
                  <Input 
                    type="number"
                    value={editingPlan?.yearly_price ?? ''} 
                    placeholder="0.00"
                    onChange={e => {
                      const val = e.target.value;
                      setEditingPlan({...editingPlan, yearly_price: val === '' ? undefined : parseFloat(val)});
                    }}
                    className="h-12 pl-10 rounded-xl border border-white/5 bg-slate-950 font-black text-sm text-white placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-red-500/20 focus-visible:border-red-500 transition-all"
                  />
                </div>
              </div>
              <div className="col-span-2 space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Strategic Description
                </Label>
                <Input 
                  value={editingPlan?.description || ''} 
                  placeholder="EX: COMPLETE ECOSYSTEM SUITE FOR EXPANDING BRANCH STORES"
                  onChange={e => setEditingPlan({...editingPlan, description: e.target.value})}
                  className="h-12 rounded-xl border border-white/5 bg-slate-950 font-bold text-sm text-white placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-red-500/20 focus-visible:border-red-500 transition-all pl-4"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Feature Catalog Set <span className="text-slate-500 font-bold">(One feature definition per line)</span>
                </Label>
                <textarea 
                  value={(editingPlan?.features as string[] || []).join('\n')} 
                  placeholder="EX: Up to 15 branches&#10;Smart real-time reporting&#10;Priority 24/7 client dispatch"
                  onChange={e => setEditingPlan({...editingPlan, features: e.target.value.split('\n').filter(f => f.trim() !== '')})}
                  className="w-full min-h-[100px] p-4 rounded-xl border border-white/5 bg-slate-950 font-bold text-sm text-white placeholder:text-slate-600 focus:border-red-500 resize-none outline-none focus:ring-1 focus:ring-red-500/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Trial Span <span className="text-slate-500 font-bold">(Days)</span>
                </Label>
                <Input 
                  type="number"
                  value={editingPlan?.trial_days ?? ''} 
                  placeholder="14"
                  onChange={e => {
                    const val = e.target.value;
                    setEditingPlan({...editingPlan, trial_days: val === '' ? undefined : parseInt(val)});
                  }}
                  className="h-12 rounded-xl border border-white/5 bg-slate-950 font-black text-sm text-white placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-red-500/20 focus-visible:border-red-500 transition-all pl-4"
                />
              </div>
              <div className="flex flex-col justify-center gap-3">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="is_active"
                    checked={editingPlan?.is_active ?? true}
                    onChange={e => setEditingPlan({...editingPlan, is_active: e.target.checked})}
                    className="h-5 w-5 accent-red-600 border border-white/10 bg-slate-950 rounded-lg cursor-pointer"
                  />
                  <Label htmlFor="is_active" className="text-[10px] font-black uppercase tracking-widest cursor-pointer text-slate-300">Live Activation</Label>
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="is_popular"
                    checked={editingPlan?.is_popular ?? false}
                    onChange={e => setEditingPlan({...editingPlan, is_popular: e.target.checked})}
                    className="h-5 w-5 accent-red-600 border border-white/10 bg-slate-950 rounded-lg cursor-pointer"
                  />
                  <Label htmlFor="is_popular" className="text-[10px] font-black uppercase tracking-widest cursor-pointer text-slate-300">Popularity Badge</Label>
                </div>
              </div>
            </div>
            
            <DialogFooter className="p-8 bg-slate-950/40 border-t border-white/5">
              <Button 
                onClick={handleSavePlan}
                className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest text-[10px]"
              >
                Assemble strategy plan model
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        <Card className="border-none shadow-2xl bg-slate-900 border border-white/5 rounded-[40px] overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader className="bg-white/[0.02]">
                <TableRow className="hover:bg-transparent border-b border-white/5">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-16 pl-8">Strategy plan Info</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-16">Price points (GHS)</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-16 text-center">Status</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-16 text-right pr-8">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={4} className="h-40 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 animate-pulse">Scanning Registry Protocols...</TableCell>
                  </TableRow>
                ) : (
                  plans.map((plan) => (
                    <TableRow key={plan.id} className="group hover:bg-white/[0.01] border-b border-white/5 transition-colors">
                      <TableCell className="pl-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 flex items-center justify-center bg-white/[0.04] border border-white/5 rounded-2xl group-hover:bg-slate-950 transition-colors">
                            {plan.slug === 'starter' && <Shield className="h-5 w-5 text-slate-400" />}
                            {plan.slug === 'business' && <Zap className="h-5 w-5 text-red-500 fill-red-500/10" />}
                            {plan.slug === 'enterprise' && <Rocket className="h-5 w-5 text-indigo-400" />}
                            {!['starter', 'business', 'enterprise'].includes(plan.slug) && <Plus className="h-5 w-5 text-slate-400" />}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-white flex items-center gap-2">
                              {plan.name}
                              {plan.is_popular && (
                                <Badge className="bg-red-500/10 text-red-400 border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5">Popular</Badge>
                              )}
                            </div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{plan.slug}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-6">
                        <div className="space-y-1">
                          <div className="text-sm font-black text-white">₵{(plan.monthly_price || 0).toLocaleString()}/mo</div>
                          <div className="text-[10px] font-bold text-slate-500">₵{(plan.yearly_price || 0).toLocaleString()}/yr</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-6">
                        <span className={cn(
                          "inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider",
                          plan.is_active ? "text-emerald-500 bg-emerald-500/10" : "text-slate-500 bg-slate-500/10"
                        )}>
                          {plan.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-8 py-6">
                        <div className="flex justify-end gap-3">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => { setEditingPlan(plan); setIsDialogOpen(true); }}
                            className="rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:text-white h-10 px-4 font-black text-[10px] uppercase tracking-widest text-slate-300 transition-all"
                          >
                            <Pencil className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                            Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDeletePlan(plan.id)}
                            className="rounded-xl bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/10 h-10 px-4 font-black text-[10px] uppercase tracking-widest transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                            Purge
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
