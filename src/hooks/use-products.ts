import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { toast } from "sonner";

export type Product = {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  sku: string | null;
  barcode: string | null;
  price: number;
  cost_price: number | null;
  stock_quantity: number;
  low_stock_threshold: number | null;
  category: string | null;
  category_id: string | null;
  image_url: string | null;
  is_active: boolean;
  status?: "In Stock" | "Low Stock" | "Out of Stock";
};

// Realistic predefined starter products for Ghana SME market when database isn't fully linked
const DEMO_PRODUCTS: Partial<Product>[] = [
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

export function useProducts(tenantId: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    if (!tenantId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    // If database connection is not active (Demo Environment), fetch and persist locally
    if (!isSupabaseConfigured()) {
      try {
        const demoKey = `nexa_demo_products_${tenantId}`;
        const stored = localStorage.getItem(demoKey);
        let list: any[] = [];
        if (stored) {
          list = JSON.parse(stored);
        } else {
          list = DEMO_PRODUCTS.map(p => ({
            ...p,
            tenant_id: tenantId,
            id: p.id || crypto.randomUUID()
          }));
          localStorage.setItem(demoKey, JSON.stringify(list));
        }

        const mappedProducts = list.map((p: any) => {
          const threshold = p.low_stock_threshold !== null && p.low_stock_threshold !== undefined
            ? p.low_stock_threshold
            : 10;
          return {
            ...p,
            status: p.stock_quantity <= 0 
              ? "Out of Stock" 
              : p.stock_quantity <= threshold
                ? "Low Stock" 
                : "In Stock"
          };
        });

        setProducts(mappedProducts);
      } catch (e) {
        console.error("Local catalog memory lookup failed:", e);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      const supabaseCall = supabase
        .from("products")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("name");

      const timeoutLimit = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database query timeout limit")), 15000)
      );

      const response = await Promise.race([Promise.resolve(supabaseCall), timeoutLimit]) as any;
      const { data, error } = response;

      if (error) throw error;
      
      const remoteList = data || [];
      const mergedList = [...remoteList];

      // Safeguard newly added products in local cache so a DB query doesn't erase local-only additions
      try {
        const stored = localStorage.getItem(`nexa_demo_products_${tenantId}`);
        if (stored) {
          const localList = JSON.parse(stored);
          for (const lp of localList) {
            const alreadyExists = remoteList.some((rp: any) => 
              rp.id === lp.id || 
              (rp.sku && lp.sku && rp.sku.toLowerCase() === lp.sku.toLowerCase())
            );
            if (!alreadyExists) {
              mergedList.push(lp);
            }
          }
        }
      } catch (lsErr) {
        console.warn("Local storage merge failed in useProducts:", lsErr);
      }

      const mappedProducts = mergedList.map((p: any) => {
        const threshold = p.low_stock_threshold !== null && p.low_stock_threshold !== undefined
          ? p.low_stock_threshold
          : 10;
        return {
          ...p,
          status: p.stock_quantity <= 0 
            ? "Out of Stock" 
            : p.stock_quantity <= threshold
              ? "Low Stock" 
              : "In Stock"
        };
      });
      
      setProducts(mappedProducts);

      // Keep local backup safe in case browser experiences network drops later
      try {
        localStorage.setItem(`nexa_demo_products_${tenantId}`, JSON.stringify(mergedList));
      } catch (cacheErr) {}
    } catch (err: any) {
      const friendlyMsg = err.message === "Failed to fetch"
        ? "Network Link Disrupted. Displaying offline memory catalog."
        : err.message;

      toast.error("Failed to load products: " + friendlyMsg);

      // Gracefully load fallback copy from localStorage in case of connectivity disruptions
      try {
        const stored = localStorage.getItem(`nexa_demo_products_${tenantId}`);
        if (stored) {
          const fallbackList = JSON.parse(stored).map((p: any) => {
            const threshold = p.low_stock_threshold !== null && p.low_stock_threshold !== undefined
              ? p.low_stock_threshold
              : 10;
            return {
              ...p,
              status: p.stock_quantity <= 0 
                ? "Out of Stock" 
                : p.stock_quantity <= threshold
                  ? "Low Stock" 
                  : "In Stock"
            };
          });
          setProducts(fallbackList);
        }
      } catch (cacheErr) {}
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [tenantId]);

  const addOptimisticProduct = (product: Product) => {
    const threshold = product.low_stock_threshold !== null && product.low_stock_threshold !== undefined
      ? product.low_stock_threshold
      : 10;
    const mapped: Product = {
      ...product,
      status: product.stock_quantity <= 0 
        ? "Out of Stock" 
        : product.stock_quantity <= threshold
          ? "Low Stock" 
          : "In Stock"
    };

    // Keep localStorage mirror synced
    try {
      const demoKey = `nexa_demo_products_${tenantId}`;
      const stored = localStorage.getItem(demoKey);
      let list = stored ? JSON.parse(stored) : [];
      if (!list.some((p: any) => p.id === product.id || (product.sku && p.sku === product.sku))) {
        list = [product, ...list];
        localStorage.setItem(demoKey, JSON.stringify(list));
      }
    } catch (e) {
      console.warn("Local catalog backup failed:", e);
    }

    setProducts(prev => {
      if (prev.some(p => p.id === product.id || (product.sku && p.sku === product.sku))) return prev;
      return [mapped, ...prev].sort((a, b) => a.name.localeCompare(b.name));
    });
  };

  return { products, isLoading, refresh: fetchProducts, addOptimisticProduct };
}
