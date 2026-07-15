import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, CancelTokenSource } from 'axios';
import { tokenStorage } from './supabase';
import { toast } from 'sonner';

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  degraded?: boolean;
  fallbackData?: T;
}

export interface NormalizedError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export class APIClient {
  public instance: AxiosInstance;
  private cancelTokens: Map<string, CancelTokenSource> = new Map();

  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_URL || '',
      timeout: 45000,
      withCredentials: true, // Send httpOnly cookies with every request
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.instance.interceptors.request.use(
      (config) => {
        if (config.url?.startsWith('/api/ai/')) {
          config.timeout = 90000;
        }
        if (config.url?.startsWith('/api/auth/')) {
          config.timeout = 60000;
        }
        // POST /api/sales: short timeout — POS is offline-first, no need to wait long
        if (config.method === 'post' && config.url?.startsWith('/api/sales')) {
          config.timeout = 15000;
        }

        const token = tokenStorage.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        // Attach active branch ID for multi-branch filtering
        const activeBranchId = localStorage.getItem('activeBranchId');
        if (activeBranchId && config.headers && !config.url?.startsWith('/api/auth/')) {
          config.headers['x-branch-id'] = activeBranchId;
        }
        return config;
      },
      (error) => Promise.reject(this.normalizeError(error))
    );

    this.instance.interceptors.response.use(
      (response) => {
        toast.dismiss('retry-loading');
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            // Attempt silent refresh via httpOnly cookie — no token in JS
            const response = await axios.post(
              `${import.meta.env.VITE_API_URL || ''}/api/auth/refresh`,
              {},
              { withCredentials: true }
            );

            return this.instance(originalRequest);
          } catch (refreshErr) {
            tokenStorage.clearTokens();
            localStorage.removeItem('activeBranchId');
            if (window.location.pathname !== '/login') {
              toast.error('Session expired. Please sign in again.');
              window.location.href = '/login';
            }
            return Promise.reject(this.normalizeError(refreshErr));
          }
        }

        // Only retry on server errors (500+), network errors, or no response at all
        // Don't retry on 400/401/403/404 — those are legitimate client errors
        const isServerError =
          error.response?.status >= 500 ||
          error.code === 'ECONNABORTED' ||
          error.code === 'ERR_NETWORK' ||
          error.code === 'ETIMEDOUT' ||
          (!error.response && !error.status);

        // Don't retry POST /api/sales — the POS is offline-first, sale is already in IndexedDB
        // and will be synced in the background. Retrying just adds 20s of waiting.
        const isSalesPost = originalRequest?.method === 'post' && originalRequest?.url?.startsWith('/api/sales');
        const shouldRetry = originalRequest && isServerError && !isSalesPost;

        if (shouldRetry) {
          originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
          const maxRetries = 2;
          const retryDelay = 1500;

          if (originalRequest._retryCount <= maxRetries) {
            // Only show toast for auth endpoints (login) — other pages handle their own loading states
            const isAuthEndpoint = originalRequest?.url?.startsWith('/api/auth/');
            if (originalRequest._retryCount === 1 && isAuthEndpoint) {
              toast.loading('Connecting to server, please wait...', { id: 'retry-loading', duration: Infinity });
            }
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            return this.instance(originalRequest);
          }
          toast.dismiss('retry-loading');
        }

        const normalized = this.normalizeError(error);

        // Skip error toast for sales POST — POS is offline-first, sale is saved in IndexedDB
        const isSalesPostError = originalRequest?.method === 'post' && originalRequest?.url?.startsWith('/api/sales');
        const skipToast =
          originalRequest?.headers?.['X-Skip-Global-Toast'] === 'true' ||
          originalRequest?.headers?.['x-skip-global-toast'] === 'true' ||
          originalRequest?.skipToast ||
          isSalesPostError;

        if (!skipToast) {
          this.displayToastForError(normalized);
        }
        return Promise.reject(normalized);
      }
    );
  }

  public normalizeError(error: any): NormalizedError {
    if (axios.isCancel(error)) {
      return { message: 'Request was cancelled.', code: 'CANCELLED' };
    }

    const response = error.response;
    const data = response?.data;

    return {
      message: data?.error || data?.message || error.message || 'An unexpected error occurred.',
      status: response?.status,
      code: error.code || (response?.status ? `HTTP_${response.status}` : 'UNKNOWN_ERROR'),
      details: data?.details || data || null,
    };
  }

  private displayToastForError(err: NormalizedError) {
    if (err.code === 'CANCELLED') return;

    if (err.status === 401) {
      toast.error('Session Expired', { description: 'Please sign in again to continue.' });
    } else if (err.status === 403) {
      toast.error('Access Denied', { description: 'You do not have permission to do this. Ask your manager for help.' });
    } else if (err.status === 429 || err.status === 503) {
      toast.error('Too Many Attempts', { description: 'Please wait a moment and try again.' });
    } else if (err.status === 409) {
      toast.error('Already Exists', { description: err.message, duration: 6000 });
    } else if (err.status && err.status >= 500) {
      toast.error('Server Problem', { description: 'The server is having issues. Please try again in a moment.' });
    } else if (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK' || err.message.toLowerCase().includes('timeout')) {
      toast.error('No Internet', { description: 'Could not connect. Check your internet and try again.' });
    } else {
      toast.error('Something Went Wrong', { description: err.message });
    }
  }

  public getCancelToken(key: string): CancelTokenSource {
    this.cancelTokens.get(key)?.cancel('Cancelled prior operation.');
    const source = axios.CancelToken.source();
    this.cancelTokens.set(key, source);
    return source;
  }

  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.get<T>(url, config);
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(url, data, config);
  }

  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.put<T>(url, data, config);
  }

  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.patch<T>(url, data, config);
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.delete<T>(url, config);
  }
}

export const apiClient = new APIClient();
export default apiClient;
