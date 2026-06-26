import { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback, useRef } from 'react';
import { tokenStorage } from '@/lib/supabase';
import { UserProfile, UserRole, Company } from '@/types/auth';
import apiClient from '@/lib/api-client';

interface AuthContextType {
  user: UserProfile | null;
  company: Company | null;
  loading: boolean;
  authInitialized: boolean;
  isAuthenticated: boolean;
  permissions: string[];
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
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
        lastLoginAt: userData.lastLoginAt || null,
        createdAt: userData.createdAt,
      };

      if (mountedRef.current) {
        setUser(profile);
        setCompany(userData.company || null);
        setPermissions(userData.permissions || []);
        tokenStorage.cacheUser(profile);
      }
    } catch (err) {
      console.warn('[AuthContext] Failed to fetch profile:', err);
      tokenStorage.clearTokens();
      if (mountedRef.current) {
        setUser(null);
        setCompany(null);
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

  const signIn = useCallback(async (email: string, password: string) => {
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
      lastLoginAt: userData.lastLoginAt || null,
      createdAt: userData.createdAt,
    };

    setUser(profile);
    setCompany(userData.company || null);
    setPermissions(userData.permissions || []);
    tokenStorage.cacheUser(profile);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await apiClient.post('/api/auth/logout').catch(() => {});
    } finally {
      tokenStorage.clearTokens();
      setUser(null);
      setCompany(null);
      setPermissions([]);
      window.location.href = '/login';
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  const isAuthenticated = useMemo(() => !!user && tokenStorage.hasTokens(), [user]);

  const value = useMemo(() => ({
    user,
    company,
    loading,
    authInitialized,
    isAuthenticated,
    permissions,
    signIn,
    signOut,
    refreshProfile,
  }), [user, company, loading, authInitialized, isAuthenticated, permissions, signIn, signOut, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
