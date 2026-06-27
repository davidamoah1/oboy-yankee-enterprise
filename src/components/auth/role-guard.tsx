import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { UserRole } from '@/types/auth';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, loading, authInitialized } = useAuth();
  const location = useLocation();

  if (!authInitialized || loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.status === 'suspended') {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-950 p-6 text-center">
        <div className="h-20 w-20 rounded-3xl bg-red-500/10 flex items-center justify-center mb-8 border border-red-500/20">
          <div className="h-10 w-10 text-red-500 font-black italic">!</div>
        </div>
        <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white mb-2">Account Suspended</h2>
        <p className="text-slate-400 font-bold text-sm max-w-md">Your access has been restricted by administration. Please contact your manager.</p>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/pos" replace />;
  }

  return <>{children}</>;
}
