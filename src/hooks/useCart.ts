import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  name: string;
  subtitle: string;
  price: string;
  image: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Omit<CartItem, 'quantity'>) => void;
  removeItem: (name: string) => void;
  updateQuantity: (name: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product: Omit<CartItem, 'quantity'>) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.name === product.name);

        if (existingItem) {
          set({
            items: currentItems.map((item) =>
              item.name === product.name
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({ items: [...currentItems, { ...product, quantity: 1 }] });
        }
      },
      removeItem: (name: string) => {
        set({ items: get().items.filter((item) => item.name !== name) });
      },
      updateQuantity: (name: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(name);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.name === name ? { ...item, quantity } : item
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((total: number, item: CartItem) => total + item.quantity, 0),
    }),
    {
      name: 'cart-storage',
    }
  )
);
