const USER_CACHE_KEY = 'oboy_yankee_user_cache';

export const isSupabaseConfigured = () => false;

export const supabase = new Proxy({} as any, {
  get() {
    throw new Error('Supabase is not configured. This app uses a custom Express backend.');
  },
});

export const tokenStorage = {
  getAccessToken(): string | null {
    try {
      return localStorage.getItem('oboy_access_token');
    } catch {
      return null;
    }
  },

  getRefreshToken(): string | null {
    try {
      return localStorage.getItem('oboy_refresh_token');
    } catch {
      return null;
    }
  },

  setTokens(accessToken: string, refreshToken: string): void {
    try {
      localStorage.setItem('oboy_access_token', accessToken);
      localStorage.setItem('oboy_refresh_token', refreshToken);
    } catch (e) {
      console.warn('[TokenStorage] Failed to store tokens:', e);
    }
  },

  clearTokens(): void {
    try {
      localStorage.removeItem('oboy_access_token');
      localStorage.removeItem('oboy_refresh_token');
      localStorage.removeItem(USER_CACHE_KEY);
    } catch (e) {
      console.warn('[TokenStorage] Failed to clear tokens:', e);
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
    return !!this.getAccessToken() || !!this.getCachedUser();
  },
};
