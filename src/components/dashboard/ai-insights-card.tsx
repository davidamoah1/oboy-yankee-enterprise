import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { geminiService, BusinessInsight } from "@/services/gemini-service";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface AIInsightsCardProps {
  businessName: string;
  salesData: any[];
  inventoryData: any[];
}

export function AIInsightsCard({ businessName, salesData, inventoryData }: AIInsightsCardProps) {
  const [insights, setInsights] = useState<BusinessInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const results = await geminiService.getBusinessInsights({
        businessName,
        sales: salesData,
        inventory: inventoryData
      });
      setInsights(results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const currentInsight = insights[currentIndex];

  return (
    <Card className="border-none shadow-sm flex-1 p-2 bg-slate-900 text-white relative overflow-hidden group">
      <div className="absolute -right-8 -bottom-8 h-48 w-48 bg-emerald-500/20 blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-1000" />
      <CardHeader className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-emerald-400" />
          </div>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-emerald-400/50" />}
        </div>
        <CardTitle className="text-lg font-black uppercase tracking-tight italic mt-4 flex items-center gap-2">
          AI Business Intelligence
          <Zap className="h-3 w-3 text-yellow-400 fill-yellow-400" />
        </CardTitle>
        <CardDescription className="text-white/40 text-xs font-bold uppercase tracking-widest">
          Ghana Market Analysis
        </CardDescription>
      </CardHeader>
      
      <CardContent className="px-6 pb-6 min-h-[140px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          {!loading && currentInsight ? (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              <h4 className="font-black text-sm text-emerald-400 uppercase italic tracking-tighter">
                {currentInsight.title}
              </h4>
              <p className="text-sm font-bold leading-tight line-clamp-3">
                {currentInsight.description}
              </p>
              <div className="flex items-center gap-2 pt-2">
                <span className={cn(
                  "text-[8px] font-black uppercase px-2 py-0.5 rounded-full",
                  currentInsight.priority === 'high' ? "bg-red-500/20 text-red-300" : "bg-emerald-500/20 text-emerald-300"
                )}>
                  {currentInsight.priority} Priority
                </span>
                <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">
                  Impact: {currentInsight.impact}
                </span>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-white/20">
              <p className="text-xs font-black uppercase tracking-[0.2em]">Gathering data...</p>
            </div>
          )}
        </AnimatePresence>

        <div className="flex gap-2 pt-6 mt-auto">
          <Button 
            onClick={() => setCurrentIndex((prev) => (prev + 1) % insights.length)}
            disabled={insights.length <= 1 || loading}
            className="flex-1 rounded-xl bg-white text-slate-900 hover:bg-white/90 font-black uppercase tracking-widest text-[9px] h-10 border-none shadow-xl shadow-black/20"
          >
            Next Insight
            <ArrowRight className="h-3 w-3 ml-2" />
          </Button>
          <Button 
            variant="outline"
            onClick={fetchInsights}
            disabled={loading}
            className="aspect-square p-0 w-10 h-10 rounded-xl border-white/10 bg-white/5 hover:bg-white/10"
          >
             <Zap className={cn("h-4 w-4", loading && "animate-pulse")} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
