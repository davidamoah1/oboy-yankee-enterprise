import { create } from 'zustand';
import { Product } from '@/types/entities';

interface CartItem {
  product: Product;
  quantity: number;
}

interface POSStore {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

export const usePOSStore = create<POSStore>((set, get) => ({
  cart: [],
  total: 0,
  addToCart: (product) => {
    const { cart } = get();
    const existingItem = cart.find((item) => item.product.id === product.id);
    let newCart;
    if (existingItem) {
      newCart = cart.map((item) =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...cart, { product, quantity: 1 }];
    }
    const newTotal = newCart.reduce(
      (sum, item) => sum + (Number(item.product.price) || 0) * item.quantity,
      0
    );
    set({ cart: newCart, total: newTotal });
  },
  removeFromCart: (productId) => {
    const newCart = get().cart.filter((item) => item.product.id !== productId);
    const newTotal = newCart.reduce(
      (sum, item) => sum + (Number(item.product.price) || 0) * item.quantity,
      0
    );
    set({ cart: newCart, total: newTotal });
  },
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    const newCart = get().cart.map((item) =>
      item.product.id === productId ? { ...item, quantity } : item
    );
    const newTotal = newCart.reduce(
      (sum, item) => sum + (Number(item.product.price) || 0) * item.quantity,
      0
    );
    set({ cart: newCart, total: newTotal });
  },
  clearCart: () => set({ cart: [], total: 0 }),
}));
