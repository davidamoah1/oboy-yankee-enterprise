import { useNavigate } from "react-router-dom";
import { LogOut, ArrowRight, ShieldCheck, UserCheck } from "lucide-react";
import { RegisterForm } from "@/features/auth/components/register-form";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md py-12">
        {user ? (
          <div className="space-y-6">
            <div className="text-center space-y-2 mb-4">
              <div className="mx-auto h-16 w-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 shadow-[0_0_40px_rgba(99,102,241,0.15)] flex items-center justify-center mb-6">
                <UserCheck className="h-8 w-8 text-indigo-400" />
              </div>
              <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white">Session Active</h1>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">You are already logged in</p>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 text-center space-y-6">
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-left">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Authenticated Identity</span>
                <div className="text-sm font-bold text-white mt-1 truncate">{user.email}</div>
                <div className="flex items-center gap-1.5 mt-2 text-indigo-400">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-xs font-black uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs gap-2 transition-all shadow-lg shadow-indigo-600/10"
                >
                  Enter Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>

                <Button 
                  onClick={signOut}
                  variant="outline"
                  className="w-full h-14 rounded-2xl border-white/5 bg-white/5 text-slate-300 font-black uppercase tracking-widest text-xs gap-2 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <RegisterForm />
        )}
      </div>

      <div className="fixed bottom-8 text-center text-[10px] font-black uppercase tracking-[0.5em] text-slate-800">
        OBOY YANKEE ENTERPRISE
      </div>
    </div>
  );
}
