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

        const token = tokenStorage.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(this.normalizeError(error))
    );

    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = tokenStorage.getRefreshToken();
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            const response = await axios.post(
              `${import.meta.env.VITE_API_URL || ''}/api/auth/refresh`,
              { refreshToken }
            );

            const { accessToken, refreshToken: newRefreshToken } = response.data;
            tokenStorage.setTokens(accessToken, newRefreshToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.instance(originalRequest);
          } catch (refreshErr) {
            tokenStorage.clearTokens();
            if (window.location.pathname !== '/login') {
              toast.error('Session expired. Please sign in again.');
              window.location.href = '/login';
            }
            return Promise.reject(this.normalizeError(refreshErr));
          }
        }

        const shouldRetry =
          originalRequest &&
          (error.response?.status >= 500 || error.code === 'ECONNABORTED');

        if (shouldRetry) {
          originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
          const maxRetries = 4;
          const retryDelay = 4000;

          if (originalRequest._retryCount <= maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay * originalRequest._retryCount));
            return this.instance(originalRequest);
          }
        }

        const normalized = this.normalizeError(error);

        const skipToast =
          originalRequest?.headers?.['X-Skip-Global-Toast'] === 'true' ||
          originalRequest?.headers?.['x-skip-global-toast'] === 'true' ||
          originalRequest?.skipToast;

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
      toast.error('Session Expired', { description: 'Please sign in again.' });
    } else if (err.status === 403) {
      toast.error('Access Denied', { description: err.message });
    } else if (err.status === 429 || err.status === 503) {
      toast.error('Rate Limited', { description: 'Too many requests. Please slow down.' });
    } else if (err.status === 409) {
      toast.error('Conflict', { description: err.message, duration: 6000 });
    } else if (err.status && err.status >= 500) {
      toast.error('Connection Issue', { description: 'The server is taking longer than usual. Please try again.' });
    } else if (err.code === 'ECONNABORTED' || err.message.toLowerCase().includes('timeout')) {
      toast.error('Network Timeout', { description: 'Connection is slow or server is unreachable.' });
    } else {
      toast.error('Error', { description: err.message });
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

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.delete<T>(url, config);
  }
}

export const apiClient = new APIClient();
export default apiClient;
