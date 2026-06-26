import { Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

export function AppLayout() {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
      <Toaster position="top-right" richColors />
    </TooltipProvider>
  );
}
