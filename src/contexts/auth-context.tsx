import { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback, useRef } from 'react';
import { tokenStorage } from '@/lib/supabase';
import { UserProfile, UserRole, Company, Branch } from '@/types/auth';
import apiClient from '@/lib/api-client';

interface AuthContextType {
  user: UserProfile | null;
  profile: UserProfile | null;
  company: Company | null;
  tenant: Company | null;
  branches: Branch[];
  activeBranch: Branch | null;
  loading: boolean;
  authInitialized: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  permissions: string[];
  signIn: (email: string, password: string) => Promise<UserProfile>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setActiveBranchId: (branchId: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [activeBranchId, setActiveBranchIdState] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const mountedRef = useRef(true);

  const fetchProfile = useCallback(async () => {
    if (!tokenStorage.hasTokens()) {
      setUser(null);
      setCompany(null);
      setPermissions([]);
      setLoading(false);
      setAuthInitialized(true);
      return;
    }

    try {
      const response = await apiClient.get('/api/auth/me');
      const userData = response.data;

      const profile: UserProfile = {
        id: userData.id,
        email: userData.email,
        fullName: userData.fullName,
        avatarUrl: userData.avatarUrl,
        phone: userData.phone,
        role: userData.role as UserRole,
        customRoleId: userData.customRoleId || null,
        status: userData.status,
        companyId: userData.companyId,
        branchId: userData.branchId || null,
        lastLoginAt: userData.lastLoginAt || null,
        createdAt: userData.createdAt,
      };

      // Fetch branches for this company
      let branchList: Branch[] = [];
      try {
        const branchRes = await apiClient.get('/api/branches');
        branchList = branchRes.data;
      } catch (e) {
        console.warn('[AuthContext] Failed to fetch branches:', e);
      }

      if (mountedRef.current) {
        setUser(profile);
        setCompany(userData.company || null);
        setBranches(branchList);
        const storedBranchId = localStorage.getItem('activeBranchId');
        const isAdmin = profile.role === UserRole.SUPER_ADMIN || profile.role === UserRole.COMPANY_ADMIN;
        if (storedBranchId && (isAdmin || storedBranchId === profile.branchId)) {
          setActiveBranchIdState(storedBranchId);
        } else {
          setActiveBranchIdState(profile.branchId);
        }
        setPermissions(userData.permissions || []);
        tokenStorage.cacheUser(profile);
      }
    } catch (err) {
      console.warn('[AuthContext] Failed to fetch profile:', err);
      tokenStorage.clearTokens();
      if (mountedRef.current) {
        setUser(null);
        setCompany(null);
        setBranches([]);
        setActiveBranchIdState(null);
        setPermissions([]);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setAuthInitialized(true);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    // Seed from cached user instantly to prevent flash
    const cachedUser = tokenStorage.getCachedUser();
    if (cachedUser && tokenStorage.hasTokens()) {
      setUser(cachedUser);
      setLoading(false);
      setAuthInitialized(true);
      // Refresh in background
      fetchProfile();
    } else if (tokenStorage.hasTokens()) {
      fetchProfile();
    } else {
      setLoading(false);
      setAuthInitialized(true);
    }

    return () => {
      mountedRef.current = false;
    };
  }, [fetchProfile]);

  const signIn = useCallback(async (email: string, password: string): Promise<UserProfile> => {
    const response = await apiClient.post('/api/auth/login', { email, password });
    const { accessToken, refreshToken, user: userData } = response.data;

    tokenStorage.setTokens(accessToken, refreshToken);

    const profile: UserProfile = {
      id: userData.id,
      email: userData.email,
      fullName: userData.fullName,
      avatarUrl: userData.avatarUrl,
      phone: userData.phone,
      role: userData.role as UserRole,
      customRoleId: userData.customRoleId || null,
      status: userData.status,
      companyId: userData.companyId,
      branchId: userData.branchId || null,
      lastLoginAt: userData.lastLoginAt || null,
      createdAt: userData.createdAt,
    };

    setUser(profile);
    setCompany(userData.company || null);
    setPermissions(userData.permissions || []);
    setActiveBranchIdState(userData.branchId || null);
    tokenStorage.cacheUser(profile);

    // Fetch branches in background
    apiClient.get('/api/branches').then((res) => {
      if (mountedRef.current) setBranches(res.data);
    }).catch(() => {});

    return profile;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await apiClient.post('/api/auth/logout').catch(() => {});
    } finally {
      tokenStorage.clearTokens();
      localStorage.removeItem('activeBranchId');
      setUser(null);
      setCompany(null);
      setBranches([]);
      setActiveBranchIdState(null);
      setPermissions([]);
      window.location.href = '/login';
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  const isAuthenticated = useMemo(() => !!user && tokenStorage.hasTokens(), [user]);

  const activeBranch = useMemo(() => {
    if (!activeBranchId || branches.length === 0) return null;
    return branches.find(b => b.id === activeBranchId) || null;
  }, [activeBranchId, branches]);

  const setActiveBranchId = useCallback((branchId: string | null) => {
    if (branchId) {
      localStorage.setItem('activeBranchId', branchId);
    } else {
      localStorage.removeItem('activeBranchId');
    }
    setActiveBranchIdState(branchId);
  }, []);

  const value = useMemo(() => ({
    user,
    profile: user,
    company,
    tenant: company,
    branches,
    activeBranch,
    loading,
    authInitialized,
    isAuthenticated,
    isSuperAdmin: user?.role === UserRole.SUPER_ADMIN,
    permissions,
    signIn,
    signOut,
    refreshProfile,
    setActiveBranchId,
  }), [user, company, branches, activeBranch, loading, authInitialized, isAuthenticated, permissions, signIn, signOut, refreshProfile, setActiveBranchId]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
