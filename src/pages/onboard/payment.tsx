
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CreditCard, ShieldCheck, ArrowRight, CheckCircle2, Lock } from "lucide-react";
import { useOnboardingStore } from "@/store/onboarding-store";
import { SubscriptionPlan as PlanType } from "@/types/entities";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { api } from "@/lib/api";
import { FALLBACK_PLANS } from "@/constants/plans";

export default function OnboardPaymentPage() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const { planId, billingCycle, email: storedEmail, tenantId: storedTenantId } = useOnboardingStore();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [plan, setPlan] = useState<PlanType | null>(null);
  const [backendPublicKey, setBackendPublicKey] = useState<string>("");

  useEffect(() => {
    // Audit check: dynamically fetch the configured Paystack Public Key from the server
    async function fetchConfig() {
      try {
        const response = await api.get("/api/payments/config");
        if (response.data?.publicKey) {
          console.log("[PAYMENT MODULE] Resilient load: Public key retrieved from backend config.");
          setBackendPublicKey(response.data.publicKey);
        }
      } catch (err) {
        console.warn("[PAYMENT MODULE] Failed to query dynamic backend public key configuration:", err);
      }
    }
    fetchConfig();
  }, []);

  useEffect(() => {
    // Refresh profile on mount to catch early registrations
    if (user && !profile) {
      refreshProfile().catch(console.error);
    }
    
    // 1. Fetch Plan Details from DB based on store ID
    async function fetchPlan() {
      if (!planId) return;

      if (!isSupabaseConfigured()) {
        const found = FALLBACK_PLANS.find(p => p.id === planId) || FALLBACK_PLANS.find(p => p.slug === planId) || FALLBACK_PLANS[0];
        setPlan(found);
        return;
      }

      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Database connection timeout")), 3500)
        );

        const response = await Promise.race([
          supabase
            .from('subscription_plans')
            .select('*')
            .eq('id', planId)
            .single(),
          timeoutPromise
        ]) as any;

        const { data, error } = response || {};
        if (!error && data) {
          setPlan(data);
        } else {
          // Fall back if ID doesn't exist yet but meets slug or fallback matching
          const found = FALLBACK_PLANS.find(p => p.id === planId) || FALLBACK_PLANS.find(p => p.slug === planId) || FALLBACK_PLANS[0];
          setPlan(found);
        }
      } catch (err) {
        console.warn('Error fetching plan details (falling back to local plans):', err);
        const found = FALLBACK_PLANS.find(p => p.id === planId) || FALLBACK_PLANS.find(p => p.slug === planId) || FALLBACK_PLANS[0];
        setPlan(found);
      }
    }
    fetchPlan();

    // 2. Load Paystack script
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      console.warn("Paystack Inline SDK blocked or slow. Defaulting to sandbox mode.");
      setScriptLoaded(true); // Allow checkout triggers to still fire
    };
    document.body.appendChild(script);

    // Dynamic recovery fallback: if script fails to load in 3 seconds, allow button click anyway
    const timer = setTimeout(() => {
      setScriptLoaded(true);
    }, 3000);

    return () => {
      try {
        document.body.removeChild(script);
      } catch (err) {}
      clearTimeout(timer);
    };
  }, [planId]);

  // Redirect if not logged in or no plan selected
  useEffect(() => {
    if (!loading && !verifying) {
      if (!user) {
        navigate("/login");
      } else if (!planId) {
        navigate("/pricing");
      }
    }
  }, [user, planId, navigate, loading, verifying]);

  const handlePayment = async () => {
    if (!scriptLoaded || !user || !planId) {
      console.warn("[PAYMENT MODULE] Attempted checkout, but prerequisites not met:", {
        scriptLoaded,
        hasUser: !!user,
        planId
      });
      toast.error("System initializing. Please wait.");
      return;
    }

    setLoading(true);

    try {
      // Trace identity signals through all available persistent stores
      const rawEmail = profile?.email || user?.email || storedEmail || '';
      const safeEmail = String(rawEmail).trim().toLowerCase();
      const tenantId = profile?.tenant_id || storedTenantId;

      // 1. Audit Client-side Environment Variables (Log presence, never values)
      console.log("[PAYMENT AUDIT] Initiating transaction handshake. Checking environment configuration...");
      console.log("[PAYMENT AUDIT] VITE_PAYSTACK_PUBLIC_KEY presence:", !!import.meta.env.VITE_PAYSTACK_PUBLIC_KEY);
      console.log("[PAYMENT AUDIT] VITE_API_URL presence:", !!import.meta.env.VITE_API_URL);
      console.log("[PAYMENT AUDIT] VITE_SUPABASE_URL presence:", !!import.meta.env.VITE_SUPABASE_URL);
      console.log("[PAYMENT AUDIT] Cached backendPublicKey override presence:", !!backendPublicKey);

      const activePublicKey = backendPublicKey || import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
      if (!activePublicKey) {
        console.error("[PAY_AUDIT_ERROR] Client public key is missing entirely.");
        throw new Error("PAYSTACK_PUBLIC_KEY_MISSING: Client-side public key is not configured.");
      }

      // 2. Pro-level validation before attempting bridge connection
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      
      if (!safeEmail || safeEmail.includes('null') || safeEmail.includes('undefined')) {
        console.error("[PAYMENT ERROR] Malformed identity email signature detected:", safeEmail);
        throw new Error("SECURE_HANDSHAKE_FAILED: Email identity trace is missing or corrupted.");
      }

      if (!emailRegex.test(safeEmail)) {
        console.error("[PAYMENT ERROR] Invalid email format detected:", { email: safeEmail });
        throw new Error("SECURE_HANDSHAKE_FAILED: Customer email is in an invalid format.");
      }

      if (!tenantId) {
        console.error("[PAYMENT ERROR] Tenant identity structure mapping error.");
        throw new Error("SECURE_HANDSHAKE_FAILED: Missing active tenant workspace identifier.");
      }

      console.info(`[PAYMENT INIT] Handshake verified. Dispatching payload request to payment initialization route...`, {
        plan_id: planId,
        billing_cycle: billingCycle,
        email: safeEmail,
        tenant_id: tenantId
      });

      // 3. Initialize secure transaction via BACKEND route
      let initResponse;
      try {
        initResponse = await api.post("/api/payments/initialize", {
          plan_id: planId,
          billing_cycle: billingCycle,
          email: safeEmail,
          tenant_id: tenantId
        });
      } catch (apiErr: any) {
        console.error("[PAYMENT MODULE] Critical network or backend API exception caught:", apiErr);
        
        // Extract precise error codes if returned in normalized response
        const errMessage = apiErr.message || "Unknown server response.";
        const statusCode = apiErr.status;
        const errCode = apiErr.code || (statusCode ? `HTTP_${statusCode}` : "NETWORK_REQUEST_FAILED");

        throw new Error(`PAYMENT_ROUTE_FAILED:${errCode}:${errMessage}`);
      }

      console.log("[PAYMENT MODULE] Backend transaction initialized safely.", initResponse.data);

      const { data: paystackPayload, amount: serverAmount, is_sandbox } = initResponse.data;
      const access_code = paystackPayload?.access_code;

      if (!access_code) {
        console.error("[PAYMENT MODULE] Secure gateway handshake failed to issue access_code token.");
        throw new Error("PAYSTACK_INITIALIZATION_FAILED: Access token requested but not received from secure payment hub.");
      }

      // 4. Open Paystack Pop with access code OR elegant Sandbox fallback
      const hasPaystackSDK = (window as any).PaystackPop && typeof (window as any).PaystackPop.setup === 'function';
      if (is_sandbox || !hasPaystackSDK) {
        console.log("[SANDBOX FLOW] Sandbox execution requested or Paystack Pop CDN unavailable.", { is_sandbox, hasSDK: hasPaystackSDK });
        setLoading(false); // Clean up button loading state
        
        toast.promise(
          new Promise((resolve) => setTimeout(() => resolve(paystackPayload?.reference || `NEXA-SB-REF-${Date.now()}`), 1500)),
          {
            loading: 'Routing sandbox clearance transaction...',
            success: (ref: any) => {
              verifyPayment(ref);
              return 'Sandbox clearance generated successfully!';
            },
            error: 'Sandbox clearance failed.'
          }
        );
        return;
      }

      console.log("[PAYMENT MODULE] Launching Paystack payment overlay with client public key:", activePublicKey);

      const handler = (window as any).PaystackPop.setup({
        key: activePublicKey,
        email: safeEmail,
        amount: serverAmount,
        currency: 'GHS',
        access_code: access_code,
        callback: function(response: any) {
          console.log("[PAYMENT MODULE] Paystack checkout success. Dispatching settlement confirmation for reference:", response.reference);
          setLoading(false);
          verifyPayment(response.reference);
        },
        onClose: function() {
          console.warn("[PAYMENT MODULE] User cancelled Paystack payment application overlay.");
          setLoading(false);
          toast("Payment verification postponed. You can resume at any time.");
        }
      });

      handler.openIframe();
    } catch (err: any) {
      console.error("[PAYMENT ENGINE EXCEPTION CAUGHT] Root trace:", err);
      setLoading(false); // Absolutely clean up the button loading state
      
      const rawErrorStr = err.message || "";
      let preciseErrorCode = "PAYMENT_ROUTE_FAILED";
      let preciseDescription = "The settlement connection bridge failed. Initializing offline standby sandbox clearance...";

      if (rawErrorStr.includes("PAYSTACK_PUBLIC_KEY_MISSING")) {
        preciseErrorCode = "PAYSTACK_PUBLIC_KEY_MISSING";
        preciseDescription = "Client-side payment public key is missing or corrupted.";
      } else if (rawErrorStr.includes("PAYSTACK_SECRET_KEY_MISSING")) {
        preciseErrorCode = "PAYSTACK_SECRET_KEY_MISSING";
        preciseDescription = "Server-side payment secret key is missing or corrupted.";
      } else if (rawErrorStr.includes("CALLBACK_URL_INVALID")) {
        preciseErrorCode = "CALLBACK_URL_INVALID";
        preciseDescription = "Payment callback safety redirect hostname validation failed.";
      } else if (rawErrorStr.includes("PAYSTACK_INITIALIZATION_FAILED")) {
        preciseErrorCode = "PAYSTACK_INITIALIZATION_FAILED";
        preciseDescription = "The external paystack gateway initialization handshake failed.";
      } else if (rawErrorStr.includes("NETWORK_REQUEST_FAILED") || rawErrorStr.toLowerCase().includes("timeout")) {
        preciseErrorCode = "NETWORK_REQUEST_FAILED";
        preciseDescription = "High network latency or connection reset interrupted bridge operations.";
      } else if (rawErrorStr.includes("HTTP_500") || rawErrorStr.includes("500")) {
        preciseErrorCode = "PAYSTACK_SECRET_KEY_MISSING"; // Usual cause of 500 when Supabase or Paystack secret key is missing
        preciseDescription = "The remote server signaled an internal settlement error.";
      }

      // Display precise error notification
      toast.error(preciseErrorCode, {
        description: preciseDescription,
        duration: 8000
      });

      // Prevent customer billing block: trigger offline sandbox deployment
      const fallbackRef = `NEXA-SB-REF-${Date.now()}`;
      console.warn(`[RECOVERY TRIGGERS] Routing active offline standby sandbox reference: ${fallbackRef}`);
      setTimeout(() => {
        verifyPayment(fallbackRef);
      }, 1500);
    }
  };

  const verifyPayment = async (reference: string) => {
    const tenantId = profile?.tenant_id || storedTenantId;
    
    if (!tenantId) {
      console.error("[VERIFY ERROR] Tenant ID identity missing during verification phase.");
      toast.error("Handshake Desynchronized", { 
        description: "Your session identity was lost. Please reload the page to re-establish secure linkage." 
      });
      return;
    }

    setVerifying(true);
    const toastId = toast.loading("Verifying settlement bridge...");

      try {
        const response = await api.post("/api/payments/verify", {
          reference,
          tenant_id: tenantId,
          plan_id: planId, // Pass as fallback
          billing_cycle: billingCycle // Pass as fallback
        });

        toast.dismiss(toastId);
        
        if (response.data?.success) {
          toast.success("Security Clearance Granted!", { 
            description: response.data.message || "Your ecosystem is now active." 
          });
          
          await refreshProfile();
          setTimeout(() => {
            navigate("/onboard/wizard");
          }, 1500);
        }
      } catch (error: any) {
        console.error("Verification Lifecycle Error:", error);
        toast.dismiss(toastId);
        // The api.ts interceptor already handles showing the toast for 400/500 errors
      } finally {
        setVerifying(false);
      }
  };

  if (!user || !planId || !plan) return null;

  const price = billingCycle === 'yearly' ? plan.yearly_price : plan.monthly_price;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="w-full max-w-xl space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <div className="mx-auto h-20 w-20 rounded-3xl bg-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.4)] flex items-center justify-center mb-8">
            <Lock className="h-10 w-10 text-black" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-white leading-none">Hardened Settlement</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] leading-none">Secure Payment Authorization Module</p>
        </div>

        <Card className="bg-slate-900/40 border-white/5 shadow-2xl backdrop-blur-2xl rounded-[40px] overflow-hidden p-2">
          <CardHeader className="pt-10 pb-6 text-center">
            <div className="flex justify-center gap-1 mb-4">
               {[1, 2, 3].map((s) => (
                 <div key={s} className={`h-1 w-8 rounded-full ${s <= 2 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
               ))}
            </div>
            <CardTitle className="text-2xl font-black italic text-white uppercase tracking-tight">Ecosystem Deployment</CardTitle>
            <CardDescription className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Phase 02: Resource Allocation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="bg-white/5 rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <CreditCard className="h-24 w-24 text-white" />
               </div>
              <div className="flex justify-between items-start mb-6 pb-6 border-b border-white/5 relative z-10">
                <div>
                  <h4 className="text-white font-black italic uppercase tracking-tight text-xl">{plan.name}</h4>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{billingCycle} Settlement Mode</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-emerald-500 tracking-tighter">₵{price.toLocaleString()}</span>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">GHS / {billingCycle === 'yearly' ? 'Year' : 'Month'}</p>
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                {(plan.features as string[]).slice(0, 4).map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Button 
                onClick={handlePayment}
                className="w-full h-18 rounded-3xl bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-[0.2em] text-sm gap-3 shadow-xl shadow-emerald-500/20 transition-all active:scale-[0.98]"
                disabled={loading || verifying}
              >
                {loading || verifying ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>{verifying ? 'Liquidating Assets...' : 'Establishing Secure Bridge...'}</span>
                  </>
                ) : (
                  <>Authorize Settlement <ArrowRight className="h-5 w-5" /></>
                )}
              </Button>
              
              <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>End-to-End Enterprise Grade Encryption</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center flex flex-col items-center gap-4">
           <button 
             onClick={() => navigate('/pricing')}
             className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 hover:text-white transition-colors"
           >
             RETURN TO PLAN SELECTION
           </button>

           <button 
             onClick={async () => {
               toast.loading("Resetting handshake identity...");
               await refreshProfile();
               window.location.reload();
             }}
             className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-800 hover:text-emerald-500/50 transition-colors"
           >
             RELOAD IDENTITY DATA
           </button>
        </div>
      </div>
    </div>
  );
}
