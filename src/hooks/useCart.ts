import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id?: string;
  name: string;
  subtitle: string;
  price: string;
  image: string;
  quantity: number;
  maxQuantity?: number;
  stockQuantity?: number;
  variationStock?: Record<string, Record<string, number>>;
  selectedVariations?: Record<string, string> | undefined;
}

export function getCartItemLimit(items: CartItem[], item: CartItem): number {
  const otherQuantity = items.reduce((sum, other) => {
    if (other === item || !item.id || other.id !== item.id) return sum;
    return sum + other.quantity;
  }, 0);
  let limit = Math.min(
    item.maxQuantity ?? Infinity,
    (item.stockQuantity ?? Infinity) - otherQuantity,
  );
  for (const [name, value] of Object.entries(item.selectedVariations ?? {})) {
    const stock = item.variationStock?.[name]?.[value];
    if (stock === undefined) continue;
    const used = items.reduce(
      (sum, other) =>
        other !== item && other.id === item.id && other.selectedVariations?.[name] === value
          ? sum + other.quantity
          : sum,
      0,
    );
    limit = Math.min(limit, stock - used);
  }
  return Math.max(0, limit);
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
          const updated = { ...existingItem, ...product };
          const limit = getCartItemLimit(
            currentItems.filter((item) => item !== existingItem),
            updated,
          );
          if (limit < 1) return;
          set({
            items: currentItems.map((item) =>
              item.name === product.name &&
              JSON.stringify(item.selectedVariations) === JSON.stringify(product.selectedVariations)
                ? { ...updated, quantity: Math.min(item.quantity + quantity, limit) }
                : item,
            ),
            isOpen: true,
          });
        } else {
          const newItem = { ...product, quantity };
          const limit = getCartItemLimit(currentItems, newItem);
          if (limit < 1) return;
          set({
            items: [...currentItems, { ...newItem, quantity: Math.min(quantity, limit) }],
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
        if (!Number.isFinite(quantity)) return;
        set({
          items: get().items.map((item) =>
            item.name === name &&
            JSON.stringify(item.selectedVariations) === JSON.stringify(variations)
              ? {
                  ...item,
                  quantity: Math.max(
                    1,
                    Math.min(Math.floor(quantity), getCartItemLimit(get().items, item)),
                  ),
                }
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
