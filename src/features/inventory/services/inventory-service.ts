import apiClient from '@/lib/api-client';
import { Product } from '@/types/entities';

export const inventoryService = {
  async getProducts() {
    const response = await apiClient.get('/api/products');
    return response.data as Product[];
  },

  async createProduct(product: Partial<Product>) {
    const response = await apiClient.post('/api/products', product);
    return response.data as Product;
  },

  async updateProduct(id: string, updates: Partial<Product>) {
    const response = await apiClient.put(`/api/products/${id}`, updates);
    return response.data as Product;
  },

  async deleteProduct(id: string) {
    const response = await apiClient.delete(`/api/products/${id}`);
    return response.data;
  }
};
