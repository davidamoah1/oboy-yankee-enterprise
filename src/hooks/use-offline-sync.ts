import { useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { offlinePOS } from '@/features/pos/services/offline-pos';
import { toast } from 'sonner';

export function useOfflineSync() {
  useEffect(() => {
    const syncTransactions = async () => {
      const pending = await offlinePOS.getPendingTransactions();
      if (pending.length === 0) return;

      console.log(`Attempting to sync ${pending.length} offline transactions...`);

      for (const tx of pending) {
        try {
          const response = await apiClient.post('/api/sales', {
            totalAmount: tx.total_amount,
            subtotal: tx.subtotal || tx.total_amount,
            taxAmount: tx.tax_amount || 0,
            discountAmount: tx.discount_amount || 0,
            paymentMethod: tx.payment_method,
            isCredit: tx.is_credit || false,
            customerPhone: tx.customer_phone || null,
            notes: `Offline sync ref: ${tx.id}`,
            items: tx.items.map((item: any) => ({
              productId: item.product.id,
              quantity: item.quantity,
              unitPrice: item.product.price,
              discount: 0,
              totalPrice: item.product.price * item.quantity
            }))
          });

          if (response.data) {
            await offlinePOS.markAsSynced(tx.id);
          }
        } catch (err) {
          console.error(`Failed to sync transaction ${tx.id}:`, err);
        }
      }

      const left = await offlinePOS.getPendingTransactions();
      if (left.length === 0) {
        toast.success("All offline transactions synced successfully!");
      }
    };

    const handleOnline = () => {
      syncTransactions();
    };

    window.addEventListener('online', handleOnline);
    // Initial check
    if (navigator.onLine) {
      syncTransactions();
    }

    return () => window.removeEventListener('online', handleOnline);
  }, []);
}
