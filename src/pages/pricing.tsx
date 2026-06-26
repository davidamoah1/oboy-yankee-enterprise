import { Check, ArrowRight, Star, ShieldCheck, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useOnboardingStore } from "@/store/onboarding-store";
import { SubscriptionPlan as PlanType } from "@/types/entities";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { motion } from "motion/react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { FALLBACK_PLANS } from "@/constants/plans";

export default function PricingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setPlan, setBillingCycle, billingCycle } = useOnboardingStore();
  const [isYearly, setIsYearly] = useState(billingCycle === 'yearly');
  const [plans, setPlans] = useState<PlanType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlans() {
      if (!isSupabaseConfigured()) {
        console.warn('Supabase credentials missing. Utilizing localized subscription plans.');
        setPlans(FALLBACK_PLANS);
        setLoading(false);
        return;
      }

      try {
        // Create a safety timeout promise
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Database connection timeout")), 3500)
        );

        // Race the database query against the timeout
        const response = await Promise.race([
          supabase
            .from('subscription_plans')
            .select('*')
            .eq('is_active', true)
            .order('monthly_price', { ascending: true }),
          timeoutPromise
        ]) as any;
        
        const { data, error } = response || {};
        if (error) throw error;
        setPlans(data && data.length > 0 ? data : FALLBACK_PLANS);
      } catch (err) {
        console.error('Error fetching plans (falling back to local plans):', err);
        setPlans(FALLBACK_PLANS);
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, []);

  const handleSelectPlan = async (plan: PlanType) => {
    setPlan(plan.slug, plan.id);
    const cycle = isYearly ? 'yearly' : 'monthly';
    setBillingCycle(cycle);
    
    if (user) {
      setLoading(true);
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('tenant_id')
          .eq('id', user.id)
          .single();

        if (profileData?.tenant_id) {
          await supabase
            .from('tenants')
            .update({ plan_id: plan.id })
            .eq('id', profileData.tenant_id);
        }
      } catch (err) {
        console.error('Error syncing plan to DB:', err);
      } finally {
        setLoading(false);
        navigate('/onboard/payment');
      }
    } else {
      navigate('/register');
    }
  };

  const getIcon = (slug: string) => {
    switch (slug) {
      case 'starter': return Zap;
      case 'business': return Star;
      case 'enterprise': return ShieldCheck;
      default: return Zap;
    }
  };

  const getColor = (slug: string) => {
    switch (slug) {
      case 'starter': return "text-blue-400";
      case 'business': return "text-indigo-400";
      case 'enterprise': return "text-violet-400";
      default: return "text-indigo-400";
    }
  };

  const getBg = (slug: string) => {
    switch (slug) {
      case 'starter': return "bg-blue-500/10 border border-blue-500/20";
      case 'business': return "bg-indigo-500/10 border border-indigo-500/20";
      case 'enterprise': return "bg-violet-500/10 border border-violet-500/30";
      default: return "bg-indigo-500/10 border border-indigo-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 relative overflow-hidden">
      {/* Decorative Blur Backdrops */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[140px] pointer-events-none" />

      <section className="py-24 px-6 relative z-10">
        <div className="container mx-auto max-w-6xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] text-indigo-400">
              <ShieldCheck className="h-4 w-4" /> Secure Pricing Portal
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight uppercase italic leading-none max-w-3xl mx-auto">
              Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Growth</span>
            </h1>
            <p className="text-base md:text-lg text-slate-400 max-w-lg mx-auto font-medium">
              Enterprise-grade infrastructure for Ghana's most ambitious businesses.
            </p>
          </motion.div>

          <div className="flex items-center justify-center gap-4 mb-20 bg-slate-900/40 border border-white/5 backdrop-blur-md px-6 py-3.5 rounded-2xl w-fit mx-auto">
            <Label htmlFor="billing-toggle" className={`text-xs font-black uppercase tracking-widest cursor-pointer transition-colors ${!isYearly ? 'text-white' : 'text-slate-500'}`}>Monthly</Label>
            <Switch 
              id="billing-toggle" 
              checked={isYearly} 
              onCheckedChange={(val) => {
                setIsYearly(val);
                setBillingCycle(val ? 'yearly' : 'monthly');
              }}
              className="data-[state=checked]:bg-indigo-500"
            />
            <div className="flex items-center gap-3">
              <Label htmlFor="billing-toggle" className={`text-xs font-black uppercase tracking-widest cursor-pointer transition-colors ${isYearly ? 'text-white' : 'text-slate-500'}`}>Yearly</Label>
              <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider animate-pulse">Save 20%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {loading ? (
              <div className="col-span-3 py-32 flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 text-indigo-400 animate-spin" />
                <p className="text-xs font-black uppercase tracking-widest text-slate-500 animate-pulse">Loading SaaS Infrastructure Plans...</p>
              </div>
            ) : (
              plans.map((plan, i) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.12, duration: 0.6 }}
                  className={`flex flex-col p-8 rounded-[2.5rem] border backdrop-blur-sm transition-all duration-500 hover:shadow-[0_20px_50px_rgba(99,102,241,0.15)] hover:-translate-y-2 relative overflow-hidden ${
                    plan.is_popular 
                      ? "border-indigo-500/80 bg-indigo-950/20 shadow-[0_0_40px_rgba(99,102,241,0.1)] ring-1 ring-indigo-500/30 md:scale-105 z-10" 
                      : "border-white/5 bg-slate-900/40 hover:border-slate-800"
                  }`}
                >
                  {plan.is_popular && (
                    <div className="absolute top-5 right-5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                      Most Active
                    </div>
                  )}

                  <div className={`w-12 h-12 rounded-2xl ${getBg(plan.slug)} flex items-center justify-center mb-8 shrink-0`}>
                    {(() => {
                      const Icon = getIcon(plan.slug);
                      return <Icon className={`h-6 w-6 ${getColor(plan.slug)}`} />;
                    })()}
                  </div>

                  <div className="mb-6 text-left">
                    <h3 className="text-2xl font-black italic uppercase tracking-tight text-white mb-2">{plan.name}</h3>
                    <p className="text-xs text-slate-400 font-bold leading-relaxed">{plan.description}</p>
                  </div>

                  <div className="mb-8 text-left border-b border-white/5 pb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black tracking-tighter text-white">₵{isYearly ? plan.yearly_price : plan.monthly_price}</span>
                      <span className="text-slate-500 font-black text-xs uppercase tracking-widest">/ {isYearly ? 'Year' : 'Month'}</span>
                    </div>
                    {isYearly && (
                      <p className="text-indigo-400 text-[9px] font-black uppercase mt-2">Billed annually at ₵{plan.yearly_price}</p>
                    )}
                  </div>

                  <div className="flex-1 space-y-4 mb-8 text-left">
                    {(plan.features as string[]).map((feature, j) => (
                      <div key={j} className="flex items-start gap-3">
                        <div className="bg-indigo-500/10 p-1 rounded-lg shrink-0 mt-0.5">
                          <Check className="h-3.5 w-3.5 text-indigo-400" />
                        </div>
                        <span className="text-xs font-bold text-slate-300 leading-tight">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs group transition-all duration-300 ${
                      plan.is_popular 
                        ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                        : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/5"
                    }`}
                  >
                    Select Plan
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-4xl px-6 py-24 border-t border-white/5 relative z-10">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-center text-white mb-16">Platform Comparison</h2>
        <div className="bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] border border-white/5 shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/60 border-b border-white/5">
                <th className="p-6 text-[9px] font-black uppercase tracking-widest text-slate-400">Feature</th>
                <th className="p-6 text-[9px] font-black uppercase tracking-widest text-slate-400">Starter</th>
                <th className="p-6 text-[9px] font-black uppercase tracking-widest text-slate-400">Business</th>
                <th className="p-6 text-[9px] font-black uppercase tracking-widest text-slate-400">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { name: "Inventory Limits", starter: "100 Items", business: "Unlimited", enterprise: "Unlimited" },
                { name: "Branch Management", starter: "1 Branch", business: "3 Branches", enterprise: "Unlimited" },
                { name: "Staff Accounts", starter: "3 Staff", business: "10 Staff", enterprise: "Unlimited" },
                { name: "Customer CRM", starter: "Basic", business: "Advanced", enterprise: "Full Suite" },
                { name: "Analytics", starter: "Basic", business: "Real-time", enterprise: "Predictive" },
                { name: "Support", starter: "Email", business: "24/7 Priority", enterprise: "Key Account Manager" }
              ].map((row, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-6 text-xs font-black uppercase tracking-tight text-white">{row.name}</td>
                  <td className="p-6 text-xs font-bold text-slate-400">{row.starter}</td>
                  <td className="p-6 text-xs font-bold text-slate-400">{row.business}</td>
                  <td className="p-6 text-xs font-bold text-slate-400">{row.enterprise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
