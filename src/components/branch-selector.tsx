import { Store, ChevronDown, Check } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { UserRole } from '@/types/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function BranchSelector() {
  const { user, branches, activeBranch, setActiveBranchId } = useAuth();

  if (!user) return null;

  const isAdmin = user.role === UserRole.SUPER_ADMIN || user.role === UserRole.COMPANY_ADMIN;
  const visibleBranches = isAdmin ? branches : branches.filter(b => b.id === user.branchId);

  if (visibleBranches.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-11 px-3 rounded-2xl bg-muted/40 border border-border hover:bg-muted/80 transition-all shrink-0 gap-2 font-bold text-sm"
        >
          <Store className="h-4 w-4 text-indigo-500" />
          <span className="hidden sm:inline truncate max-w-[120px]">
            {activeBranch?.name || 'All Branches'}
          </span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 p-2 rounded-2xl shadow-2xl border-border bg-card/95 backdrop-blur-xl">
        <DropdownMenuLabel className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/50 px-3 py-2">
          Select Branch
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        {isAdmin && (
          <DropdownMenuItem
            className="p-3 rounded-xl cursor-pointer font-bold gap-3 focus:bg-indigo-500 focus:text-white"
            onClick={() => setActiveBranchId(null)}
          >
            <Store className="h-4 w-4" />
            <span className="flex-1">All Branches</span>
            {!activeBranch && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        )}
        {visibleBranches.map((branch) => (
          <DropdownMenuItem
            key={branch.id}
            className={cn(
              "p-3 rounded-xl cursor-pointer font-bold gap-3 focus:bg-indigo-500 focus:text-white",
              !branch.isActive && "opacity-50"
            )}
            onClick={() => setActiveBranchId(branch.id)}
          >
            <Store className="h-4 w-4" />
            <div className="flex-1 flex flex-col">
              <span className="text-sm">{branch.name}</span>
              {branch.code && (
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{branch.code}</span>
              )}
            </div>
            {activeBranch?.id === branch.id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
