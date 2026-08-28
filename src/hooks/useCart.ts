import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id?: string;
  name: string;
  subtitle: string;
  price: string;
  image: string;
  quantity: number;
  selectedVariations?: Record<string, string> | undefined;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (name: string, variations?: Record<string, string>) => void;
  updateQuantity: (name: string, quantity: number, variations?: Record<string, string>) => void;
  clearCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  totalItems: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (product: Omit<CartItem, "quantity">, quantity: number = 1) => {
        const currentItems = get().items;
        const existingItem = currentItems.find(
          (item) =>
            item.name === product.name &&
            JSON.stringify(item.selectedVariations) === JSON.stringify(product.selectedVariations),
        );

        if (existingItem) {
          set({
            items: currentItems.map((item) =>
              item.name === product.name &&
              JSON.stringify(item.selectedVariations) === JSON.stringify(product.selectedVariations)
                ? { ...item, quantity: item.quantity + quantity }
                : item,
            ),
            isOpen: true,
          });
        } else {
          set({
            items: [...currentItems, { ...product, quantity }],
            isOpen: true,
          });
        }
      },
      removeItem: (name: string, variations?: Record<string, string>) => {
        set({
          items: get().items.filter(
            (item) =>
              !(
                item.name === name &&
                JSON.stringify(item.selectedVariations) === JSON.stringify(variations)
              ),
          ),
        });
      },
      updateQuantity: (name: string, quantity: number, variations?: Record<string, string>) => {
        if (quantity <= 0) {
          get().removeItem(name, variations);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.name === name &&
            JSON.stringify(item.selectedVariations) === JSON.stringify(variations)
              ? { ...item, quantity }
              : item,
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      setIsOpen: (isOpen: boolean) => set({ isOpen }),
      totalItems: () =>
        get().items.reduce((total: number, item: CartItem) => total + item.quantity, 0),
    }),
    {
      name: "cart-storage",
    },
  ),
);
