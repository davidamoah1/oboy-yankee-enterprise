import { motion } from 'motion/react';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Insight {
  id: string;
  type: 'opportunity' | 'alert' | 'info';
  title: string;
  description: string;
  impact?: string;
}

interface AIInsightsProps {
  insights: Insight[];
}

export function AIInsights({ insights }: AIInsightsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 italic">Advanced Intelligence Live</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.map((insight, idx) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group relative p-6 rounded-[32px] bg-slate-900 border border-white/5 hover:border-emerald-500/30 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
               {insight.type === 'opportunity' && <TrendingUp className="h-24 w-24 text-emerald-500" />}
               {insight.type === 'alert' && <AlertTriangle className="h-24 w-24 text-amber-500" />}
               {insight.type === 'info' && <Lightbulb className="h-24 w-24 text-blue-500" />}
            </div>

            <div className={cn(
              "h-10 w-10 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
              insight.type === 'opportunity' ? "bg-emerald-500/10 text-emerald-500" :
              insight.type === 'alert' ? "bg-amber-500/10 text-amber-500" :
              "bg-blue-500/10 text-blue-500"
            )}>
              {insight.type === 'opportunity' && <Sparkles className="h-5 w-5" />}
              {insight.type === 'alert' && <AlertTriangle className="h-5 w-5" />}
              {insight.type === 'info' && <Lightbulb className="h-5 w-5" />}
            </div>

            <h3 className="text-lg font-black italic tracking-tighter text-white uppercase mb-2 group-hover:text-emerald-400 transition-colors">{insight.title}</h3>
            <p className="text-sm font-bold text-slate-500 leading-relaxed italic mb-4">{insight.description}</p>
            
            {insight.impact && (
              <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">Projected Impact</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black">{insight.impact}</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
