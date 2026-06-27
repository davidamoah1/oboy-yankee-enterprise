const ACCESS_TOKEN_KEY = 'oboy_yankee_access_token';
const REFRESH_TOKEN_KEY = 'oboy_yankee_refresh_token';
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
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setTokens(accessToken: string, refreshToken: string): void {
    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } catch (e) {
      console.warn('[TokenStorage] Failed to store tokens:', e);
    }
  },

  clearTokens(): void {
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
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
    return !!this.getAccessToken();
  },
};
