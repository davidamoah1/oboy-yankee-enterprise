import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Sparkles, 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp, 
  Settings,
  X,
  Command as CommandIcon,
  Zap,
  ArrowRight
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { geminiService } from '@/services/gemini-service';
import { toast } from 'sonner';

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  category: 'Actions' | 'Navigation' | 'Intelligence';
  action: () => void;
}

export function NexaCommand() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isBadgeDismissed, setIsBadgeDismissed] = useState(() => {
    try {
      return localStorage.getItem('nexa-command-badge-dismissed') === 'true';
    } catch {
      return false;
    }
  });
  const navigate = useNavigate();
  const { tenantId } = useParams();

  const dismissBadge = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      localStorage.setItem('nexa-command-badge-dismissed', 'true');
    } catch (err) {
      console.warn(err);
    }
    setIsBadgeDismissed(true);
    toast.message("Command Badge Hidden", {
      description: "Launch anytime by pressing ⌘K or using the Search Bar in the top header.",
    });
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const commands: CommandItem[] = [
    {
      id: 'pos',
      title: 'Launch Point of Sale',
      subtitle: 'Open terminal for new transactions',
      icon: <Zap className="h-4 w-4 text-emerald-500" />,
      category: 'Actions',
      action: () => navigate(`/app/${tenantId}/pos`)
    },
    {
      id: 'inventory',
      title: 'Manage Stock',
      subtitle: 'Inventory and supply chain control',
      icon: <Package className="h-4 w-4 text-blue-500" />,
      category: 'Navigation',
      action: () => navigate(`/app/${tenantId}/inventory`)
    },
    {
      id: 'growth',
      title: 'Growth Analytics',
      subtitle: 'Intelligence and revenue forecasting',
      icon: <TrendingUp className="h-4 w-4 text-purple-500" />,
      category: 'Intelligence',
      action: () => navigate(`/app/${tenantId}/reports`)
    },
    {
      id: 'customers',
      title: 'Customer Directory',
      subtitle: 'Relationship and loyalty management',
      icon: <Users className="h-4 w-4 text-orange-500" />,
      category: 'Navigation',
      action: () => navigate(`/app/${tenantId}/customers`)
    }
  ];

  const handleAiAsk = async () => {
    if (!query) return;
    setIsAiLoading(true);
    setAiResponse(null);
    try {
      const response = await geminiService.askNexa(query, { tenantId });
      setAiResponse(response);
    } catch (error) {
      setAiResponse("I couldn't process that query. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredCommands = commands.filter(cmd => 
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[8vh] sm:pt-[12vh] px-3 sm:px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden glass-panel"
            >
              <div className="flex items-center px-4 py-3 sm:px-5 sm:py-4 border-b border-white/5">
                <Search className={cn(
                  "h-4 w-4 sm:h-5 sm:w-5 mr-3 sm:mr-4 transition-colors shrink-0",
                  isAiLoading ? "text-emerald-500 animate-pulse" : "text-muted-foreground"
                )} />
                <input
                  autoFocus
                  placeholder="Ask Nexa AI or find anything... (CMD+K)"
                  className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base font-bold italic tracking-tight placeholder:text-slate-600"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAiAsk();
                  }}
                />
                <div className="flex items-center gap-2 shrink-0">
                   {query && !aiResponse && (
                     <button 
                       onClick={handleAiAsk}
                       className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all"
                     >
                       Ask AI
                     </button>
                   )}
                   <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded-md border border-white/10 bg-white/5 px-1.5 font-mono text-[9px] font-bold text-muted-foreground">
                    ESC
                   </kbd>
                </div>
              </div>

              <div className="max-h-[35vh] sm:max-h-[45vh] overflow-y-auto p-1.5 sm:p-2 custom-scrollbar">
                {aiResponse && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="m-2 sm:m-3 p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-emerald-500/5 border border-emerald-500/20"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500">Nexa Intelligence Response</span>
                    </div>
                    <div className="text-xs sm:text-sm text-slate-200 leading-relaxed prose prose-invert max-w-none">
                       {aiResponse}
                    </div>
                    <button 
                      onClick={() => setAiResponse(null)}
                      className="mt-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-emerald-500 transition-colors"
                    >
                      Clear Response
                    </button>
                  </motion.div>
                )}

                {!aiResponse && (
                  <div className="space-y-2 sm:space-y-3 py-1">
                    {['Actions', 'Intelligence', 'Navigation'].map((category) => {
                      const categoryCmds = filteredCommands.filter(c => c.category === category);
                      if (categoryCmds.length === 0) return null;
                      
                      return (
                        <div key={category} className="space-y-0.5 px-1">
                          <h3 className="px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">
                            {category}
                          </h3>
                          {categoryCmds.map((cmd) => (
                            <button
                              key={cmd.id}
                              onClick={() => {
                                cmd.action();
                                setIsOpen(false);
                              }}
                              className="w-full flex items-center justify-between p-2.5 sm:p-3 rounded-xl hover:bg-white/5 group transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                                  {cmd.icon}
                                </div>
                                <div className="text-left min-w-0">
                                  <p className="font-bold text-xs sm:text-sm text-slate-100 italic tracking-tight truncate">{cmd.title}</p>
                                  <p className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate">{cmd.subtitle}</p>
                                </div>
                              </div>
                              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0" />
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {filteredCommands.length === 0 && !aiResponse && query && (
                  <div className="py-8 flex flex-col items-center justify-center text-center px-4">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                      <Sparkles className="h-5 w-5 text-emerald-500 animate-pulse" />
                    </div>
                    <p className="font-bold text-xs sm:text-sm text-slate-200">No local match found. Press Enter to ask Nexa AI.</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">I can search across your historical data and provide insights.</p>
                  </div>
                )}
              </div>

              <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-t border-white/5 bg-slate-950/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <kbd className="h-4.5 w-4.5 flex items-center justify-center rounded bg-white/5 border border-white/10 text-[9px] font-bold text-muted-foreground italic">↵</kbd>
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/50 italic leading-none">Select</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="h-4.5 w-4.5 flex items-center justify-center rounded bg-white/5 border border-white/10 text-[9px] font-bold text-muted-foreground italic">↑↓</kbd>
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/50 italic leading-none">Navigate</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                   <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                   <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500 italic leading-none">Nexa Active</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Shortcut Badge */}
      {!isOpen && !isBadgeDismissed && (
        <div className="fixed bottom-20 right-4 sm:bottom-8 sm:right-8 z-[90] flex items-center gap-1.5 group/badge-container">
          {/* Subtle Dismiss Button */}
          <button
            onClick={dismissBadge}
            className="h-7 w-7 rounded-full bg-slate-950 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-900 shadow-xl transition-all scale-90 sm:scale-75 opacity-100 sm:opacity-0 group-hover/badge-container:opacity-100 group-hover/badge-container:scale-100 duration-200"
            title="Dismiss Badge Trigger"
          >
            <X className="h-3 w-3" />
          </button>
          
          <motion.button
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={() => setIsOpen(true)}
            className="h-10 sm:h-12 px-3 sm:px-4 rounded-xl sm:rounded-2xl bg-emerald-500 text-black font-black uppercase tracking-widest text-[9px] sm:text-[10px] flex items-center gap-1.5 sm:gap-2 shadow-2xl shadow-emerald-500/20 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <CommandIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 relative z-10 shrink-0" />
            <span className="relative z-10 hidden md:inline whitespace-nowrap">Command Palette</span>
            <span className="h-3.5 px-1 rounded bg-black/10 flex items-center justify-center text-[8px] relative z-10 font-mono">⌘K</span>
          </motion.button>
        </div>
      )}
    </>
  );
}
