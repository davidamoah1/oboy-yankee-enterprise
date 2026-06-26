import * as React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, Lock, Mail, ArrowRight, CornerDownLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";

export default function AdminRegisterPage() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real production app, this would be restricted or require a master key
    // For this build, we'll allow registration if the code is 'NEXA-ADMIN-2024'
    if (adminCode !== 'NEXA-ADMIN-2024') {
      toast.error("Invalid System Authorization Code.");
      return;
    }

    setLoading(true);

    try {
      // 1. Attempt to Sign Up
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'super_admin',
          }
        }
      });

      // 2. Handle "Already Registered" - Attempt to Promote
      if (authError && authError.message.toLowerCase().includes('already registered')) {
        setRegStep('Account detected. Attempting role promotion...');
        
        // Try to sign in first to verify ownership
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) {
          throw new Error("Email exists in the system. To upgrade this account to Super Admin, you MUST use its existing password. Otherwise, use a different email address for a fresh Admin account.");
        }

        if (signInData.user) {
          // Promote the user in the profiles table - only use guaranteed columns (role, full_name)
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              role: 'super_admin',
              full_name: fullName || signInData.user.user_metadata?.full_name || 'System Administrator',
              updated_at: new Date().toISOString()
            })
            .eq('id', signInData.user.id);

          if (updateError) {
            // If update fails because profile doesn't exist, try one last insert
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                 id: signInData.user.id,
                 role: 'super_admin',
                 full_name: fullName || 'System Administrator'
              });
            if (insertError) throw insertError;
          }

          // Force a profile refresh in the context
          await refreshProfile();
          
          toast.success("Identity Upgrade Successful! Your account now has System Console access.");
          navigate('/super-admin');
          return;
        }
      }

      if (authError) throw authError;

      if (data.user) {
        toast.success("Super Admin account forged successfully! Please login to continue.");
        navigate('/admin-login');
        return;
      }
    } catch (err: any) {
      toast.error(err.message, {
        duration: 6000,
      });
    } finally {
      setLoading(false);
      setRegStep('');
    }
  };

  const [regStep, setRegStep] = useState("");

  React.useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setEmail(session.user.email || "");
        if (!fullName) setFullName(session.user.user_metadata?.full_name || "");
      }
    };
    checkSession();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden dark">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-red-900/20 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="bg-red-600 p-3 rounded-2xl shadow-2xl shadow-red-900/40">
            <ShieldAlert className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">Admin Forge</h1>
          <p className="text-slate-400 font-bold tracking-widest text-[10px] uppercase">Initialize or Upgrade a system administrator role.</p>
        </div>

        <Card className="bg-slate-900/50 border-slate-800 shadow-2xl backdrop-blur-xl p-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-white">System Authorization</CardTitle>
            <CardDescription className="text-slate-500 text-xs leading-relaxed">
              Authorized personnel only. If you have an existing SME OS account, use your login credentials to upgrade to Super Admin. Otherwise, create a unique admin account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleRegister} className="space-y-4">
              {regStep && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl mb-4 animate-pulse">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 text-center">{regStep}</p>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                  <Input 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="System Architect" 
                    className="pl-10 h-12 border-slate-800 bg-slate-950/50 focus-visible:ring-red-600 text-white" 
                    required 
                  />
                </div>
              </div>

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
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Password (New or Existing)</label>
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
                <p className="text-[8px] text-slate-600 px-1 italic">Use your existing SME OS password if you already have an account.</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Authorization Code</label>
                <div className="relative">
                  <ShieldAlert className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                  <Input 
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    placeholder="NEXA-XXXX-XXXX" 
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
                  {loading ? (regStep || "Forging Identity...") : "Invoke Admin Access"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
            <Link to="/admin-login" className="text-[10px] text-slate-500 font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2">
               <CornerDownLeft className="h-3 w-3" /> Back to Login
            </Link>
        </div>
      </div>
    </div>
  );
}
