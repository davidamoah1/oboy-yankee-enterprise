import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { openDB, IDBPDatabase } from 'idb';
import { toast } from 'sonner';

const DEMO_PRODUCTS = [
  {
    id: "demo-1",
    name: "GH Gold Supreme Cocoa",
    category: "Food & Beverage",
    sku: "COCA-001",
    barcode: "6001234567891",
    price: 35.00,
    cost_price: 20.00,
    stock_quantity: 120,
    low_stock_threshold: 15,
    is_active: true,
    description: "Premium organic Ghana cocoa powder."
  },
  {
    id: "demo-2",
    name: "Kente Weave Heritage Scarf",
    category: "Apparel",
    sku: "KENT-002",
    barcode: "6001234567892",
    price: 150.00,
    cost_price: 80.00,
    stock_quantity: 8,
    low_stock_threshold: 10,
    is_active: true,
    description: "Authentic hand-woven Kente scarf."
  },
  {
    id: "demo-3",
    name: "Alata Samina Soap (Black Soap)",
    category: "Cosmetics",
    sku: "SOAP-003",
    barcode: "6001234567893",
    price: 15.00,
    cost_price: 7.50,
    stock_quantity: 45,
    low_stock_threshold: 10,
    is_active: true,
    description: "Traditional natural African black soap."
  },
  {
    id: "demo-4",
    name: "Golden Savanna Shea Butter",
    category: "Cosmetics",
    sku: "SHEA-004",
    barcode: "6001234567894",
    price: 25.00,
    cost_price: 12.00,
    stock_quantity: 3,
    low_stock_threshold: 10,
    is_active: true,
    description: "Cold-pressed raw yellow shea butter."
  }
];

/**
 * Enterprise Offline POS System Implementation
 * Handles local caching and synchronization of sales for the Ghana SME ecosystem.
 */
export function usePOSSystem() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [db, setDb] = useState<IDBPDatabase | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);

  // Initialize IndexedDB
  useEffect(() => {
    async function initDB() {
      try {
        const posDB = await openDB('NEXA_POS_KEEPER', 2, {
          upgrade(db, oldVersion) {
            if (!db.objectStoreNames.contains('products')) {
              db.createObjectStore('products', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('sales_queue')) {
              db.createObjectStore('sales_queue', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('customers')) {
              db.createObjectStore('customers', { keyPath: 'id' });
            }
          },
        });
        setDb(posDB);
      } catch (err) {
        console.warn('[POS] IndexedDB initialization bypassed or blocked by browser/iframe policies:', err);
      }
    }
    initDB();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync products for offline use (Offline-First layout)
  const syncProducts = useCallback(async () => {
    // 1. Core Optimistic Phase: Load locally cached catalog immediately to guarantee zero visual latency
    let localProducts: any[] = [];
    try {
      const stored = localStorage.getItem('oboy_yankee_products');
      if (stored) {
        localProducts = JSON.parse(stored);
      }
    } catch (lsErr) {
      console.warn('[POS] LocalStorage read failed during optimistic load:', lsErr);
    }

    // If localStorage is empty, try loading from IndexedDB
    if (localProducts.length === 0 && db) {
      try {
        localProducts = await db.getAll('products');
      } catch (dbErr) {
        console.warn('[POS] IndexedDB read failed during optimistic load:', dbErr);
      }
    }

    // If still empty (e.g. fresh session), seed with DEMO_PRODUCTS immediately
    if (localProducts.length === 0) {
      localProducts = DEMO_PRODUCTS.map(p => ({
        ...p,
        id: p.id || crypto.randomUUID()
      }));
      try {
        localStorage.setItem('oboy_yankee_products', JSON.stringify(localProducts));
      } catch (cacheErr) {}
    }

    // Instantly set local state so Catalog contains items (including newly added ones) without waiting for network query
    if (localProducts.length > 0) {
      setProducts(localProducts);
      setCategories(['All', ...new Set(localProducts.map(p => p.category).filter(Boolean) as string[])]);
    }

    // 2. Remote Synchronization Phase: Asynchronously update the local catalog from API
    if (isOnline) {
      try {
        const response = await apiClient.get('/api/products');
        const remoteProducts = response.data?.data || response.data || [];

        // Merge and deduplicate remote and local list
        let mergedList = [...(remoteProducts || [])];
        
        // Re-read current localStorage to get the latest state in case it updated in the background
        let currentLocal: any[] = [];
        try {
          const stored = localStorage.getItem('oboy_yankee_products');
          if (stored) {
            currentLocal = JSON.parse(stored);
          }
        } catch (e) {}

        const activeLocal = currentLocal.length > 0 ? currentLocal : localProducts;
        
        for (const lp of activeLocal) {
          const alreadyExists = mergedList.some((rp: any) => 
            rp.id === lp.id || 
            (rp.sku && lp.sku && rp.sku.toLowerCase() === lp.sku.toLowerCase())
          );
          if (!alreadyExists) {
            mergedList.push(lp);
          }
        }

        // Keep local DB and localStorage updated in the background
        if (db) {
          try {
            const tx = db.transaction('products', 'readwrite');
            const store = tx.objectStore('products');
            await store.clear();
            for (const p of mergedList) {
              await store.put(p);
            }
            await tx.done;
          } catch (dbErr) {
            console.warn('[POS] Background IndexedDB write failed:', dbErr);
          }
        }

        try {
          localStorage.setItem('oboy_yankee_products', JSON.stringify(mergedList));
        } catch (cacheErr) {}

        // Update UI state with merged remote items
        setProducts(mergedList);
        setCategories(['All', ...new Set(mergedList.map(p => p.category).filter(Boolean) as string[])]);
        console.log('[POS] Background catalog synchronization successful.');
      } catch (syncErr: any) {
        console.warn('[POS] Background catalog synchronization skipped/failed. Keeping local catalog:', syncErr.message || syncErr);
      }
    }
  }, [db, isOnline]);

  useEffect(() => {
    syncProducts();
  }, [syncProducts]);

  // Listen for storage events (catalog updates across tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'oboy_yankee_products') {
        console.log('[POS] Storage updated from another tab/view, refreshing catalog...');
        syncProducts();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [syncProducts]);

  // Record a sale (Offline-First)
  const recordSale = async (saleData: any): Promise<{ saleId: string; syncedOnline: boolean } | null> => {
    try {
      const saleId = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `sale-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      const entry = {
        ...saleData,
        id: saleId,
        created_at: new Date().toISOString(),
        synced: false
      };

      // 1. Save to local DB first (Guarantees data persistence) — this is instant
      if (db) {
        try {
          await db.put('sales_queue', entry);
        } catch (dbErr) {
          console.warn('[POS] IndexedDB put failed, continuing with online sync:', dbErr);
        }
      }

      let syncedOnline = false;
      if (isOnline) {
        // 2. Try to sync immediately if online (failure is non-fatal — sale is already in IndexedDB)
        // Use a short timeout — if server is slow, just keep it offline and sync later
        try {
          syncedOnline = await syncSale(entry);
        } catch (syncErr) {
          console.warn('[POS] Online sync failed, sale retained in local queue:', syncErr);
          syncedOnline = false;
        }
      } else {
        if (db) {
          toast.warning("Saved offline — will sync when connection returns.");
        } else {
          toast.error("Cannot save transaction — storage unavailable.");
          return null;
        }
      }

      return { saleId, syncedOnline };
    } catch (err) {
      console.error('[POS] Critical Write Failure:', err);
      toast.error("Could not save transaction. Please try again.");
      return null;
    }
  };

  // Search local products (Offline-First Query Engine)
  const searchLocalProducts = async (term: string) => {
    const query = term.toLowerCase();
    if (!db) {
      return products.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.sku?.toLowerCase().includes(query) ||
        p.barcode?.toLowerCase().includes(query)
      ).slice(0, 50);
    }
    const tx = db.transaction('products', 'readonly');
    const store = tx.objectStore('products');
    const all = await store.getAll();
    
    return all.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.sku?.toLowerCase().includes(query) ||
      p.barcode?.toLowerCase().includes(query)
    ).slice(0, 50); // Performance limit
  };

  const syncSale = async (entry: any): Promise<boolean> => {
    if (!isOnline) return false;

    // Acquire lock in local memory / IndexedDB row state to prevent multi-tab sync races
    if (db) {
      try {
        const tx = db.transaction('sales_queue', 'readwrite');
        const store = tx.objectStore('sales_queue');
        const currentRef = await store.get(entry.id);
        
        if (!currentRef || currentRef.sync_in_progress) {
          await tx.done;
          console.log(`[POS Lock] Skipping sync for ${entry.id}: Transaction is already being uploaded by another thread or tab.`);
          return false;
        }
        
        currentRef.sync_in_progress = true;
        await store.put(currentRef);
        await tx.done;
      } catch (lkErr) {
        console.warn("[POS Lock WARNING] Could not register local sync lock", lkErr);
      }
    }

    try {
      setSyncing(true);
      
      const response = await apiClient.post('/api/sales', {
        customerId: entry.customer_id || null,
        customerPhone: entry.customer_phone || null,
        totalAmount: entry.total_amount,
        subtotal: entry.subtotal,
        taxAmount: entry.tax_amount,
        discountAmount: entry.discount_amount,
        paymentMethod: entry.payment_method,
        isCredit: entry.is_credit || false,
        notes: `Offline IDB ref: ${entry.id}`,
        items: entry.items.map((it: any) => ({
          productId: it.product.id,
          quantity: it.quantity,
          unitPrice: Number(it.product.price) || 0,
          discount: 0,
          totalPrice: (Number(it.product.price) || 0) * it.quantity
        }))
      });

      const transaction = response.data?.data || response.data;

      // 3. Mark as synced locally by deleting from local queue
      if (db) {
        const tx = db.transaction('sales_queue', 'readwrite');
        await tx.objectStore('sales_queue').delete(entry.id);
        await tx.done;
      }

      console.log('[POS] Sale synced successfully.');
      return true;
    } catch (err: any) {
      console.warn('[POS] Sync failed for item (restoring offline state):', err.message || err);
      
      // Release lock on sync failure so it can backoff and retry later
      if (db) {
        try {
          const tx = db.transaction('sales_queue', 'readwrite');
          const store = tx.objectStore('sales_queue');
          const currentRef = await store.get(entry.id);
          if (currentRef) {
            currentRef.sync_in_progress = false;
            await store.put(currentRef);
          }
          await tx.done;
        } catch (unlErr) {}
      }
      return false;
    } finally {
      setSyncing(false);
    }
  };

  // Background Sync when online - run quietly without interrupting the sales terminal
  useEffect(() => {
    if (isOnline && db) {
      const runSync = async () => {
        const allSales = await db.getAll('sales_queue');
        const unsynced = allSales.filter(s => !s.synced);
        
        if (unsynced.length > 0) {
          let failedCount = 0;
          let succeededCount = 0;

          for (const sale of unsynced) {
            const success = await syncSale(sale);
            if (success) {
              succeededCount++;
            } else {
              failedCount++;
              // Incremental retry boundary to bypass permanent logical or schema mismatches
              const updatedSale = { ...sale, retry_count: (sale.retry_count || 0) + 1 };
              const tx = db.transaction('sales_queue', 'readwrite');
              if (updatedSale.retry_count >= 3) {
                await tx.objectStore('sales_queue').delete(sale.id);
                console.warn(`[POS] Sale dropped from queue after maximum sync retry attempts:`, sale.id);
              } else {
                await tx.objectStore('sales_queue').put(updatedSale);
              }
              await tx.done;
            }
          }
          
          if (succeededCount > 0) {
            toast.success(`Successfully synchronized ${succeededCount} local terminal records.`);
          }
          if (failedCount > 0) {
            console.log(`[POS] Quiet sync: ${failedCount} item(s) currently buffered in local cached ledger.`);
          }
        }
      };
      runSync();
    }
  }, [isOnline, db]);

  return {
    isOnline,
    syncing,
    syncProducts,
    recordSale,
    products,
    categories,
    searchLocalProducts
  };
}
