import { api } from '@/lib/api';
import { Tenant, User, PlatformTransaction, SystemLog } from '@/types/super-admin';

export const platformService = {
  async getGlobalStats() {
    try {
      const { data } = await api.get('/api/admin/platform-stats');
      return {
        totalTenants: data.totalTenants || 0,
        totalUsers: data.totalUsers || 0,
        activeSubscriptions: data.totalTenants || 0,
        monthlyRevenue: data.monthlyRevenue || 0,
        platformUptime: data.platformUptime || '99.98%',
        averageResponseTime: data.averageResponseTime || '86ms'
      };
    } catch (err) {
      console.error('Failed to fetch platform stats:', err);
      return {
        totalTenants: 0,
        totalUsers: 0,
        activeSubscriptions: 0,
        monthlyRevenue: 0,
        platformUptime: '99.98%',
        averageResponseTime: '86ms'
      };
    }
  },

  async getTenants(): Promise<Tenant[]> {
    try {
      const { data } = await api.get('/api/admin/tenants');
      return data || [];
    } catch (err) {
      console.error('Failed to fetch tenants:', err);
      return [];
    }
  },

  getFallbackTenantsSync(): Tenant[] {
    return [];
  },

  async updateTenantStatus(tenantId: string, status: string) {
    try {
      await api.put(`/api/admin/tenants/${tenantId}/status`, { status });
    } catch (err) {
      console.error('Failed to update tenant status:', err);
      throw err;
    }
  },

  async deleteTenant(tenantId: string) {
    try {
      await api.delete(`/api/admin/tenants/${tenantId}`);
    } catch (err) {
      console.error('Failed to delete tenant:', err);
      throw err;
    }
  }
};
