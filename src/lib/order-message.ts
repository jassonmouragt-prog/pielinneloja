import type { CartItem } from "@/hooks/useCart";
import { getProductUrl } from "./site-config";

export function buildOrderMessage(
  items: CartItem[],
  customerName: string,
  totalPrice: number,
): string {
  let message = `Olá! Meu nome é ${customerName}. Gostaria de finalizar o pedido com os seguintes produtos:\n\n`;
  for (const item of items) {
    message += `• ${item.name} (${item.subtitle})\n`;
    if (item.selectedVariations) {
      const variations = Object.entries(item.selectedVariations)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
      message += `  Variações: ${variations}\n`;
    }
    message += `  Qtd: ${item.quantity} x ${item.price}\n`;
    if (item.id) message += `  Link: ${getProductUrl(item.id)}\n`;
    message += "\n";
  }
  return message + `Total: R$ ${totalPrice.toFixed(2).replace(".", ",")}\n`;
}
