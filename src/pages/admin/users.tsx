import { useState, useMemo } from "react";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  UserX, 
  UserCheck, 
  Shield, 
  Trash2, 
  Mail,
  UserCog,
  ArrowUpDown,
  Download,
  Fingerprint,
  Activity,
  ShieldAlert,
  Zap,
  ChevronLeft,
  ChevronRight,
  Eye,
  Building2
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
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { User, UserRole, UserStatus } from "@/types/super-admin";

const INITIAL_USERS: User[] = [
  { id: "1", name: "Kofi Mensah", email: "kofi@accramart.com", role: "tenant_admin", status: "active", tenant: "Accra Mart", lastLogin: "2024-05-11 08:30", createdAt: "2024-01-15" },
  { id: "2", name: "Ama Serwaa", email: "ama@kumasi.com", role: "tenant_admin", status: "active", tenant: "Kumasi Elec", lastLogin: "2024-05-10 14:20", createdAt: "2024-02-10" },
  { id: "3", name: "Ibrahim Ali", email: "ibrahim@tamale.com", role: "tenant_admin", status: "blocked", tenant: "Tamale Fashion", lastLogin: "2024-04-15 11:00", createdAt: "2024-03-05" },
  { id: "4", name: "Samuel Osei", email: "samuel@internal.os", role: "super_admin", status: "active", tenant: "SME OS Platform", lastLogin: "2024-05-11 10:15", createdAt: "2023-12-01" },
  { id: "5", name: "Yaa Prah", email: "yaa@accramart.com", role: "staff", status: "active", tenant: "Accra Mart", lastLogin: "2024-05-11 09:00", createdAt: "2024-04-01" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; userId: string | null; action: string }>({ 
    isOpen: false, 
    userId: null, 
    action: "" 
  });

  const handleStatusChange = (id: string, newStatus: UserStatus) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
    toast.success(`User access ${newStatus === "active" ? "restored" : "revoked"} successfully`);
  };

  const handleRoleChange = (id: string, newRole: UserRole) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
    toast.success(`User role elevated to ${newRole.replace('_', ' ')}`);
  };

  const handleDelete = () => {
    if (confirmModal.userId) {
      setUsers(prev => prev.filter(u => u.id !== confirmModal.userId));
      toast.success("User deleted successfully");
      setConfirmModal({ isOpen: false, userId: null, action: "" });
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                          u.email.toLowerCase().includes(search.toLowerCase()) ||
                          u.tenant.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const matchStatus = statusFilter === 'all' || u.status === statusFilter;
      
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 bg-slate-900/40 backdrop-blur-xl p-10 rounded-[40px] border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Fingerprint className="h-32 w-32 rotate-12 text-primary" />
        </div>
        <div className="space-y-3 relative z-10">
           <div className="flex items-center gap-3 mb-2">
              <div className="h-6 w-1 bg-primary rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">User Directory</span>
           </div>
           <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none text-slate-100">System Users</h1>
           <p className="text-slate-500 font-bold text-sm max-w-lg">Manage everyone from shop owners to staff across the platform.</p>
        </div>
        <div className="relative z-10 w-full lg:w-auto flex flex-col sm:flex-row gap-4">
            <Button 
              variant="outline" 
              onClick={() => toast.info("Compiling global user directory (.csv)")}
              className="w-full sm:w-auto h-14 px-8 rounded-2xl border-white/10 font-black uppercase tracking-widest text-[10px] gap-3 bg-white/5 hover:bg-white/10 transition-all text-slate-300"
            >
               <Download className="h-4 w-4" /> Download User List
            </Button>
            <Button 
              onClick={() => toast.info("Direct user injection requires system root authority.")}
              className="w-full sm:w-auto h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all text-white border-none"
            >
               <UserCog className="h-4 w-4" /> Add New User
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: "Active Users", val: users.filter(u => u.status === 'active').length.toString(), color: "text-green-500", icon: Activity },
           { label: "Admins", val: users.filter(u => u.role === 'super_admin').length.toString(), color: "text-primary", icon: Shield },
           { label: "Blocked Users", val: users.filter(u => u.status === 'blocked').length.toString(), color: "text-red-500", icon: ShieldAlert },
           { label: "Online Now", val: "420", color: "text-blue-500", icon: Zap },
         ].map((stat, i) => (
           <Card key={i} className="border-none shadow-2xl bg-slate-900/40 backdrop-blur-xl rounded-[30px] border border-white/5 group hover:border-primary/20 transition-all overflow-hidden relative">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                <stat.icon className="h-12 w-12" />
             </div>
             <CardHeader className="pb-6">
                <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">{stat.label}</CardDescription>
                <CardTitle className={cn("text-3xl font-black italic tracking-tighter uppercase leading-none mt-1", stat.color)}>{stat.val}</CardTitle>
             </CardHeader>
           </Card>
         ))}
      </div>

      <Card className="border-none shadow-2xl bg-slate-900/40 backdrop-blur-xl rounded-[40px] border border-white/5 overflow-hidden">
        <CardHeader className="p-8 border-b border-white/5 bg-slate-900/20">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
              <Input 
                placeholder="Search by name, shop, or role..." 
                className="h-12 pl-12 bg-black/40 border-white/5 text-slate-200 placeholder:text-slate-700 font-bold italic tracking-wide rounded-2xl focus-visible:ring-primary/20"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-12 px-6 rounded-2xl border-white/10 font-bold text-[10px] uppercase tracking-widest gap-3 bg-white/5 hover:bg-white/10 transition-all text-slate-400">
                      <Filter className="h-4 w-4" /> {roleFilter === 'all' ? 'Filter Role' : roleFilter.replace('_', ' ').toUpperCase()}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-slate-900 border-white/5 text-slate-200">
                    <DropdownMenuItem onClick={() => setRoleFilter('all')}>All Roles</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRoleFilter('super_admin')}>Super Admin</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRoleFilter('tenant_admin')}>Tenant Admin</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRoleFilter('staff')}>Staff</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRoleFilter('customer')}>Customer</DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>

               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-12 px-6 rounded-2xl border-white/10 font-bold text-[10px] uppercase tracking-widest gap-3 bg-white/5 hover:bg-white/10 transition-all text-slate-400">
                      <ShieldAlert className="h-4 w-4" /> {statusFilter === 'all' ? 'Filter Status' : statusFilter.toUpperCase()}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-slate-900 border-white/5 text-slate-200">
                    <DropdownMenuItem onClick={() => setStatusFilter('all')}>All Statuses</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('active')} className="text-green-500">Active</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('blocked')} className="text-red-500">Blocked</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('pending')} className="text-amber-500">Pending</DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white/[0.02] border-b border-white/5">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="h-14 px-8 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 whitespace-nowrap">User</TableHead>
                  <TableHead className="h-14 px-8 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500">Role</TableHead>
                  <TableHead className="h-14 px-8 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 whitespace-nowrap">Shop</TableHead>
                  <TableHead className="h-14 px-8 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 text-center">Status</TableHead>
                  <TableHead className="h-14 px-8 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 text-right">Last Active</TableHead>
                  <TableHead className="h-14 w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {paginatedUsers.map((user, i) => (
                    <motion.tr 
                      key={user.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-white/5 last:border-none group hover:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() => setSelectedUser(user)}
                    >
                      <TableCell className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10 border-2 border-white/10 group-hover:border-primary transition-all rounded-xl">
                            <AvatarFallback className="bg-primary/10 text-primary font-black text-xs rounded-xl italic">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="font-black italic text-slate-100 uppercase tracking-tight truncate">{user.name}</span>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">{user.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-8 py-6">
                        <Badge 
                          variant="secondary" 
                          className="font-black uppercase tracking-widest text-[9px] px-3 h-5 rounded-full bg-white/5 text-slate-400 border-none italic"
                        >
                          {user.role.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-8 py-6">
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest italic">{user.tenant}</span>
                      </TableCell>
                      <TableCell className="px-8 py-6 text-center">
                         <div className="flex items-center justify-center gap-2">
                            <div className={cn(
                              "h-1.5 w-1.5 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.3)]",
                              user.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-red-500 shadow-red-500/30'
                            )} />
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-widest italic",
                              user.status === 'active' ? 'text-green-500' : 'text-red-500'
                            )}>{user.status}</span>
                         </div>
                      </TableCell>
                      <TableCell className="px-8 py-6 text-right font-mono text-[10px] text-slate-600 font-black italic tracking-widest uppercase">
                        {user.lastLogin}
                      </TableCell>
                      <TableCell className="px-8 py-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 group-hover:scale-110 transition-transform" onClick={(e) => e.stopPropagation()}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                           <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl bg-slate-900 border-white/5 backdrop-blur-xl">
                            <DropdownMenuLabel className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-500 p-3">User Actions</DropdownMenuLabel>
                            <DropdownMenuItem className="gap-3 h-11 rounded-xl font-black uppercase tracking-widest text-[10px] focus:bg-primary focus:text-white transition-all" onClick={() => setSelectedUser(user)}>
                               <Eye className="h-4 w-4" /> View User Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-3 h-11 rounded-xl font-black uppercase tracking-widest text-[10px] focus:bg-primary focus:text-white transition-all">
                               <Mail className="h-4 w-4" /> Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-3 h-11 rounded-xl font-black uppercase tracking-widest text-[10px] focus:bg-primary focus:text-white transition-all">
                               <UserCog className="h-4 w-4" /> Change Permissions
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/5" />
                            {user.status === "active" ? (
                              <DropdownMenuItem 
                                className="text-amber-500 gap-3 h-11 rounded-xl font-black uppercase tracking-widest text-[10px] focus:bg-amber-600 focus:text-white transition-all"
                                onClick={() => handleStatusChange(user.id, "blocked")}
                              >
                                 <UserX className="h-4 w-4" /> Block User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                className="text-green-500 gap-3 h-11 rounded-xl font-black uppercase tracking-widest text-[10px] focus:bg-green-600 focus:text-white transition-all"
                                onClick={() => handleStatusChange(user.id, "active")}
                              >
                                 <UserCheck className="h-4 w-4" /> Unblock User
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              className="text-red-500 gap-3 h-11 rounded-xl font-black uppercase tracking-widest text-[10px] focus:bg-red-600 focus:text-white transition-all"
                              onClick={() => { setConfirmModal({ isOpen: true, userId: user.id, action: "delete" }); }}
                            >
                               <Trash2 className="h-4 w-4" /> Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                Showing {Math.min(filteredUsers.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filteredUsers.length, currentPage * itemsPerPage)} of {filteredUsers.length} Users
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
                {[...Array(totalPages)].map((_, i) => (
                  <Button 
                    key={i}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    className={cn("h-10 w-10 rounded-xl font-black text-[10px] border-white/5", currentPage === i + 1 ? "bg-primary" : "bg-white/5")}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
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

      {/* User Detail Sheet */}
      <Sheet open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl bg-slate-950 border-white/5 p-0 flex flex-col overflow-hidden">
          {selectedUser && (
            <>
              <SheetHeader className="p-10 border-b border-white/5 bg-slate-900/40">
                <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-16 w-16 rounded-2xl border-4 border-slate-900 shadow-2xl">
                      <AvatarFallback className="bg-primary text-white font-black italic uppercase text-lg">
                        {selectedUser.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                       <SheetTitle className="text-3xl font-black italic tracking-tighter uppercase leading-none mb-1 text-slate-100">{selectedUser.name}</SheetTitle>
                       <code className="text-[10px] font-black uppercase tracking-widest text-primary leading-none">USER_ID: {selectedUser.id}</code>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                   <Badge variant="outline" className={cn(
                      "font-black uppercase tracking-[0.2em] text-[9px] px-3 h-5 border-none",
                      selectedUser.status === "active" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                   )}>
                      {selectedUser.status}
                   </Badge>
                   <Badge variant="outline" className="font-black uppercase tracking-[0.2em] text-[9px] px-3 h-5 border-none bg-primary/10 text-primary italic">
                      {selectedUser.role.replace('_', ' ')}
                   </Badge>
                </div>
              </SheetHeader>
              
              <div className="flex-1 overflow-y-auto p-10 space-y-10">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Last Logged In</p>
                       <h4 className="text-lg font-black italic tracking-tighter uppercase leading-none mb-1 text-slate-200">{selectedUser.lastLogin}</h4>
                       <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Date & Time</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Joined On</p>
                       <h4 className="text-lg font-black italic tracking-tighter uppercase leading-none mb-1 text-slate-200">{selectedUser.createdAt}</h4>
                       <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Date</p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="flex items-center gap-2">
                       <div className="h-4 w-1 bg-primary rounded-full" />
                       <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">User Information</h5>
                    </div>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center py-3 border-b border-white/5">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Email Address</span>
                          <span className="text-xs font-black uppercase italic text-slate-300">{selectedUser.email}</span>
                       </div>
                       <div className="flex justify-between items-center py-3 border-b border-white/5">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Belongs To</span>
                          <div className="flex items-center gap-2 text-primary font-black uppercase italic text-xs">
                             <Building2 className="h-3 w-3" /> {selectedUser.tenant}
                          </div>
                       </div>
                       <div className="flex justify-between items-center py-3 border-b border-white/5">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status</span>
                          <span className="text-[10px] font-black uppercase italic text-green-500">Online Now</span>
                       </div>
                    </div>
                 </div>

                 <div className="p-8 rounded-[32px] bg-red-500/5 border border-red-500/10 space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">Security Control</p>
                    <p className="text-xs font-bold text-slate-500 leading-relaxed italic">Change user access or delete their account permanently. These commands have immediate effect.</p>
                    <div className="pt-4 flex flex-col gap-3">
                       <Button variant="outline" className="w-full h-12 rounded-xl border-white/5 bg-white/5 hover:bg-primary hover:text-white font-black uppercase tracking-widest text-[9px] text-slate-300">
                          Make Shop Owner
                       </Button>
                       <div className="flex gap-3">
                          <Button 
                            variant="outline" 
                            className="flex-1 h-12 rounded-xl border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white font-black uppercase tracking-widest text-[9px]"
                            onClick={() => handleStatusChange(selectedUser.id, selectedUser.status === 'active' ? 'blocked' : 'active')}
                          >
                             {selectedUser.status === 'active' ? 'Block User' : 'Unblock User'}
                          </Button>
                          <Button 
                            variant="destructive" 
                            className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-[9px]"
                            onClick={() => setConfirmModal({ isOpen: true, userId: selectedUser.id, action: "delete" })}
                          >
                             Delete User
                          </Button>
                       </div>
                    </div>
                 </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmAction 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, userId: null, action: "" })}
        onConfirm={handleDelete}
        title="Delete User Permanently?"
        description="This will remove the user from the system. They will lose access to all shops and data immediately."
        confirmText="Delete User"
        variant="destructive"
      />
    </div>
  );
}
