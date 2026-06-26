import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  X, 
  Send, 
  BrainCircuit, 
  MessageSquare, 
  Zap, 
  User, 
  Bot,
  Maximize2,
  Minimize2,
  Mic,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { geminiService } from '@/services/gemini-service';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function NexaAssistant() {
  const { tenant } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I am **OmniBiz AI**. I've analyzed your current business matrix. How can I help you orchestrate growth today?",
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const businessType = tenant?.settings?.category || "Provision Shop";

    try {
      // In a real app, we would pass actual business context here
      const response = await geminiService.askNexa(input, { mode: 'assistant', businessType });
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting to your business engine right now.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-28 right-8 z-[80] h-16 w-16 rounded-full bg-emerald-500 text-black shadow-2xl shadow-emerald-500/30 flex items-center justify-center group overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <Sparkles className="h-6 w-6 relative z-10 animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, transformOrigin: 'bottom right' }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '80px' : '650px',
              width: '450px'
            }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className={cn(
              "fixed bottom-8 right-8 z-[110] bg-slate-900 border border-white/10 rounded-4xl shadow-2xl flex flex-col overflow-hidden glass-panel",
              isMinimized && "rounded-3xl"
            )}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-950/30">
               <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <BrainCircuit className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-black italic text-white uppercase tracking-tighter leading-none">OmniBiz AI Assistant</h3>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_rgba(16,185,129,1)]" />
                       <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Neural Engine Active</span>
                    </div>
                  </div>
               </div>
               <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="h-8 w-8 rounded-lg hover:bg-white/5 text-muted-foreground"
                  >
                    {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
               </div>
            </div>

            {/* Chat Area */}
            {!isMinimized && (
              <>
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
                >
                  {messages.map((msg) => (
                    <motion.div
                       key={msg.id}
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       className={cn(
                        "flex gap-4",
                        msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                       )}
                    >
                      <div className={cn(
                        "h-8 w-8 rounded-xl shrink-0 flex items-center justify-center",
                        msg.role === 'user' ? "bg-slate-800" : "bg-emerald-500/10 text-emerald-500"
                      )}>
                        {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <div className={cn(
                        "p-4 rounded-3xl text-sm leading-relaxed max-w-[85%]",
                        msg.role === 'user' 
                          ? "bg-emerald-500 text-black font-medium" 
                          : "bg-white/5 text-slate-200 border border-white/5 prose prose-invert prose-emerald max-w-none"
                      )}>
                         <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </motion.div>
                  ))}
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-4"
                    >
                      <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <Bot className="h-4 w-4 animate-bounce" />
                      </div>
                      <div className="bg-white/5 text-slate-400 p-4 rounded-3xl text-xs font-black italic tracking-widest uppercase animate-pulse">
                        Analyzing your business matrix...
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Input Area */}
                <div className="p-6 border-t border-white/5 bg-slate-950/50">
                  <div className="relative group">
                    <textarea
                      placeholder="Ask OmniBiz about sales, growth, or advice..."
                      className="w-full bg-slate-900/50 border border-white/10 rounded-3xl p-5 pr-32 min-h-[100px] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all resize-none font-medium"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                    />
                    <div className="absolute bottom-4 right-4 flex items-center gap-2">
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         className="h-10 w-10 rounded-xl text-muted-foreground hover:bg-white/5"
                       >
                         <Mic className="h-4 w-4" />
                       </Button>
                       <Button 
                         size="icon" 
                         onClick={handleSend}
                         disabled={!input.trim() || loading}
                         className="h-10 w-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black shadow-xl shadow-emerald-500/20"
                       >
                         <Send className="h-4 w-4" />
                       </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 px-2">
                     <div className="flex gap-4">
                        <button className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-emerald-500 transition-colors">Forecasting</button>
                        <button className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-emerald-500 transition-colors">Risk Audit</button>
                        <button className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-emerald-500 transition-colors">Optimization</button>
                     </div>
                     <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/20 italic">Context aware intelligence</span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
