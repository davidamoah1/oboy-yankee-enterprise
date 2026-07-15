const USER_CACHE_KEY = 'oboy_yankee_user_cache';

export const isSupabaseConfigured = () => false;

export const supabase = new Proxy({} as any, {
  get() {
    throw new Error('Supabase is not configured. This app uses a custom Express backend.');
  },
});

export const tokenStorage = {
  // Tokens are now stored in httpOnly cookies set by the server — not accessible from JS
  getAccessToken(): string | null {
    return null;
  },

  getRefreshToken(): string | null {
    return null;
  },

  setTokens(_accessToken: string, _refreshToken: string): void {
    // No-op: tokens are set as httpOnly cookies by the server
  },

  clearTokens(): void {
    // Clear user cache — actual cookie clearing happens via /api/auth/logout
    try {
      localStorage.removeItem(USER_CACHE_KEY);
    } catch (e) {
      console.warn('[TokenStorage] Failed to clear user cache:', e);
    }
  },

  cacheUser(user: any): void {
    try {
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn('[TokenStorage] Failed to cache user:', e);
    }
  },

  getCachedUser(): any | null {
    try {
      const raw = localStorage.getItem(USER_CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  hasTokens(): boolean {
    // Can't read httpOnly cookies from JS — use user cache as indicator
    return !!this.getCachedUser();
  },
};
