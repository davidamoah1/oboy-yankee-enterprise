import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';
import { AlertOctagon, RotateCw, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-slate-950 p-6 text-white font-sans selection:bg-emerald-500/30">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.08),rgba(255,255,255,0))]" />
          
          <div className="relative max-w-md w-full bg-slate-900 border border-white/5 rounded-[32px] p-8 md:p-10 shadow-2xl text-center flex flex-col items-center gap-6 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500" />
            
            <div className="h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center animate-pulse">
              <AlertOctagon className="h-8 w-8 text-red-500" />
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white uppercase italic tracking-tighter">
                System Link Disrupted
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                An unexpected local core interruption occurred. Safe container operations have buffered your data to local storage.
              </p>
            </div>

            {this.state.error && (
              <div className="w-full bg-black/40 border border-white/[0.03] p-4 rounded-xl text-left font-mono text-[10px] text-slate-500 overflow-x-auto max-h-32 mb-2 no-scrollbar">
                <span className="text-red-400 font-bold uppercase tracking-wider block mb-1">Crashed Stack:</span>
                {this.state.error.stack || this.state.error.message}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 w-full mt-2">
              <Button 
                onClick={this.handleReload} 
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold tracking-tight rounded-xl flex items-center justify-center gap-2 text-xs transition-transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <RotateCw className="h-3.5 w-3.5 animate-spin-slow text-slate-950" />
                Hot Reload
              </Button>
              <Button 
                onClick={this.handleReset}
                variant="outline"
                className="w-full h-11 border-white/5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs transition-transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <Home className="h-3.5 w-3.5 text-slate-400" />
                Nexa Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
