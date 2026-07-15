import apiClient from '@/lib/api-client';
import { UserRole } from '@/types/auth';

export const authService = {
  async signIn(email: string, password: string) {
    const response = await apiClient.post('/api/auth/login', { email, password });
    return response.data;
  },

  async register(data: { email: string; password: string; fullName: string; companyName: string; phone?: string }) {
    const response = await apiClient.post('/api/auth/register', data);
    return response.data;
  },

  async signOut() {
    await apiClient.post('/api/auth/logout').catch(() => {});
  },

  async getProfile() {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },

  async refreshToken() {
    const response = await apiClient.post('/api/auth/refresh');
    return response.data;
  },

  async resetPassword(email: string) {
    const response = await apiClient.post('/api/auth/reset-password', { email });
    return response.data;
  },

  can(permissions: string[], permission: string) {
    return permissions.includes('*') || permissions.includes(permission);
  }
};
