
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building2, 
  Package, 
  Users, 
  CreditCard, 
  CheckCircle2, 
  Loader2, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  MapPin,
  Clock,
  Briefcase
} from "lucide-react";

const STEPS = [
  { id: "welcome", title: "Welcome", icon: Sparkles },
  { id: "business", title: "Business Setup", icon: Building2 },
  { id: "products", title: "First Products", icon: Package },
  { id: "staff", title: "Team Members", icon: Users },
  { id: "finish", title: "Ready!", icon: CheckCircle2 }
];

export default function OnboardWizardPage() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Form States
  const [location, setLocation] = useState("");
  const [opHours, setOpHours] = useState("");
  const [category, setCategory] = useState("");

  // Load saved progress cache on mount
  useState(() => {
    try {
      const savedStep = localStorage.getItem("nexa_onboard_step");
      const savedLocation = localStorage.getItem("nexa_onboard_location");
      const savedOpHours = localStorage.getItem("nexa_onboard_op_hours");
      const savedCategory = localStorage.getItem("nexa_onboard_category");

      if (savedStep) {
        // Safe casting with boundary verification (max steps value is 4)
        const stepNum = Number(savedStep);
        if (stepNum >= 0 && stepNum <= 4) {
          setCurrentStep(stepNum);
        }
      }
      if (savedLocation) setLocation(savedLocation);
      if (savedOpHours) setOpHours(savedOpHours);
      if (savedCategory) setCategory(savedCategory);
    } catch (e) {
      console.warn("Could not hydrate onboarding state cache:", e);
    }
  });

  // Keep localStorage sync'd automatically
  const persistProgress = (step: number, loc: string, hr: string, cat: string) => {
    try {
      localStorage.setItem("nexa_onboard_step", step.toString());
      localStorage.setItem("nexa_onboard_location", loc);
      localStorage.setItem("nexa_onboard_op_hours", hr);
      localStorage.setItem("nexa_onboard_category", cat);
    } catch (e) {
      console.warn("Could not persist onboarding cache:", e);
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      persistProgress(nextStep, location, opHours, category);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      persistProgress(prevStep, location, opHours, category);
    }
  };

  const completeOnboarding = async () => {
    setLoading(true);
    try {
      // Use the server-side API to bypass RLS issues during initial setup
      const response = await api.post('/api/onboard/complete', {
        tenant_id: profile?.companyId,
        location,
        opHours,
        category,
        completed_steps: STEPS.map(s => s.id)
      });

      if (response.data?.success) {
        // Clear saved onboarding cache upon finalization success
        try {
          localStorage.removeItem("nexa_onboard_step");
          localStorage.removeItem("nexa_onboard_location");
          localStorage.removeItem("nexa_onboard_op_hours");
          localStorage.removeItem("nexa_onboard_category");
        } catch (lsErr) {}

        // CRITICAL: Refresh the auth profile to get the updated 'onboarded' status
        // This ensures RoleGuard sees the tenant as onboarded
        await refreshProfile();

        toast.success("Security Clearance Verified", { 
          description: "Your business ecosystem is now fully operational." 
        });
        
        // Short delay for the toast to be seen
        setTimeout(() => {
          navigate(`/app/${profile?.companyId}`);
        }, 1500);
      } else {
        throw new Error(response.data?.message || "Sync rejected.");
      }
    } catch (err: any) {
      console.error("[ONBOARD SYNC FAIL]", err);
      toast.error("Failed to save progress. Please try again.", {
        description: err.response?.data?.message || err.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Run a visual save trigger whenever inputs update
  const handleInputChange = (field: string, val: string) => {
    if (field === "location") {
      setLocation(val);
      persistProgress(currentStep, val, opHours, category);
    } else if (field === "opHours") {
      setOpHours(val);
      persistProgress(currentStep, location, val, category);
    } else if (field === "category") {
      setCategory(val);
      persistProgress(currentStep, location, opHours, val);
    }
  };

  if (!user || !profile) return null;

  const currentStepData = STEPS[currentStep];

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row relative overflow-hidden">
      {/* Sidebar Progress (Sleek Horizontal Flow on mobile, vertical drawer on desktop) */}
      <div className="w-full md:w-80 bg-slate-950 p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-900 z-10 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-6 md:mb-12 justify-between md:justify-start">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Building2 className="h-4 w-4 text-black" />
              </div>
              <span className="text-white font-black italic uppercase tracking-widest text-xs">SME OS GHANA</span>
            </div>
            {/* Horizontal state micro bar for small layouts */}
            <span className="text-[10px] font-mono text-emerald-500 font-bold md:hidden">Progress: {Math.round(((currentStep + 1) / 5) * 100)}%</span>
          </div>
 
          <div className="flex flex-row md:flex-col gap-3 md:gap-6 overflow-x-auto md:overflow-visible pb-3 md:pb-0 scrollbar-none justify-between md:justify-start">
            {STEPS.map((step, i) => (
              <div key={step.id} className="flex flex-row items-center gap-2.5 md:gap-4 group shrink-0 select-none">
                <div className={`
                  h-8.5 w-8.5 md:h-10 md:w-10 rounded-xl flex items-center justify-center transition-all duration-500 border-2 text-[10px] md:text-sm
                  ${i < currentStep ? 'bg-emerald-500 border-emerald-500 text-black' : 
                    i === currentStep ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500 animate-pulse' : 
                    'bg-slate-900 border-slate-800 text-slate-500'}
                `}>
                  {i < currentStep ? <CheckCircle2 className="h-4.5 w-4.5" /> : <step.icon className="h-4.5 w-4.5" />}
                </div>
                <div className="flex flex-col text-left">
                  <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest ${i === currentStep ? 'text-emerald-500' : 'text-slate-600'}`}>
                    Step 0{i + 1}
                  </span>
                  <span className={`text-xs md:text-sm font-bold tracking-tight ${i <= currentStep ? 'text-white' : 'text-slate-700'} hidden md:block`}>
                    {step.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
 
        <div className="hidden md:block pt-12">
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-700 leading-relaxed mb-4">
             Secured by Enterprise Grade Cryptography Node: ACCRA-01
           </p>
           <div className="h-px w-full bg-slate-900" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 relative">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px]" />
        
        <div className="w-full max-w-2xl relative z-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {currentStep === 0 && (
                <div className="space-y-6 text-center md:text-left">
                  <div className="inline-flex h-12 w-12 bg-emerald-50 rounded-2xl items-center justify-center mb-4">
                    <Sparkles className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
                    Welcome to the <span className="text-emerald-600">Future</span>
                  </h2>
                  <p className="text-xl text-slate-500 font-bold leading-relaxed max-w-xl">
                    Congratulations, {profile?.fullName}! Your enterprise node for <span className="text-slate-900">{profile?.companyId ? "your business" : "the hub"}</span> is active. 
                    Let's configure your workspace in under 2 minutes.
                  </p>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black italic uppercase tracking-tight">Business Profile</h2>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Essential operations data</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-[10px] font-black uppercase tracking-widest text-slate-700">Business Type / Industry</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                         <select 
                          id="category"
                          value={category}
                          onChange={e => handleInputChange("category", e.target.value)}
                          className="w-full h-14 pl-12 pr-10 rounded-2xl border border-slate-200 font-bold tracking-tight bg-slate-50 focus:bg-white text-slate-900 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                          style={{ colorScheme: "light" }}
                        >
                          <option value="" disabled className="text-slate-500 bg-white font-medium">-- Select Business Type --</option>
                          <option value="Provision Shop" className="text-slate-900 bg-white font-medium">Provision Shop</option>
                          <option value="Mini Mart" className="text-slate-900 bg-white font-medium">Mini Mart</option>
                          <option value="Cosmetics Shop" className="text-slate-900 bg-white font-medium">Cosmetics Shop</option>
                          <option value="Fashion Shop" className="text-slate-900 bg-white font-medium">Fashion Shop</option>
                          <option value="Pharmacy" className="text-slate-900 bg-white font-medium">Pharmacy</option>
                          <option value="Restaurant" className="text-slate-900 bg-white font-medium">Restaurant</option>
                          <option value="Electronics Shop" className="text-slate-900 bg-white font-medium">Electronics Shop</option>
                          <option value="Hardware Store" className="text-slate-900 bg-white font-medium">Hardware Store</option>
                          <option value="Salon" className="text-slate-900 bg-white font-medium">Salon</option>
                          <option value="Wholesale Shop" className="text-slate-900 bg-white font-medium">Wholesale Shop</option>
                          <option value="Supermarket" className="text-slate-900 bg-white font-medium">Supermarket</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                          ▼
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-[10px] font-black uppercase tracking-widest text-slate-700">Primary Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                          id="location"
                          value={location}
                          onChange={e => handleInputChange("location", e.target.value)}
                          placeholder="East Legon, Accra" 
                          className="h-14 pl-12 rounded-2xl border-slate-200 font-bold tracking-tight bg-slate-50 focus:bg-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="hours" className="text-[10px] font-black uppercase tracking-widest text-slate-700">Operating Hours</Label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                          id="hours"
                          value={opHours}
                          onChange={e => handleInputChange("opHours", e.target.value)}
                          placeholder="8:00 AM - 6:00 PM Mon-Sat" 
                          className="h-14 pl-12 rounded-2xl border-slate-200 font-bold tracking-tight bg-slate-50 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-8">
                  <div className="space-y-2 text-center md:text-left">
                    <h2 className="text-3xl font-black italic uppercase tracking-tight">Seed Your Inventory</h2>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">You can add these properly in the dashboard later</p>
                  </div>
                  
                  <div className="bg-slate-50 rounded-[2.5rem] p-12 border-2 border-dashed border-slate-200 text-center">
                    <Package className="h-16 w-16 text-slate-300 mx-auto mb-6" />
                    <h4 className="text-xl font-black italic uppercase text-slate-400">Inventory Portal Ready</h4>
                    <p className="text-sm text-slate-500 font-bold mt-2">Your subscription allows for up to 10,000 SKUs.</p>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-8">
                   <div className="space-y-2 text-center md:text-left">
                    <h2 className="text-3xl font-black italic uppercase tracking-tight">Deploy Your Force</h2>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Add cashier and manager nodes</p>
                  </div>

                  <div className="bg-emerald-50/50 rounded-[2.5rem] p-12 border border-emerald-100 flex flex-col items-center text-center">
                    <Users className="h-12 w-12 text-emerald-600 mb-6" />
                    <h4 className="text-xl font-black italic uppercase text-emerald-900 leading-tight">Worker Invitation System Enabled</h4>
                    <p className="text-sm text-emerald-700/70 font-bold mt-2 max-w-xs">You can invite your first cashier immediately from the dashboard.</p>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-8 text-center">
                  <div className="inline-flex h-20 w-20 bg-emerald-500 rounded-3xl items-center justify-center mb-4 shadow-xl shadow-emerald-200 animate-bounce">
                    <CheckCircle2 className="h-10 w-10 text-black" />
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
                    All Systems <span className="text-emerald-600">Green</span>
                  </h2>
                  <p className="text-xl text-slate-500 font-bold leading-relaxed max-w-xl mx-auto">
                    Your SME hardware and software layers are fully synchronized. Your business is now powered by Ghana's premier operating system.
                  </p>
                </div>
              )}

              <div className="pt-12 flex gap-4">
                {currentStep > 0 && (
                  <Button 
                    variant="outline"
                    onClick={handleBack}
                    className="h-16 px-8 rounded-2xl font-black uppercase tracking-widest text-slate-500 border-slate-200"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" /> Back
                  </Button>
                )}
                <Button 
                  onClick={handleNext}
                  disabled={loading}
                  className={`flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl transition-all ${
                    currentStep === STEPS.length - 1 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200' 
                    : 'bg-black hover:bg-slate-900 text-white'
                  }`}
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                    <>
                      {currentStep === STEPS.length - 1 ? 'Unlock My Dashboard' : 'Continue Integration'}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
