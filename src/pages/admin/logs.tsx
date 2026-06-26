import { useState, useMemo } from "react";
import { 
  Search, 
  Filter, 
  Terminal, 
  Shield, 
  AlertCircle, 
  Info, 
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Download,
  Trash2,
  Clock,
  Globe,
  Database,
  RefreshCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { SystemLog } from "@/types/super-admin";

const INITIAL_LOGS: SystemLog[] = [
  { id: "LOG-101", level: "info", category: "auth", message: "User 'admin_kofi' initialized a secure session from IP 192.168.1.42", timestamp: "2024-05-11 10:30:15", userId: "1", tenantId: "P-001" },
  { id: "LOG-102", level: "warning", category: "system", message: "Server-West-1 reporting elevated latency (124ms). Check load balancing.", timestamp: "2024-05-11 10:35:22" },
  { id: "LOG-103", level: "error", category: "security", message: "Brute force pattern detected from range 45.12.33.0/24. Source quarantined.", timestamp: "2024-05-11 10:40:05" },
  { id: "LOG-104", level: "info", category: "tenant", message: "Entity 'Accra Mart' updated service plan to 'Enterprise'", timestamp: "2024-05-11 10:45:11", tenantId: "1" },
  { id: "LOG-105", level: "critical", category: "database", message: "Primary DB Cluster sync failure. Switched to Hot-Standby.", timestamp: "2024-05-11 10:50:44" },
  { id: "LOG-106", level: "info", category: "billing", message: "Subscription payout reconciled for 142 tenants.", timestamp: "2024-05-11 11:00:00" },
];

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<SystemLog[]>(INITIAL_LOGS);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<SystemLog["level"] | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<SystemLog["category"] | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleClear = () => {
    toast.info("Clearing system logs...");
    setTimeout(() => {
      setLogs([]);
      toast.success("Logs cleared and saved to archive");
    }, 1500);
  };

  const handleRefresh = () => {
    toast.info("Syncing with latest activities...");
    setTimeout(() => {
      setLogs([...INITIAL_LOGS]);
      toast.success("Logs updated");
    }, 1000);
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchSearch = log.message.toLowerCase().includes(search.toLowerCase()) ||
                          log.id.toLowerCase().includes(search.toLowerCase());
      const matchLevel = levelFilter === 'all' || log.level === levelFilter;
      const matchCategory = categoryFilter === 'all' || log.category === categoryFilter;
      
      return matchSearch && matchLevel && matchCategory;
    });
  }, [logs, search, levelFilter, categoryFilter]);

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const getLevelColor = (level: string) => {
    switch (level) {
      case "info": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "warning": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "error": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "critical": return "bg-red-600 text-white border-none animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]";
      default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 bg-slate-900/40 backdrop-blur-xl p-10 rounded-[40px] border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Terminal className="h-32 w-32 rotate-12 text-slate-500" />
        </div>
        <div className="space-y-3 relative z-10">
           <div className="flex items-center gap-3 mb-2">
              <div className="h-6 w-1 bg-slate-400 rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Activity Monitoring</span>
           </div>
           <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none text-slate-100">Server Logs</h1>
           <p className="text-slate-500 font-bold text-sm max-w-lg">Real-time record of all system activities, security checks, and server updates.</p>
        </div>
        <div className="relative z-10 w-full lg:w-auto flex flex-col sm:flex-row gap-4">
            <Button variant="outline" onClick={handleRefresh} className="w-full sm:w-auto h-14 px-8 rounded-2xl border-white/10 font-black uppercase tracking-widest text-[10px] gap-3 bg-white/5 hover:bg-white/10 transition-all text-slate-300">
               <RefreshCcw className="h-4 w-4" /> Refresh
            </Button>
            <Button variant="outline" onClick={handleClear} className="w-full sm:w-auto h-14 px-8 rounded-2xl border-red-500/20 font-black uppercase tracking-widest text-[10px] gap-3 bg-red-500/5 hover:bg-red-500/10 transition-all text-red-500">
               <Trash2 className="h-4 w-4" /> Clear Logs
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {[
           { label: "Active Monitors", val: "12", icon: Globe, color: "text-blue-500" },
           { label: "Critical Incidents", val: "1", icon: ShieldAlert, color: "text-red-500" },
           { label: "Total Records", val: "24.5k", icon: Database, color: "text-primary" },
         ].map((stat, i) => (
           <Card key={i} className="border-none shadow-2xl bg-slate-900/40 backdrop-blur-xl rounded-[30px] border border-white/5 group hover:border-primary/20 transition-all overflow-hidden relative p-8">
              <div className="flex items-center justify-between">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</p>
                    <h3 className={cn("text-3xl font-black italic tracking-tighter uppercase", stat.color)}>{stat.val}</h3>
                 </div>
                 <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center bg-white/5", stat.color)}>
                    <stat.icon className="h-6 w-6" />
                 </div>
              </div>
           </Card>
         ))}
      </div>

      <Card className="border-none shadow-2xl bg-slate-900/40 backdrop-blur-xl rounded-[40px] border border-white/5 overflow-hidden">
        <CardHeader className="p-8 border-b border-white/5 bg-slate-900/20">
          <div className="flex flex-col xl:flex-row items-center justify-between gap-6">
            <div className="relative w-full xl:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
              <Input 
                placeholder="Search logs by ID or message..." 
                className="h-12 pl-12 bg-black/40 border-white/5 text-slate-200 placeholder:text-slate-700 font-bold italic tracking-wide rounded-2xl focus-visible:ring-primary/20"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <div className="flex items-center gap-3 w-full xl:w-auto">
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-12 px-6 rounded-2xl border-white/10 font-bold text-[10px] uppercase tracking-widest gap-3 bg-white/5 hover:bg-white/10 transition-all text-slate-400">
                      <Filter className="h-4 w-4" /> {levelFilter === 'all' ? 'Category' : levelFilter.toUpperCase()}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-slate-900 border-white/5 text-slate-200">
                    <DropdownMenuItem onClick={() => setLevelFilter('all')}>All Categories</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLevelFilter('info')} className="text-blue-500">Info</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLevelFilter('warning')} className="text-amber-500">Warning</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLevelFilter('error')} className="text-red-500">Error</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLevelFilter('critical')} className="text-red-600 font-bold">Critical</DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>

               <Button 
                 variant="outline" 
                 onClick={() => toast.info("Preparing optimized platform audit log (.log)")}
                 className="h-12 px-8 rounded-2xl border-white/10 font-bold text-[10px] uppercase tracking-widest gap-3 bg-white/5 hover:bg-white/10 transition-all text-slate-400"
               >
                  <Download className="h-4 w-4" /> Download Archive
               </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader className="bg-white/[0.02] border-b border-white/5">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="h-14 px-8 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500">Log ID</TableHead>
                  <TableHead className="h-14 px-8 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500">Level</TableHead>
                  <TableHead className="h-14 px-8 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500">Type</TableHead>
                  <TableHead className="h-14 px-8 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500">Activity Message</TableHead>
                  <TableHead className="h-14 px-8 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {paginatedLogs.map((log, i) => (
                    <motion.tr 
                      key={log.id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-white/5 last:border-none group hover:bg-white/[0.02] transition-colors"
                    >
                      <TableCell className="px-8 py-4">
                        <span className="font-mono text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {log.id}
                        </span>
                      </TableCell>
                      <TableCell className="px-8 py-4">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "font-black uppercase tracking-[0.2em] text-[8px] px-2 h-5 rounded-md",
                            getLevelColor(log.level)
                          )}
                        >
                          {log.level}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-8 py-4">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest italic">{log.category}</span>
                      </TableCell>
                      <TableCell className="px-8 py-4 max-w-md">
                        <p className="text-xs font-bold text-slate-300 leading-relaxed font-mono truncate hover:whitespace-normal transition-all cursor-default">
                           {log.message}
                        </p>
                        {(log.userId || log.tenantId) && (
                          <div className="flex gap-2 mt-2">
                             {log.userId && <span className="text-[8px] font-black uppercase tracking-widest text-slate-600 bg-white/5 px-1.5 rounded">User ID: {log.userId}</span>}
                             {log.tenantId && <span className="text-[8px] font-black uppercase tracking-widest text-slate-600 bg-white/5 px-1.5 rounded">Shop ID: {log.tenantId}</span>}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="px-8 py-4 text-right font-mono text-[10px] text-slate-600 font-black italic tracking-widest uppercase">
                        <div className="flex items-center justify-end gap-2">
                           <Clock className="h-3 w-3" /> {log.timestamp}
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          <div className="p-8 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">
                Platform synced {filteredLogs.length} activities
             </p>
             <div className="flex items-center gap-2">
                <Button 
                   variant="outline" 
                   size="icon" 
                   className="h-10 w-10 rounded-xl border-white/5 bg-white/5"
                   onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                   disabled={currentPage === 1}
                >
                   <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1 mx-2">
                   <span className="text-[10px] font-black uppercase text-slate-500">Page</span>
                   <span className="text-[10px] font-black uppercase text-primary italic">{currentPage} / {totalPages || 1}</span>
                </div>
                <Button 
                   variant="outline" 
                   size="icon" 
                   className="h-10 w-10 rounded-xl border-white/5 bg-white/5"
                   onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                   disabled={currentPage === totalPages || totalPages === 0}
                >
                   <ChevronRight className="h-4 w-4" />
                </Button>
             </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex items-center justify-center p-12 opacity-10">
         <Shield className="h-32 w-32 text-slate-500" />
      </div>
    </div>
  );
}
