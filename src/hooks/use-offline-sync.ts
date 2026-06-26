import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
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
          const { error } = await supabase
            .from('transactions')
            .insert({
              id: tx.id,
              tenant_id: tx.tenant_id,
              total_amount: tx.total_amount,
              payment_method: tx.payment_method,
              created_at: tx.created_at,
              status: 'completed'
            });

          if (!error) {
            // Also insert items
            const itemsToInsert = tx.items.map(item => ({
              transaction_id: tx.id,
              product_id: item.product.id,
              quantity: item.quantity,
              unit_price: item.product.price,
              total_price: item.product.price * item.quantity
            }));

            const { error: itemsError } = await supabase
              .from('transaction_items')
              .insert(itemsToInsert);

            if (!itemsError) {
              await offlinePOS.markAsSynced(tx.id);
            }
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
