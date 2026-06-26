import { Link } from "react-router-dom";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        <LoginForm />
      </div>

      <div className="fixed bottom-8 text-center text-[10px] font-black uppercase tracking-[0.5em] text-slate-800">
        OBOY YANKEE ENTERPRISE
      </div>
    </div>
  );
}

