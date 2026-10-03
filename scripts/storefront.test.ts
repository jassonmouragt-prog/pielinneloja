import assert from "node:assert/strict";
import { test } from "node:test";
import type { CartItem } from "../src/hooks/useCart";
import { buildOrderMessage } from "../src/lib/order-message";
import { getProductUrl, socialLinks } from "../src/lib/site-config";

const saved = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: {
    getItem: (key: string) => saved.get(key) ?? null,
    setItem: (key: string, value: string) => {
      saved.set(key, value);
    },
    removeItem: (key: string) => {
      saved.delete(key);
    },
  },
});
Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: {
    localStorage: globalThis.localStorage,
    location: { origin: "https://pielinneloja.vercel.app" },
  },
});
const { useCart, getCartItemLimit } = await import("../src/hooks/useCart");

const piece = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Anel Coração Dourado",
  subtitle: "Banho de ouro",
  price: "R$ 79,90",
  image: "/aneis.png",
  maxQuantity: 3,
  stockQuantity: 3,
};

test("quantidade mínima, máxima, contador e remoção explícita", () => {
  useCart.getState().clearCart();
  useCart.getState().addItem(piece);
  assert.equal(useCart.getState().items[0]?.quantity, 1);
  useCart.getState().updateQuantity(piece.name, 0);
  assert.equal(useCart.getState().items[0]?.quantity, 1);
  useCart.getState().updateQuantity(piece.name, 9);
  assert.equal(useCart.getState().items[0]?.quantity, 3);
  useCart.getState().addItem(piece, 2);
  assert.equal(useCart.getState().totalItems(), 3);
  useCart.getState().updateQuantity(piece.name, 2);
  assert.equal(useCart.getState().totalItems(), 2);
  useCart.getState().removeItem(piece.name);
  assert.equal(useCart.getState().items.length, 0);
});

test("estoque compartilhado entre variações", () => {
  const first: CartItem = { ...piece, quantity: 2, selectedVariations: { Tamanho: "16" } };
  const second: CartItem = { ...piece, quantity: 1, selectedVariations: { Tamanho: "18" } };
  assert.equal(getCartItemLimit([first, second], second), 1);
  const withOptions: CartItem = {
    ...piece,
    stockQuantity: 10,
    maxQuantity: 5,
    quantity: 1,
    selectedVariations: { Cor: "Ouro", Tamanho: "18" },
    variationStock: { Cor: { Ouro: 3 } },
  };
  const other: CartItem = {
    ...withOptions,
    quantity: 2,
    selectedVariations: { Cor: "Ouro", Tamanho: "16" },
  };
  assert.equal(getCartItemLimit([withOptions, other], withOptions), 1);
});

test("itens antigos sem estoque mantêm compatibilidade", () => {
  const { maxQuantity: _max, stockQuantity: _stock, ...legacy } = piece;
  const item = { ...legacy, quantity: 1 };
  assert.equal(getCartItemLimit([item], item), Infinity);
});

test("persistência mantém itens e quantidades ao reidratar", async () => {
  useCart.getState().clearCart();
  useCart.getState().addItem(piece, 2);
  useCart.setState({ items: [] });
  saved.set(
    "cart-storage",
    JSON.stringify({ state: { items: [{ ...piece, quantity: 2 }], isOpen: false }, version: 0 }),
  );
  await useCart.persist.rehydrate();
  assert.equal(useCart.getState().items[0]?.quantity, 2);
  assert.equal(useCart.getState().totalItems(), 2);
  useCart.getState().clearCart();
});

test("URL individual e Facebook oficial", () => {
  assert.equal(getProductUrl(piece.id), `https://pielinneloja.vercel.app/?produto=${piece.id}`);
  assert.equal(socialLinks.facebook, "https://www.facebook.com/p/Pielinne-61579394410896/");
});

test("mensagem preserva acentos, variações, valores, quantidades e links após codificação", () => {
  const items: CartItem[] = [
    { ...piece, quantity: 1, selectedVariations: { Tamanho: "16" } },
    {
      ...piece,
      id: "22222222-2222-4222-8222-222222222222",
      name: "Brinco Ponto de Luz",
      subtitle: "Prata",
      price: "R$ 49,90",
      quantity: 2,
    },
  ];
  const message = buildOrderMessage(items, "Márcia", 179.7);
  assert.equal(decodeURIComponent(encodeURIComponent(message)), message);
  assert.match(message, /Olá! Meu nome é Márcia/);
  assert.match(message, /Variações: Tamanho: 16/);
  assert.match(message, /Qtd: 2 x R\$ 49,90/);
  assert.match(message, /Total: R\$ 179,70/);
  assert.equal(
    (message.match(/Link: https:\/\/pielinneloja.vercel.app\/\?produto=/g) ?? []).length,
    2,
  );
  console.log(message);
});
