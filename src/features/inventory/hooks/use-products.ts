import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '../services/inventory-service';
import { Product } from '@/types/entities';
import { toast } from 'sonner';

export function useProducts() {
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ['products'],
    queryFn: () => inventoryService.getProducts(),
  });

  const createMutation = useMutation({
    mutationFn: (newProduct: Partial<Product>) => inventoryService.createProduct(newProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create product');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Product> }) => 
      inventoryService.updateProduct(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update product');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => inventoryService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete product');
    }
  });

  const addOptimisticProduct = (product: Partial<Product>) => {
    queryClient.setQueryData(['products'], (old: Product[] | undefined) => {
      return [...(old || []), product as Product];
    });
  };

  return {
    products: productsQuery.data || [],
    isLoading: productsQuery.isLoading,
    isRefetching: productsQuery.isRefetching,
    createProduct: createMutation.mutate,
    updateProduct: updateMutation.mutate,
    deleteProduct: deleteMutation.mutate,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
    addOptimisticProduct,
  };
}
