import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Filter,
  Activity,
  ChevronLeft,
  ChevronRight,
  Clock,
  Database,
  RefreshCcw,
  User,
  Loader2,
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { apiClient } from "@/lib/api-client";

interface ActivityLogEntry {
  id: string;
  userId: string | null;
  action: string;
  description: string | null;
  metadata: any;
  createdAt: string;
  user: { id: string; fullName: string; email: string; role: string } | null;
}

const ACTION_FILTERS = [
  "all", "LOGIN", "LOGOUT", "SALE_CREATE", "PRODUCT_CREATE", "PRODUCT_UPDATE", "PRODUCT_DELETE",
  "CUSTOMER_CREATE", "CUSTOMER_UPDATE", "CUSTOMER_DELETE", "STAFF_INVITE", "STAFF_DELETE",
  "RETURN_CREATE", "INVOICE_CREATE", "Z_REPORT_CREATE", "CREDIT_PAYMENT", "PROFILE_UPDATE", "PASSWORD_CHANGE",
];

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 15;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      params.set("limit", String(limit));
      if (actionFilter !== "all") params.set("action", actionFilter);

      const res = await apiClient.get(`/api/activity-logs?${params.toString()}`);
      const data = res.data?.data || res.data;
      setLogs(Array.isArray(data) ? data : []);
      setTotal(res.data?.total || 0);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err: any) {
      toast.error("Failed to fetch activity logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleRefresh = () => {
    fetchLogs();
    toast.success("Logs refreshed");
  };

  const filteredLogs = useMemo(() => {
    if (!search) return logs;
    const q = search.toLowerCase();
    return logs.filter(log =>
      log.description?.toLowerCase().includes(q) ||
      log.action?.toLowerCase().includes(q) ||
      log.user?.fullName?.toLowerCase().includes(q) ||
      log.user?.email?.toLowerCase().includes(q)
    );
  }, [logs, search]);

  const getActionColor = (action: string) => {
    if (action.includes("DELETE") || action.includes("REMOVE")) return "bg-red-500/10 text-red-500 border-red-500/20";
    if (action.includes("CREATE") || action.includes("INVITE")) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    if (action.includes("UPDATE") || action.includes("CHANGE")) return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    if (action.includes("LOGIN") || action.includes("LOGOUT")) return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    return "bg-slate-500/10 text-slate-500 border-slate-500/20";
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 bg-slate-900/40 backdrop-blur-xl p-10 rounded-[40px] border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Activity className="h-32 w-32 rotate-12 text-slate-500" />
        </div>
        <div className="space-y-3 relative z-10">
           <div className="flex items-center gap-3 mb-2">
              <div className="h-6 w-1 bg-slate-400 rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Audit Trail</span>
           </div>
           <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none text-slate-100">Activity Logs</h1>
           <p className="text-slate-500 font-bold text-sm max-w-lg">Track every action performed by your team — sales, inventory changes, customer updates, and more.</p>
        </div>
        <div className="relative z-10 w-full lg:w-auto flex flex-col sm:flex-row gap-4">
            <Button variant="outline" onClick={handleRefresh} className="w-full sm:w-auto h-14 px-8 rounded-2xl border-white/10 font-black uppercase tracking-widest text-[10px] gap-3 bg-white/5 hover:bg-white/10 transition-all text-slate-300">
               <RefreshCcw className="h-4 w-4" /> Refresh
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: "Total Activities", val: String(total), icon: Database, color: "text-primary" },
           { label: "Current Page", val: `${currentPage}/${totalPages || 1}`, icon: Clock, color: "text-blue-500" },
           { label: "Action Types", val: String(ACTION_FILTERS.length - 1), icon: Activity, color: "text-amber-500" },
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
                placeholder="Search by user, action, or description..."
                className="h-12 pl-12 bg-black/40 border-white/5 text-slate-200 placeholder:text-slate-700 font-bold italic tracking-wide rounded-2xl focus-visible:ring-primary/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 w-full xl:w-auto">
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-12 px-6 rounded-2xl border-white/10 font-bold text-[10px] uppercase tracking-widest gap-3 bg-white/5 hover:bg-white/10 transition-all text-slate-400">
                      <Filter className="h-4 w-4" /> {actionFilter === 'all' ? 'All Actions' : actionFilter.replace(/_/g, ' ')}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-slate-900 border-white/5 text-slate-200 max-h-64 overflow-y-auto">
                    {ACTION_FILTERS.map(a => (
                      <DropdownMenuItem key={a} onClick={() => { setActionFilter(a); setCurrentPage(1); }}>
                        {a === 'all' ? 'All Actions' : a.replace(/_/g, ' ')}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
               </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader className="bg-white/[0.02] border-b border-white/5">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="h-14 px-8 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500">Action</TableHead>
                  <TableHead className="h-14 px-8 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500">User</TableHead>
                  <TableHead className="h-14 px-8 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500">Description</TableHead>
                  <TableHead className="h-14 px-8 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-20 text-center">
                      <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mt-4">Loading activity logs...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-20 text-center">
                      <Database className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">No activity logs found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                <AnimatePresence mode="popLayout">
                  {filteredLogs.map((log, i) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-white/5 last:border-none group hover:bg-white/[0.02] transition-colors"
                    >
                      <TableCell className="px-8 py-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-black uppercase tracking-[0.2em] text-[8px] px-2 h-5 rounded-md",
                            getActionColor(log.action)
                          )}
                        >
                          {log.action.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-8 py-4">
                        {log.user ? (
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-white/5 flex items-center justify-center">
                              <User className="h-3 w-3 text-slate-400" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-300">{log.user.fullName}</p>
                              <p className="text-[8px] font-black uppercase tracking-widest text-slate-600">{log.user.role}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">System</span>
                        )}
                      </TableCell>
                      <TableCell className="px-8 py-4 max-w-md">
                        <p className="text-xs font-bold text-slate-300 leading-relaxed">
                           {log.description || log.action}
                        </p>
                      </TableCell>
                      <TableCell className="px-8 py-4 text-right font-mono text-[10px] text-slate-600 font-black italic tracking-widest uppercase">
                        <div className="flex items-center justify-end gap-2">
                           <Clock className="h-3 w-3" /> {new Date(log.createdAt).toLocaleString()}
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="p-8 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">
                {total} total activities
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
                   disabled={currentPage >= totalPages}
                >
                   <ChevronRight className="h-4 w-4" />
                </Button>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
