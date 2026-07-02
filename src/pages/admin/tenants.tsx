import { useState, useMemo, useEffect } from "react";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  ShieldCheck, 
  ShieldAlert, 
  Trash2, 
  ExternalLink,
  Building2,
  CheckCircle2,
  XCircle,
  Download,
  Plus,
  ArrowUpDown,
  Users,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
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
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tenant, EntityStatus, EntityPlan } from "@/types/super-admin";
import apiClient from "@/lib/api-client";

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<EntityStatus | 'all'>('all');
  const [planFilter, setPlanFilter] = useState<EntityPlan | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isAddShopOpen, setIsAddShopOpen] = useState(false);
  const [newShop, setNewShop] = useState({
    name: "",
    owner: "",
    plan: "Starter" as EntityPlan
  });

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      const { data } = await apiClient.get('/api/admin/tenants');
      if (data) {
        setTenants(data);
      }
    } catch (error) {
      console.warn("Failed to load tenants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShop = (e: React.FormEvent) => {
    e.preventDefault();
    toast.error("Direct shop creation disabled. Please use public registration flow to ensure identity mapping.");
    setIsAddShopOpen(false);
  };
  
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; tenantId: string | null; action: string }>({ 
    isOpen: false, 
    tenantId: null, 
    action: "" 
  });

  const handleStatusChange = async (id: string, newStatus: EntityStatus) => {
    try {
      const dbStatus = newStatus === 'active' ? 'active' : 'suspended';
      await apiClient.patch(`/api/admin/tenants/${id}/status`, { status: dbStatus });
      setTenants(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
      toast.success(`Platform Node ${newStatus.toUpperCase()}`);
    } catch (err: any) {
      toast.error("Status propagation failed");
    }
  };

  const handleDelete = async () => {
    if (confirmModal.tenantId) {
      try {
        await apiClient.delete(`/api/admin/tenants/${confirmModal.tenantId}`);
        setTenants(prev => prev.filter(t => t.id !== confirmModal.tenantId));
        toast.success("Platform Node Decommissioned");
        setConfirmModal({ isOpen: false, tenantId: null, action: "" });
      } catch (err) {
        toast.error("Decommissioning failed");
      }
    }
  };

  const filteredTenants = useMemo(() => {
    return tenants.filter(t => {
      const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                          t.slug.toLowerCase().includes(search.toLowerCase()) ||
                          t.owners.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchPlan = planFilter === 'all' || t.plan === planFilter;
      
      return matchSearch && matchStatus && matchPlan;
    });
  }, [tenants, search, statusFilter, planFilter]);

  const paginatedTenants = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTenants.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTenants, currentPage]);

  const totalPages = Math.ceil(filteredTenants.length / itemsPerPage);

  // Bulk operation states & helpers (moved down here to prevent TS2448 error)
  const [selectedTenantIds, setSelectedTenantIds] = useState<string[]>([]);
  const [bulkActionExecuting, setBulkActionExecuting] = useState(false);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const isAllPageSelected = useMemo(() => {
    const pageIds = paginatedTenants.map(t => t.id);
    return pageIds.length > 0 && pageIds.every(id => selectedTenantIds.includes(id));
  }, [paginatedTenants, selectedTenantIds]);

  const isAnyPageSelected = useMemo(() => {
    const pageIds = paginatedTenants.map(t => t.id);
    return pageIds.some(id => selectedTenantIds.includes(id));
  }, [paginatedTenants, selectedTenantIds]);

  const handleSelectAll = (checked: boolean) => {
    const pageIds = paginatedTenants.map(t => t.id);
    if (checked) {
      setSelectedTenantIds(prev => Array.from(new Set([...prev, ...pageIds])));
    } else {
      setSelectedTenantIds(prev => prev.filter(id => !pageIds.includes(id)));
    }
  };

  const handleSelectTenant = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedTenantIds(prev => [...prev, id]);
    } else {
      setSelectedTenantIds(prev => prev.filter(tid => tid !== id));
    }
  };

  const handleBulkStatusChange = async (newStatus: EntityStatus) => {
    if (selectedTenantIds.length === 0) return;
    const count = selectedTenantIds.length;
    const toastId = toast.loading(`Propagating ${newStatus.toUpperCase()} status to ${count} nodes...`);
    
    try {
      setBulkActionExecuting(true);
      const dbStatus = newStatus === 'active' ? 'active' : 'suspended';
      
      await Promise.all(
        selectedTenantIds.map(id => apiClient.patch(`/api/admin/tenants/${id}/status`, { status: dbStatus }))
      );
      
      setTenants(prev => prev.map(t => selectedTenantIds.includes(t.id) ? { ...t, status: newStatus } : t));
      setSelectedTenantIds([]);
      toast.success(`Broadcasting Completed: ${newStatus.toUpperCase()} assigned to ${count} shops.`, { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Status broadcast failed on one or more nodes", { id: toastId });
    } finally {
      setBulkActionExecuting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTenantIds.length === 0) return;
    const count = selectedTenantIds.length;
    const toastId = toast.loading(`Decommissioning ${count} legacy workspace nodes...`);
    
    try {
      setBulkActionExecuting(true);
      await Promise.all(
        selectedTenantIds.map(id => apiClient.delete(`/api/admin/tenants/${id}`))
      );
      
      setTenants(prev => prev.filter(t => !selectedTenantIds.includes(t.id)));
      setSelectedTenantIds([]);
      setConfirmBulkDelete(false);
      toast.success(`SME OS Network: ${count} Nodes Cleanly Decommissioned`, { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Bulk decommissioning encountered errors", { id: toastId });
    } finally {
      setBulkActionExecuting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-card/40 backdrop-blur-xl p-8 rounded-[32px] border border-border/50">
        <div className="space-y-2">
           <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-1 bg-primary rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Shop Records</span>
           </div>
           <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Manage All Shops</h1>
           <p className="text-muted-foreground font-bold text-sm">View and manage all businesses using the platform.</p>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
            <Button 
              variant="outline" 
              onClick={loadTenants}
              disabled={loading}
              className="flex-1 lg:flex-none h-14 px-8 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] gap-3 hover:bg-muted transition-all"
            >
               <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} /> Refresh
            </Button>
            <Button 
              variant="outline" 
              onClick={() => toast.info("Preparing global shop export (.xlsx)")}
              className="flex-1 lg:flex-none h-14 px-8 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] gap-3 hover:bg-muted transition-all"
            >
               <Download className="h-4 w-4" /> Download Records
            </Button>
            <Button 
              onClick={() => setIsAddShopOpen(true)}
              className="flex-1 lg:flex-none h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3 shadow-xl shadow-primary/20 bg-primary border-none hover:translate-y-[-2px] transition-all"
            >
               <Plus className="h-4 w-4" /> Add New Shop
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
         {[
           { label: "Total Shops", val: tenants.length.toString(), icon: Building2, color: "text-primary" },
           { label: "Active Shops", val: tenants.filter(t => t.status === 'active').length.toString(), icon: CheckCircle2, color: "text-green-500" },
           { label: "Suspended Shops", val: tenants.filter(t => t.status === 'suspended').length.toString(), icon: XCircle, color: "text-red-500" },
           { label: "Platform Revenue", val: "GHS 242.5k", icon: CreditCard, color: "text-blue-500" },
         ].map((stat, i) => (
           <Card key={i} className="border-none shadow-2xl shadow-black/[0.02] bg-card/60 backdrop-blur-xl rounded-3xl overflow-hidden group">
             <CardHeader className="p-6 relative">
                 <stat.icon className={cn("h-12 w-12 absolute top-6 right-6 opacity-5 group-hover:scale-110 transition-transform", stat.color)} />
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
                 <h3 className={cn("text-3xl font-black italic tracking-tighter uppercase", stat.color)}>{stat.val}</h3>
             </CardHeader>
           </Card>
         ))}
      </div>

      <Card className="border-none shadow-2xl shadow-black/[0.03] bg-card/60 backdrop-blur-xl rounded-[40px] overflow-hidden">
        <CardHeader className="p-10 pb-6 border-b border-border/50">
          <div className="flex flex-col xl:flex-row items-center justify-between gap-6">
            <div className="relative w-full xl:w-[450px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
              <Input 
                placeholder="Search shops by name or ID..." 
                className="pl-14 h-14 border-none bg-muted/40 rounded-2xl font-bold placeholder:font-black placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-14 px-6 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] gap-3 hover:bg-muted transition-all">
                      <Filter className="h-4 w-4" /> {statusFilter === 'all' ? 'Status' : statusFilter.toUpperCase()}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setStatusFilter('all')}>All Statuses</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('active')} className="text-green-500">Active</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('suspended')} className="text-red-500">Suspended</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('pending')} className="text-amber-500">Pending</DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>

               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-14 px-6 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] gap-3 hover:bg-muted transition-all">
                      <ArrowUpDown className="h-4 w-4" /> {planFilter === 'all' ? 'Plan' : planFilter.toUpperCase()}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setPlanFilter('all')}>All Plans</DropdownMenuItem>
                    {Array.from(new Set(tenants.map(t => t.plan))).filter(Boolean).map(planName => (
                      <DropdownMenuItem key={planName} onClick={() => setPlanFilter(planName as any)}>{planName}</DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
               </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
             <div className="py-40 flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20 mb-6" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40">Polling Network Nodes...</span>
             </div>
          ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader className="bg-muted/10">
                <TableRow className="border-b border-border/50 hover:bg-transparent">
                  <TableHead className="w-[60px] h-20 pl-10 pr-0 text-center">
                    <input 
                      type="checkbox"
                      checked={isAllPageSelected}
                      ref={(el) => {
                        if (el) {
                          el.indeterminate = isAnyPageSelected && !isAllPageSelected;
                        }
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="h-4 w-4 bg-muted/40 border border-border rounded cursor-pointer transition-all hover:scale-110 accent-primary"
                    />
                  </TableHead>
                  <TableHead className="w-[300px] h-20 pl-6 pr-10 text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">Shop Name</TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">Status</TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">Subscription Plan</TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">Owner</TableHead>
                  <TableHead className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">Usage Stats</TableHead>
                  <TableHead className="w-[100px] h-20 px-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {paginatedTenants.map((tenant, i) => {
                    const isSelected = selectedTenantIds.includes(tenant.id);
                    return (
                      <motion.tr 
                        key={tenant.id} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={cn(
                          "border-b border-border/30 hover:bg-muted/30 transition-all group",
                          isSelected && "bg-primary/5 hover:bg-primary/10"
                        )}
                      >
                        <TableCell className="py-6 pl-10 pr-0 text-center">
                          <input 
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectTenant(tenant.id, e.target.checked)}
                            className="h-4 w-4 bg-muted/40 border border-border rounded cursor-pointer transition-all hover:scale-110 accent-primary"
                          />
                        </TableCell>
                        <TableCell className="py-6 pl-6 pr-10">
                          <div className="flex items-center gap-5">
                            <Avatar className="h-14 w-14 rounded-2xl border-2 border-border/50 shadow-sm relative overflow-hidden group-hover:scale-105 transition-transform">
                              <AvatarFallback className="bg-muted text-[10px] font-black italic uppercase">{tenant.name.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-black italic text-lg tracking-tighter uppercase leading-none mb-1 group-hover:text-primary transition-colors">{tenant.name}</span>
                              <code className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 leading-none">ID: {tenant.slug}</code>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "h-2 w-2 rounded-full",
                              tenant.status === "active" ? "bg-green-500 animate-pulse" :
                              tenant.status === "suspended" ? "bg-red-500" : "bg-amber-500"
                            )} />
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "font-black uppercase tracking-[0.2em] text-[9px] px-3 py-1 border-none",
                                tenant.status === "active" ? "bg-green-500/10 text-green-500" :
                                tenant.status === "suspended" ? "bg-red-500/10 text-red-500" :
                                "bg-amber-500/10 text-amber-500"
                              )}
                            >
                              {tenant.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border",
                            tenant.plan === "Enterprise" ? "bg-primary/10 text-primary border-primary/20 italic" : "bg-muted/50 text-muted-foreground border-border/50"
                          )}>
                            {tenant.plan}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs font-black uppercase tracking-tight text-muted-foreground">
                          {tenant.owners}
                        </TableCell>
                        <TableCell>
                           <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                 <Users className="h-3 w-3 text-primary" /> {tenant.userCount} Agents
                              </div>
                              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary italic">
                                 <CreditCard className="h-3 w-3" /> GHS {tenant.revenue.toLocaleString()}
                              </div>
                           </div>
                        </TableCell>
                        <TableCell className="px-10">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-muted group-hover:bg-card">
                                <MoreHorizontal className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64 p-3 rounded-2xl border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl">
                              <DropdownMenuItem className="gap-3 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer" onClick={() => setSelectedTenant(tenant)}>
                                 <Eye className="h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-3 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer">
                                 <ExternalLink className="h-4 w-4" /> Login as Shop
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="my-2 bg-border/50" />
                              {tenant.status === "active" ? (
                                <DropdownMenuItem 
                                  className="text-amber-500 gap-3 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:!bg-amber-500/10 hover:!text-amber-500"
                                  onClick={() => handleStatusChange(tenant.id, "suspended")}
                                >
                                   <ShieldAlert className="h-4 w-4" /> Suspend Shop
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem 
                                  className="text-green-500 gap-3 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:!bg-green-500/10 hover:!text-green-500"
                                  onClick={() => handleStatusChange(tenant.id, "active")}
                                >
                                   <ShieldCheck className="h-4 w-4" /> Activate Shop
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                className="text-red-500 gap-3 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:!bg-red-500/10 hover:!text-red-500"
                                onClick={() => setConfirmModal({ isOpen: true, tenantId: tenant.id, action: "delete" })}
                              >
                                 <Trash2 className="h-4 w-4" /> Delete Shop
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
          )}
          
          {/* Pagination */}
          <div className="p-10 border-t border-border/50 flex items-center justify-between">
             <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 italic">
                Showing {Math.min(filteredTenants.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filteredTenants.length, currentPage * itemsPerPage)} of {filteredTenants.length} Shops
             </p>
             <div className="flex items-center gap-2">
                <Button 
                   variant="outline" 
                   size="icon" 
                   className="h-10 w-10 rounded-xl"
                   onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                   disabled={currentPage === 1}
                >
                   <ChevronLeft className="h-4 w-4" />
                </Button>
                {[...Array(totalPages)].map((_, i) => (
                  <Button 
                    key={i}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    className={cn("h-10 w-10 rounded-xl font-black text-[10px]", currentPage === i + 1 ? "bg-primary" : "")}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button 
                   variant="outline" 
                   size="icon" 
                   className="h-10 w-10 rounded-xl"
                   onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                   disabled={currentPage === totalPages || totalPages === 0}
                >
                   <ChevronRight className="h-4 w-4" />
                </Button>
             </div>
          </div>

          {filteredTenants.length === 0 && (
            <div className="py-40 flex flex-col items-center justify-center text-muted-foreground opacity-20">
               <div className="h-24 w-24 rounded-full border-4 border-dashed border-muted-foreground flex items-center justify-center mb-8">
                  <Search className="h-10 w-10" />
               </div>
               <span className="text-[10px] font-black uppercase tracking-[0.4em]">No records found</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tenant Detail Sheet */}
      <Sheet open={!!selectedTenant} onOpenChange={(open) => !open && setSelectedTenant(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl bg-card border-border/50 p-0 flex flex-col overflow-hidden">
          {selectedTenant && (
            <>
              <SheetHeader className="p-10 border-b border-border/50 bg-muted/20">
                <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-16 w-16 rounded-2xl border-4 border-card shadow-2xl">
                      <AvatarFallback className="bg-primary text-white font-black italic uppercase text-lg">{selectedTenant.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                       <SheetTitle className="text-3xl font-black italic tracking-tighter uppercase leading-none mb-1">{selectedTenant.name}</SheetTitle>
                       <code className="text-[10px] font-black uppercase tracking-widest text-primary leading-none">SHOP_ID: {selectedTenant.slug}</code>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                   <Badge variant="outline" className={cn(
                      "font-black uppercase tracking-[0.2em] text-[9px] px-3 py-1 border-none",
                      selectedTenant.status === "active" ? "bg-green-500/10 text-green-500" :
                      selectedTenant.status === "suspended" ? "bg-red-500/10 text-red-500" :
                      "bg-amber-500/10 text-amber-500"
                   )}>
                      {selectedTenant.status}
                   </Badge>
                   <Badge variant="outline" className="font-black uppercase tracking-[0.2em] text-[9px] px-3 py-1 border-none bg-primary/10 text-primary">
                      {selectedTenant.plan}
                   </Badge>
                </div>
              </SheetHeader>
              
              <div className="flex-1 overflow-y-auto p-10 space-y-10">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 rounded-3xl bg-muted/30 border border-border/50">
                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">User Limit</p>
                       <h4 className="text-2xl font-black italic tracking-tighter uppercase leading-none mb-1">{selectedTenant.userCount}</h4>
                       <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Active Staff Accounts</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-muted/30 border border-border/50">
                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Total Revenue</p>
                       <h4 className="text-2xl font-black italic tracking-tighter uppercase leading-none mb-1">GHS {selectedTenant.revenue.toLocaleString()}</h4>
                       <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Total Transaction Vol</p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="flex items-center gap-2">
                       <div className="h-4 w-1 bg-primary rounded-full" />
                       <h5 className="text-[10px] font-black uppercase tracking-[0.2em]">Shop Information</h5>
                    </div>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center py-3 border-b border-border/30">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Owner Name</span>
                          <span className="text-xs font-black uppercase italic">{selectedTenant.owners}</span>
                       </div>
                       <div className="flex justify-between items-center py-3 border-b border-border/30">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Created On</span>
                          <span className="text-xs font-black uppercase italic">{selectedTenant.createdAt}</span>
                       </div>
                       <div className="flex justify-between items-center py-3 border-b border-border/30">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Connection Status</span>
                          <span className="text-xs font-black uppercase italic text-green-500">Fast (12ms)</span>
                       </div>
                    </div>
                 </div>

                 <div className="p-8 rounded-[32px] bg-red-500/5 border border-red-500/10 space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">Danger Zone</p>
                    <p className="text-xs font-bold text-muted-foreground leading-relaxed">Be careful with these actions. Deleting a shop will remove all its data permanently.</p>
                    <div className="pt-4 flex gap-3">
                       <Button variant="outline" className="flex-1 h-12 rounded-xl border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white font-black uppercase tracking-widest text-[9px]">
                          Suspend
                       </Button>
                       <Button 
                         variant="destructive" 
                         className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-[9px]"
                         onClick={() => setConfirmModal({ isOpen: true, tenantId: selectedTenant.id, action: "delete" })}
                       >
                          Delete Shop
                       </Button>
                    </div>
                 </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmAction 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, tenantId: null, action: "" })}
        onConfirm={handleDelete}
        title="Delete Shop Permanently?"
        description="This will permanently remove all shop data, including sales records and products. This action cannot be undone."
        confirmText="Delete Shop"
        variant="destructive"
      />

      {/* Add Shop Sheet */}
      <Sheet open={isAddShopOpen} onOpenChange={setIsAddShopOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-card border-border/50 p-0 flex flex-col">
           <SheetHeader className="p-8 border-b border-border/50">
              <SheetTitle className="text-3xl font-black italic tracking-tighter uppercase mb-1">Onboard New Shop</SheetTitle>
              <SheetDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                Initialize a new tenant node on the SME OS Network.
              </SheetDescription>
           </SheetHeader>
           
           <form onSubmit={handleCreateShop} className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="space-y-4">
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Shop Name</Label>
                    <Input 
                      required
                      placeholder="e.g. Accra Central Mart"
                      value={newShop.name}
                      onChange={e => setNewShop(prev => ({ ...prev, name: e.target.value }))}
                      className="h-14 rounded-2xl border-2 focus-visible:ring-primary font-bold px-6"
                    />
                 </div>
                 
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Owner / Primary Contact</Label>
                    <Input 
                      required
                      placeholder="e.g. Samuel Adjetey"
                      value={newShop.owner}
                      onChange={e => setNewShop(prev => ({ ...prev, owner: e.target.value }))}
                      className="h-14 rounded-2xl border-2 focus-visible:ring-primary font-bold px-6"
                    />
                 </div>

                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Initial Subscription Plan</Label>
                    <Select 
                      value={newShop.plan} 
                      onValueChange={(val: any) => setNewShop(prev => ({ ...prev, plan: val }))}
                    >
                      <SelectTrigger className="h-14 rounded-2xl border-2 font-bold px-6">
                        <SelectValue placeholder="Select Plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Starter">Starter (Free / Lite)</SelectItem>
                        <SelectItem value="Business">Business (Standard)</SelectItem>
                        <SelectItem value="Enterprise">Enterprise (Full Feature)</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>
              </div>

              <div className="pt-8 space-y-4">
                 <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10">
                    <div className="flex items-center gap-3 mb-2">
                       <CheckCircle2 className="h-4 w-4 text-primary" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-primary">Instant Activation</span>
                    </div>
                    <p className="text-[9px] text-muted-foreground leading-relaxed font-bold uppercase tracking-tight">
                       This shop will be activated immediately. Manual regional lead verification is currently disabled for your account.
                    </p>
                 </div>
                 
                 <Button type="submit" className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-xs gap-3 shadow-xl shadow-primary/20 bg-primary hover:translate-y-[-2px] transition-all">
                    Generate Shop Node <Plus className="h-4 w-4" />
                 </Button>
                 
                 <Button type="button" variant="ghost" onClick={() => setIsAddShopOpen(false)} className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Discard Draft
                 </Button>
              </div>
           </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
