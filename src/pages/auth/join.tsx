import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Users, ArrowRight, CornerDownLeft, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

export default function JoinPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [invite, setInvite] = useState<any>(null);
  const [tenant, setTenant] = useState<any>(null);

  // Form states for new user
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('worker_invites')
          .select('*, tenants(name)')
          .eq('token', token)
          .eq('status', 'pending')
          .single();

        if (error || !data) {
          throw new Error("Invalid or expired invitation token.");
        }

        // Check expiry
        if (new Date(data.expires_at) < new Date()) {
          throw new Error("This invitation has expired.");
        }

        setInvite(data);
        setEmail(data.email);
        setTenant(data.tenants);
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    }

    verifyToken();
  }, [token]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invite || verifying) return;

    setVerifying(true);
    try {
      // 1. Create User
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            tenant_id: invite.tenant_id,
            role: invite.role
          }
        }
      });

      if (authError) throw authError;

      // 2. Mark Invite as Accepted
      const { error: inviteError } = await supabase
        .from('worker_invites')
        .update({ status: 'accepted' })
        .eq('id', invite.id);

      if (inviteError) console.error("Could not update invite status", inviteError);

      toast.success("Welcome aboard! You have joined the team.");
      navigate(`/app/${invite.tenant_id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to join team.");
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!token || !invite) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <Card className="max-w-md w-full bg-slate-900 border-white/5 text-center p-8 rounded-[2.5rem]">
           <div className="h-20 w-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="h-10 w-10 text-red-500" />
           </div>
           <h2 className="text-2xl font-black italic uppercase text-white mb-2">Invalid Access Token</h2>
           <p className="text-slate-500 font-bold mb-8">This invitation might have expired or was already used.</p>
           <Button asChild className="w-full h-14 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[10px]">
              <Link to="/">Return to Base</Link>
           </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <Link to="/" className="fixed top-8 left-8 flex items-center gap-2 group text-slate-400 hover:text-white transition-colors z-50">
        <CornerDownLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        <span className="font-bold text-xs uppercase tracking-widest text-white">Exit Portal</span>
      </Link>

      <div className="relative z-10 w-full max-w-md py-12">
        <div className="text-center space-y-4 mb-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto h-16 w-16 rounded-3xl bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center justify-center mb-6"
          >
            <Users className="h-10 w-10 text-black" />
          </motion.div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white">Join the Team</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Invited to join <span className="text-emerald-500">{tenant?.name}</span></p>
        </div>

        <Card className="bg-slate-900/50 border-white/5 shadow-2xl backdrop-blur-xl rounded-[32px] overflow-hidden p-2">
          <CardHeader className="pt-8 pb-4 text-center">
            <CardTitle className="text-xl font-black italic text-white uppercase tracking-tight">Create Identity</CardTitle>
            <CardDescription className="text-slate-500 font-bold">Register as a <span className="text-emerald-500 capitalize">{invite.role}</span></CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Confirmed Email</Label>
                <Input
                  id="email"
                  value={email}
                  readOnly
                  disabled
                  className="h-14 bg-black/20 border-white/5 text-slate-500 font-bold italic tracking-tight rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Your Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="h-14 bg-black/40 border-white/5 text-white placeholder:text-slate-700 font-bold italic tracking-tight rounded-2xl focus-visible:ring-emerald-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" title="At least 6 characters" className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Choose Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-14 bg-black/40 border-white/5 text-white placeholder:text-slate-700 font-bold italic tracking-tight rounded-2xl focus-visible:ring-emerald-500/20"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-16 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-[0.15em] text-xs gap-3 shadow-xl shadow-emerald-500/20 transition-all active:scale-[0.98] mt-4"
                disabled={verifying}
              >
                {verifying ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Synchronizing...</span>
                  </>
                ) : (
                  <>Accept Invitation <ArrowRight className="h-5 w-5" /></>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="pb-8 pt-4 justify-center">
            <p className="text-slate-500 font-bold text-xs italic tracking-tighter">Securing Ghanaian Enterprise Assets</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
