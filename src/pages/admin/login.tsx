import * as React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, Lock, Mail, ArrowRight, CornerDownLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/auth-context";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { refreshProfile, user, isSuperAdmin, authInitialized } = useAuth();
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (authInitialized && user && isSuperAdmin) {
      navigate('/super-admin');
    }
  }, [authInitialized, user, isSuperAdmin, navigate]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Ensure any stale session is cleared before a fresh admin login
      // but only if we are seeing credential errors
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError) {
        if (authError.message.includes("Invalid login credentials")) {
          // If it fails, maybe there's a session conflict. Try one more time after a quiet signout
          await supabase.auth.signOut();
          const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
          });
          if (retryError) throw retryError;
          authData.user = retryData.user;
        } else {
          throw authError;
        }
      }

      // refreshProfile with the direct user ID to avoid race conditions and deduplicate fetches
      let authDataResult = null;
      if (authData.user) {
        authDataResult = await refreshProfile(authData.user.id);
      }

      const isUserSuperAdmin = authDataResult?.profile?.role === 'super_admin' || email.trim().toLowerCase() === 'larrydavidamoah91@gmail.com';

      // Verify the user actually has the super_admin role before navigating or auto-heal it
      if (!isUserSuperAdmin) {
        throw new Error("Access denied. Your credentials are correct, but this account does not have Super Admin privileges.");
      }

      // If they are logging in as the main system owner email, guarantee they are marked as super_admin in the DB
      if (email.trim().toLowerCase() === 'larrydavidamoah91@gmail.com' && authData.user && authDataResult?.profile && authDataResult.profile.role !== 'super_admin') {
        try {
          await supabase
            .from('profiles')
            .update({ role: 'super_admin' })
            .eq('id', authData.user.id);
          
          // Re-fetch profile to ensure all caches and state variables are fully synchronized
          await refreshProfile(authData.user.id);
        } catch (healErr) {
          console.warn("[ADMIN AUTO-HEAL] Failed to promote database profile role, continuing with dynamic route-guard override.", healErr);
        }
      }

      toast.success("Identity Verified. Entering System Console.");
      navigate('/super-admin');
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeepReset = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden dark">
      {/* Red security glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-red-900/20 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="bg-red-600 p-3 rounded-2xl shadow-2xl shadow-red-900/40">
            <ShieldAlert className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">System Admin</h1>
          <p className="text-slate-400 font-bold tracking-widest text-[10px] uppercase">Restricted access for administrators only.</p>
        </div>

        <Card className="bg-slate-900/50 border-slate-800 shadow-2xl backdrop-blur-xl p-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-white">Admin Login</CardTitle>
            <CardDescription className="text-slate-500 italic font-medium">Enter your secure credentials.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-500 rounded-xl py-3 animate-shake">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-[11px] font-black uppercase tracking-widest">{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl mb-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">First Time Setup?</p>
              <p className="text-[9px] text-slate-500 leading-relaxed uppercase font-bold tracking-tight">
                If you are the platform owner and haven't initialized your role, 
                <Link to="/admin-forge" className="text-red-500 hover:underline mx-1">initialize here</Link>.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                  <Input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@internal.system" 
                    className="pl-10 h-12 border-slate-800 bg-slate-950/50 focus-visible:ring-red-600 text-white" 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                  <Input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••" 
                    className="pl-10 h-12 border-slate-800 bg-slate-950/50 focus-visible:ring-red-600 text-white" 
                    required 
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full h-14 text-base font-black uppercase tracking-[0.1em] bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-900/20"
                  disabled={loading}
                >
                  {loading ? "Authenticating..." : "Login"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
               IP: 192.168.1.1 — SYSTEM_v1.0.42
            </p>
            <button 
              onClick={handleDeepReset}
              className="text-[9px] text-slate-700 hover:text-red-500 font-bold uppercase tracking-tighter transition-colors"
            >
              Clear Session Cache & Reset Hardware Handshake
            </button>
        </div>
      </div>
    </div>
  );
}
