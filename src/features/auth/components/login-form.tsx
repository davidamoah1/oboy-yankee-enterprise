import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Building2, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      <div className="text-center space-y-2">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mx-auto h-16 w-16 rounded-3xl bg-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.3)] flex items-center justify-center mb-6"
        >
          <Building2 className="h-10 w-10 text-black" />
        </motion.div>
        <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white">Welcome Back</h1>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Log in to OBOY YANKEE ENTERPRISE</p>
      </div>

      <Card className="bg-slate-900/50 border-white/5 shadow-2xl backdrop-blur-xl rounded-[32px] overflow-hidden p-2">
        <CardHeader className="pt-8 pb-4 text-center">
          <CardTitle className="text-xl font-black italic text-white uppercase tracking-tight">Login</CardTitle>
          <CardDescription className="text-slate-500 font-bold">Enter your credentials to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  className="h-14 pl-12 bg-black/40 border-white/5 text-white placeholder:text-slate-700 font-bold italic tracking-tight rounded-2xl focus-visible:ring-indigo-500/20"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between pl-1">
                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password</Label>
                <button type="button" className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:underline">Forgot Password?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-14 pl-12 bg-black/40 border-white/5 text-white placeholder:text-slate-700 font-bold italic tracking-tight rounded-2xl focus-visible:ring-indigo-500/20"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-16 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-black font-black uppercase tracking-[0.15em] text-xs gap-3 shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Log In <ArrowRight className="h-5 w-5" /></>}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="pb-8 pt-4 justify-center">
          <p className="text-slate-500 font-bold text-xs">Need an account? <Link to="/register" className="text-indigo-500 hover:underline">Register</Link></p>
        </CardFooter>
      </Card>
    </div>
  );
}
