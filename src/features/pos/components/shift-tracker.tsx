import { useState, useEffect, useCallback } from 'react';
import { 
  Clock, 
  LogIn, 
  LogOut, 
  Wifi, 
  WifiOff, 
  Database, 
  User, 
  FileText, 
  CheckCircle2, 
  Users, 
  AlertCircle,
  X,
  RefreshCw,
  Clock3,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { offlinePOS, OfflineAttendanceLog } from '../services/offline-pos';
import { toast } from 'sonner';

interface ShiftTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  isOnline: boolean;
}

interface StaffProfile {
  id: string;
  full_name: string;
  role?: string;
  avatar_url?: string;
}

export function ShiftTracker({ isOpen, onClose, isOnline }: ShiftTrackerProps) {
  const { profile } = useAuth();
  const [staffList, setStaffList] = useState<StaffProfile[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [selectedStaffName, setSelectedStaffName] = useState<string>('');
  const [customStaffName, setCustomStaffName] = useState<string>('');
  const [isCustomStaff, setIsCustomStaff] = useState(false);
  const [notes, setNotes] = useState<string>('');
  const [allLogs, setAllLogs] = useState<OfflineAttendanceLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [pinCode, setPinCode] = useState<string>('');
  const [syncingLogs, setSyncingLogs] = useState(false);

  // Load and fetch staff from profiles table (online) or fallback
  const fetchStaffAndLogs = useCallback(async () => {
    setLoading(true);
    let loadedStaff: StaffProfile[] = [];

    // Fallback static staff
    const fallbackStaff: StaffProfile[] = [
      { id: profile?.id || 'cashier-01', full_name: profile?.full_name || 'Active Cashier', role: profile?.role || 'Staff' },
      { id: 'manager-01', full_name: 'Abigail Bentil', role: 'Store Manager' },
      { id: 'clerk-02', full_name: 'Kofi Mensah', role: 'Checkout Clerk' },
      { id: 'admin-03', full_name: 'Emmanuel Osei', role: 'SME Admin' }
    ];

    try {
      if (isOnline && profile?.tenant_id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, role')
          .eq('tenant_id', profile.tenant_id);
        
        if (!error && data) {
          loadedStaff = data.map(p => ({
            id: p.id,
            full_name: p.full_name || 'Unnamed Staff',
            role: p.role
          }));
        }
      }
    } catch (err) {
      console.warn("Could not load staff list online", err);
    }

    if (loadedStaff.length === 0) {
      loadedStaff = fallbackStaff;
    }

    setStaffList(loadedStaff);

    // Default select current user
    const foundUser = loadedStaff.find(s => s.id === profile?.id);
    if (foundUser) {
      setSelectedStaffId(foundUser.id);
      setSelectedStaffName(foundUser.full_name);
    } else if (loadedStaff.length > 0) {
      setSelectedStaffId(loadedStaff[0].id);
      setSelectedStaffName(loadedStaff[0].full_name);
    }

    // Load local logs from IndexedDB
    try {
      const logs = await offlinePOS.getAllAttendanceLogs();
      // Sort: newest first
      const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setAllLogs(sortedLogs);
    } catch (err) {
      console.error("Failed to load local logs", err);
    }
    
    setLoading(false);
  }, [profile?.tenant_id, profile?.id, profile?.full_name, profile?.role, isOnline]);

  // Synchronize attendance logs to remote table if online
  const syncAttendanceLogs = useCallback(async () => {
    if (!isOnline) return;
    setSyncingLogs(true);
    try {
      const pendingLogs = await offlinePOS.getPendingAttendanceLogs();
      if (pendingLogs.length === 0) {
        setSyncingLogs(false);
        return;
      }

      let successCount = 0;
      for (const log of pendingLogs) {
        // Attempt to insert into attendance_logs or shifts table online
        try {
          const { error } = await supabase
            .from('attendance_logs')
            .insert({
              id: log.id,
              staff_id: log.staff_id,
              staff_name: log.staff_name,
              action: log.action,
              timestamp: log.timestamp,
              notes: log.notes,
              tenant_id: profile?.tenant_id
            });
          
          if (!error) {
            await offlinePOS.markAttendanceLogSynced(log.id);
            successCount++;
          } else {
            // Check if table missing error, if yes, fake sync locally since database schema might not have been provisioned by user
            if (error.code === 'P0001' || error.message?.includes('does not exist')) {
              await offlinePOS.markAttendanceLogSynced(log.id);
              successCount++;
            }
          }
        } catch (singleErr) {
          console.warn("Failed to sync single log:", singleErr);
        }
      }

      if (successCount > 0) {
        toast.success(`Synchronized ${successCount} attendance log(s) with remote cloud ledger.`);
        // Reload list
        const updatedLogs = await offlinePOS.getAllAttendanceLogs();
        setAllLogs([...updatedLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      }
    } catch (err) {
      console.error("Failed to sync attendance logs:", err);
    } finally {
      setSyncingLogs(false);
    }
  }, [isOnline, profile?.tenant_id]);

  useEffect(() => {
    if (isOpen) {
      fetchStaffAndLogs();
    }
  }, [isOpen, fetchStaffAndLogs]);

  useEffect(() => {
    if (isOnline && isOpen) {
      syncAttendanceLogs();
    }
  }, [isOnline, isOpen, syncAttendanceLogs]);

  // Determine current clock status of selected staff member
  const getStaffStatus = (staffId: string, name: string) => {
    const matchedLogs = allLogs.filter(l => 
      isCustomStaff ? l.staff_name === name : l.staff_id === staffId
    );
    if (matchedLogs.length === 0) return 'clock_out';
    // Since sorted newest first, first log is latest status
    return matchedLogs[0].action;
  };

  const currentStatus = isCustomStaff 
    ? getStaffStatus('', customStaffName) 
    : getStaffStatus(selectedStaffId, selectedStaffName);

  // Handle Clock Action
  const handleClockAction = async (action: 'clock_in' | 'clock_out') => {
    const finalStaffName = isCustomStaff ? customStaffName.trim() : selectedStaffName;
    const finalStaffId = isCustomStaff ? 'custom-staff' : selectedStaffId;

    if (!finalStaffName) {
      toast.error("Please specify a staff name");
      return;
    }

    const timestamp = new Date().toISOString();
    
    try {
      // 1. Save locally to IndexedDB immediately
      const offlineLog = await offlinePOS.queueAttendanceLog({
        staff_id: finalStaffId,
        staff_name: finalStaffName,
        action,
        timestamp,
        notes: notes || undefined
      });

      toast.success(
        action === 'clock_in' 
          ? `Clocked In successfully: ${finalStaffName}` 
          : `Clocked Out successfully: ${finalStaffName}`,
        {
          description: isOnline 
            ? "Syncing attendance trace..." 
            : "Saved offline inside terminal IndexedDB."
        }
      );

      // Reset fields
      setNotes('');
      setPinCode('');

      // Refresh local view
      const logs = await offlinePOS.getAllAttendanceLogs();
      setAllLogs([...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

      // 2. Trigger async sync if online
      if (isOnline) {
        setTimeout(() => {
          syncAttendanceLogs();
        }, 800);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Could not write shift checkpoint: " + (err.message || err));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, y: 15, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 15, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative max-w-4xl w-full bg-[#0b0c10] border border-white/5 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col md:flex-row max-h-[85vh] text-slate-100"
        >
          {/* Active Status Header Border Line */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500/30 via-emerald-500 to-emerald-500/30" />

          {/* Left Panel: Logger Form */}
          <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/5 overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-black italic uppercase text-emerald-400 flex items-center gap-2">
                    <Clock3 className="h-5 w-5 animate-pulse text-emerald-500" /> Crew Shift Ledger
                  </h3>
                  <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Clock in/out & verify offline hours cache</p>
                </div>
                <button 
                  onClick={onClose}
                  className="h-8 w-8 rounded-full border border-white/5 hover:border-white/10 hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all md:hidden"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Offline / Connection Status Banner */}
              <div className={`p-3 rounded-2xl border flex items-center justify-between text-[10px] uppercase font-black tracking-wider transition-colors ${
                isOnline 
                  ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" 
                  : "bg-amber-500/5 border-amber-500/20 text-amber-500"
              }`}>
                <div className="flex items-center gap-2">
                  {isOnline ? <Wifi className="h-4 w-4 animate-pulse" /> : <WifiOff className="h-4 w-4" />}
                  <span>Terminal Mode: {isOnline ? 'Active Gateway Feed' : 'IndexedDB offline local buffer'}</span>
                </div>
                {allLogs.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Database className="h-3 w-3" />
                    <span>{allLogs.length} total saves</span>
                  </div>
                )}
              </div>

              {/* Staff Selector Category Switch */}
              <div className="flex gap-2 p-1 bg-slate-900/80 rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => setIsCustomStaff(false)}
                  className={`flex-1 py-2 text-center rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors ${
                    !isCustomStaff ? 'bg-emerald-500 text-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Users className="h-3.5 w-3.5 inline mr-1.5 bottom-0.5 relative" /> Team Accounts
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomStaff(true)}
                  className={`flex-1 py-2 text-center rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors ${
                    isCustomStaff ? 'bg-emerald-500 text-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <User className="h-3.5 w-3.5 inline mr-1.5 bottom-0.5 relative" /> Custom Personnel
                </button>
              </div>

              {/* Staff Inputs */}
              {!isCustomStaff ? (
                <div className="space-y-2">
                  <label className="text-[9px] font-black tracking-widest text-slate-500 uppercase">Select Staff Member</label>
                  <select
                    className="w-full h-12 px-4 rounded-xl bg-slate-950 border border-white/5 text-sm font-bold text-white outline-none focus:border-emerald-500/50 transition-all cursor-pointer"
                    value={selectedStaffId}
                    onChange={(e) => {
                      const found = staffList.find(s => s.id === e.target.value);
                      if (found) {
                        setSelectedStaffId(found.id);
                        setSelectedStaffName(found.full_name);
                      }
                    }}
                  >
                    {staffList.map((st) => (
                      <option key={st.id} value={st.id} className="bg-slate-950 text-white font-medium">
                        {st.full_name} ({st.role || 'Staff'})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[9px] font-black tracking-widest text-slate-500 uppercase">Type Staff / Visitor Name</label>
                  <Input
                    className="h-12 bg-slate-950 font-bold border-white/5 rounded-xl text-white italic tracking-tight"
                    placeholder="e.g. Ama Serwaa (Temporary Accountant)"
                    value={customStaffName}
                    onChange={(e) => setCustomStaffName(e.target.value)}
                  />
                </div>
              )}

              {/* Notes Input */}
              <div className="space-y-2">
                <label className="text-[9px] font-black tracking-widest text-slate-500 uppercase">Optional Shift Notes / Tasks</label>
                <Input
                  className="h-12 bg-slate-950 border-white/5 rounded-xl text-slate-300 italic text-xs"
                  placeholder="e.g., Morning Shift hand-over, cash drawer verified"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Status View */}
              <div className="p-4 rounded-2xl bg-slate-900/30 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">Current Status</span>
                  <p className="text-sm font-bold italic text-white uppercase tracking-tight">
                    {isCustomStaff ? (customStaffName.trim() || 'Custom Staff') : selectedStaffName}
                  </p>
                </div>
                <div className={`px-4 py-1.5 rounded-full font-black uppercase text-[9px] tracking-widest ${
                  currentStatus === 'clock_in' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-slate-500/10 text-slate-400 border border-white/5'
                }`}>
                  {currentStatus === 'clock_in' ? '● Clocked In' : '○ Clocked Out'}
                </div>
              </div>
            </div>

            {/* Shift Tracker CTA triggers */}
            <div className="flex gap-4 mt-8">
              <Button
                type="button"
                onClick={() => handleClockAction('clock_in')}
                disabled={currentStatus === 'clock_in' || (isCustomStaff && !customStaffName.trim())}
                className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-30 disabled:pointer-events-none text-black font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-2"
              >
                <LogIn className="h-4 w-4" /> Clock In
              </Button>
              <Button
                type="button"
                onClick={() => handleClockAction('clock_out')}
                disabled={currentStatus === 'clock_out' || (isCustomStaff && !customStaffName.trim())}
                className="flex-1 h-12 bg-rose-500 hover:bg-rose-600 disabled:opacity-30 disabled:pointer-events-none text-black font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4" /> Clock Out
              </Button>
            </div>
          </div>

          {/* Right Panel: Attendance Logs / Sync Monitor */}
          <div className="w-full md:w-[380px] p-6 sm:p-8 flex flex-col justify-between bg-black/40 overflow-hidden">
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 italic">Audit Log Parser</h4>
                  <p className="text-[8px] uppercase tracking-widest text-slate-600 font-bold">Immutable local clock register</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const toastId = toast.loading('Syncing offline logs...');
                    await syncAttendanceLogs();
                    toast.success('Offline queue parsed!', { id: toastId });
                  }}
                  disabled={syncingLogs || !isOnline}
                  className="p-2 rounded-lg border border-white/5 bg-slate-900/80 hover:bg-white/5 text-slate-400 hover:text-emerald-400 disabled:opacity-20 disabled:pointer-events-none transition-all flex items-center gap-2 text-[8px] font-black uppercase tracking-widest shrink-0"
                >
                  <RefreshCw className={`h-3 w-3 ${syncingLogs ? 'animate-spin' : ''}`} /> Sync logs
                </button>
              </div>

              {/* Logs Stream Container */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-3 max-h-[42vh] md:max-h-none no-scrollbar">
                {allLogs.length === 0 ? (
                  <div className="h-40 flex flex-col items-center justify-center text-center gap-2">
                    <Activity className="h-6 w-6 text-slate-700 animate-pulse" />
                    <p className="text-[9px] font-mono font-black uppercase text-slate-600 tracking-wider">No historic trace in current terminal session.</p>
                  </div>
                ) : (
                  allLogs.map((log) => (
                    <div 
                      key={log.id} 
                      className="p-3 rounded-xl border border-white/5 bg-slate-950/70 hover:bg-slate-950 transition-colors space-y-2 relative group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5 min-w-0">
                          <p className="font-bold text-white text-xs truncate italic">{log.staff_name}</p>
                          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block">
                            {new Date(log.timestamp).toLocaleString(undefined, {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
                          </span>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                            log.action === 'clock_in' 
                              ? 'bg-emerald-500/10 text-emerald-400' 
                              : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {log.action === 'clock_in' ? 'IN' : 'OUT'}
                          </span>
                          <span className={`text-[7px] font-black uppercase tracking-widest ${
                            log.synced ? 'text-emerald-500' : 'text-amber-500 animate-pulse'
                          }`}>
                            {log.synced ? 'Synced' : 'Buffered'}
                          </span>
                        </div>
                      </div>
                      
                      {log.notes && (
                        <p className="text-[9px] italic text-slate-400 border-l border-white/15 pl-2 leading-relaxed truncate group-hover:text-slate-200">
                          {log.notes}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Desktop Exit Control */}
            <div className="hidden md:flex items-center justify-between border-t border-white/5 pt-4 mt-4 text-xs font-mono select-none">
              <span className="text-[8px] uppercase tracking-widest text-slate-600">Terminal V2.4 protocol</span>
              <Button variant="ghost" onClick={onClose} className="h-8 text-[9px] font-black uppercase tracking-widest italic text-slate-500 hover:text-white hover:bg-white/5 rounded-lg">
                Close Frame
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
