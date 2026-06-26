import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  TrendingDown,
  AlertCircle,
  Lightbulb,
  BrainCircuit,
  PieChart,
  LineChart,
  ChevronRight,
  Package
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { geminiService, BusinessInsight, RevenueForecast } from '@/services/gemini-service';
import { cn } from '@/lib/utils';

interface NexaIntelligenceHubProps {
  businessName: string;
  salesData: any[];
  inventoryData: any[];
}

export function NexaIntelligenceHub({ businessName, salesData, inventoryData }: NexaIntelligenceHubProps) {
  const [insights, setInsights] = useState<BusinessInsight[]>([]);
  const [forecast, setForecast] = useState<RevenueForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'insights' | 'forecast' | 'health'>('insights');

  useEffect(() => {
    let mounted = true;

    // 1. Load cached telemetry immediately on mount or tenant reload to bypass spinner block
    try {
      const cached = localStorage.getItem('oboy_yankee_intel_cache');
      if (cached && mounted) {
        const parsed = JSON.parse(cached);
        if (parsed?.insights && parsed?.forecast) {
          setInsights(parsed.insights);
          setForecast(parsed.forecast);
          setLoading(false); // instant render!
        }
      }
    } catch (e) {
      console.warn("Local telemetry cache read failed:", e);
    }

    async function loadIntelligence() {
      const hasCache = localStorage.getItem('oboy_yankee_intel_cache');
      if (!hasCache && mounted) {
        setLoading(true);
      }

      try {
        const [fetchedInsights, fetchedForecast] = await Promise.all([
          geminiService.getBusinessInsights({ sales: salesData, inventory: inventoryData, businessName }),
          geminiService.predictRevenue({ historicalSales: salesData, businessName })
        ]);

        if (mounted) {
          setInsights(fetchedInsights);
          setForecast(fetchedForecast);

          // Save to local cache
          try {
            localStorage.setItem('oboy_yankee_intel_cache', JSON.stringify({
              insights: fetchedInsights,
              forecast: fetchedForecast
            }));
          } catch (cacheErr) {}
        }
      } catch (error) {
        console.error('Nexa Intelligence Error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadIntelligence();

    return () => {
      mounted = false;
    };
  }, [salesData, inventoryData, businessName]);

  return (
    <Card className="border border-border/80 shadow-md bg-card/40 backdrop-blur-xl overflow-hidden min-h-[450px] sm:min-h-[500px] flex flex-col rounded-[2.2rem]">
      <CardHeader className="border-b border-border/50 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
               <BrainCircuit className="h-5 w-5 text-emerald-500" />
             </div>
             <div>
               <CardTitle className="text-lg sm:text-xl font-black italic tracking-tighter uppercase text-foreground">OmniBiz Intel</CardTitle>
               <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Cognitive Business Analysis Engine</CardDescription>
             </div>
          </div>
          <div className="flex items-center gap-1 bg-secondary/80 p-1 rounded-2xl border border-border/50 self-start lg:self-auto overflow-x-auto w-full lg:w-auto">
             {(['insights', 'forecast', 'health'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex-1 lg:flex-none px-3 sm:px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                    activeTab === tab ? "bg-emerald-500 text-black shadow-md font-black" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab}
                </button>
             ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-8 sm:p-12 text-center"
            >
              <div className="relative">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-t-2 border-emerald-500 animate-spin" />
                <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <h3 className="mt-6 sm:mt-8 text-base sm:text-lg font-black italic tracking-tighter uppercase text-foreground">Synthesizing Business Logic...</h3>
              <p className="text-xs text-muted-foreground mt-2 max-w-[250px] leading-relaxed">Nexa is orchestrating your sales and inventory data to generate growth vectors.</p>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6"
            >
              {activeTab === 'insights' && (
                <div className="grid gap-4">
                  {insights.map((insight, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="group p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-secondary/30 border border-border/80 hover:border-emerald-500/30 transition-all glow-hover"
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                         <div className="flex items-center gap-2 sm:gap-3">
                            <div className={cn(
                              "h-8 w-8 rounded-xl flex items-center justify-center shrink-0",
                              insight.category === 'sales' ? "bg-blue-500/10 text-blue-500" :
                              insight.category === 'inventory' ? "bg-orange-500/10 text-orange-500" :
                              insight.category === 'finance' ? "bg-purple-500/10 text-purple-500" :
                              "bg-emerald-500/10 text-emerald-500"
                            )}>
                               {insight.category === 'sales' ? <Zap className="h-4 w-4" /> :
                                insight.category === 'inventory' ? <Package className="h-4 w-4" /> :
                                insight.category === 'finance' ? <TrendingUp className="h-4 w-4" /> :
                                <Lightbulb className="h-4 w-4" />}
                            </div>
                            <h4 className="font-bold text-xs sm:text-sm text-foreground italic tracking-tight">{insight.title}</h4>
                         </div>
                         <Badge className={cn(
                           "text-[8px] font-black uppercase tracking-widest shrink-0 border-none",
                           insight.priority === 'high' ? "bg-red-500 text-white animate-pulse" :
                           insight.priority === 'medium' ? "bg-amber-500 text-black" :
                           "bg-emerald-500 text-black"
                         )}>
                            {insight.priority}
                         </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed pl-0 sm:pl-11">{insight.description}</p>
                      <div className="mt-3 pl-0 sm:pl-11 flex items-center gap-2">
                         <ArrowRight className="h-3 w-3 text-emerald-500" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 group-hover:translate-x-1 transition-transform cursor-pointer">Implement</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {activeTab === 'forecast' && forecast && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 p-5 sm:p-8 rounded-3xl bg-emerald-500 text-black relative overflow-hidden shadow-xl">
                     <div className="relative z-10 space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-65">Value Prediction (30d)</p>
                        <h2 className="text-3xl xs:text-4xl sm:text-5xl font-black italic tracking-tighter">₵ {forecast.predictedRevenue.toLocaleString()}</h2>
                     </div>
                     <div className="relative z-10 sm:mb-1 shrink-0 self-start sm:self-auto">
                        <Badge className="bg-black/15 text-black border-none font-black text-[9px] h-6 px-2.5">
                           {forecast.confidence * 100}% Rating Score
                        </Badge>
                     </div>
                     <TrendingUp className="absolute right-[-20px] bottom-[-20px] h-48 w-48 opacity-10 pointer-events-none" />
                  </div>

                  <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
                     <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-secondary/30 border border-border/80">
                        <div className="flex items-center gap-2 mb-3">
                           <TrendingUp className="h-4 w-4 text-emerald-500" />
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Strategic Index</h4>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{forecast.reasoning}</p>
                     </div>
                     <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-secondary/30 border border-border/80">
                        <div className="flex items-center gap-2 mb-3">
                           <Zap className="h-4 w-4 text-emerald-500" />
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Key Drivers</h4>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                           {forecast.keyDrivers.map((driver, i) => (
                             <Badge key={i} variant="outline" className="rounded-xl px-2.5 py-1 text-[9px] font-black uppercase tracking-tight bg-secondary border border-border text-foreground">
                               {driver}
                             </Badge>
                           ))}
                        </div>
                     </div>
                  </div>
                </div>
              )}

              {activeTab === 'health' && (
                <div className="space-y-6">
                   <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 sm:gap-6">
                      {[
                        { label: 'Operational Risk', score: 12, status: 'Low', color: 'emerald' },
                        { label: 'Capital Velocity', score: 78, status: 'High', color: 'emerald' },
                        { label: 'Fraud Vulnerability', score: 4, status: 'Negligible', color: 'emerald' },
                      ].map((item, i) => (
                        <div key={i} className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-secondary/30 border border-border text-center">
                           <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-3 text-center truncate">{item.label}</p>
                           <div className="text-2xl xs:text-3xl font-black italic text-foreground tracking-tighter mb-1">{item.score}%</div>
                           <Badge variant="outline" className="rounded-xl border-emerald-500/20 bg-emerald-500/5 text-emerald-500 text-[8px] font-black uppercase tracking-widest">
                             {item.status} Risk
                           </Badge>
                        </div>
                      ))}
                   </div>
                   
                   <div className="p-4 sm:p-6 lg:p-8 rounded-3xl bg-secondary/20 border border-border">
                      <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <div className="flex items-center gap-2sm:gap-3">
                           <ShieldCheck className="h-5 w-5 text-emerald-500" />
                           <h4 className="font-bold text-xs sm:text-sm text-foreground italic tracking-tight uppercase">System Health Audit</h4>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">OPTIMAL</span>
                      </div>
                      <div className="space-y-4">
                         {[
                           { label: 'Inventory Integrity', status: 94 },
                           { label: 'Sales Consistency', status: 88 },
                           { label: 'Customer Retention Rate', status: 72 },
                         ].map((audit, i) => (
                           <div key={i} className="space-y-1.5">
                              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest italic">
                                <span className="text-muted-foreground/75">{audit.label}</span>
                                <span className="text-foreground">{audit.status}%</span>
                              </div>
                              <Progress value={audit.status} className="h-1 bg-secondary" />
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      <div className="p-4 sm:p-6 border-t border-border/40 bg-secondary/20 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between rounded-b-[2.2rem]">
         <div className="flex items-center gap-2">
            <Zap className="h-3 w-3 text-emerald-500 animate-pulse shrink-0" />
            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 leading-none">Real-time Intell Stream Link</span>
         </div>
         <Button variant="ghost" size="sm" className="h-8 rounded-xl text-[9px] font-black uppercase tracking-widest text-emerald-500 group hover:bg-emerald-500/10 self-start sm:self-auto">
            Export Report <ArrowRight className="h-3 w-3 ml-1.5 group-hover:translate-x-1 transition-transform" />
         </Button>
      </div>
    </Card>
  );
}
