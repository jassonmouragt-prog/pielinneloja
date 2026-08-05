import { ShoppingBag, X, Plus, Minus, MessageSquare } from "lucide-react";
import { useCart, type CartItem } from "@/hooks/useCart";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export function CartDrawer() {
  const { items, removeItem, updateQuantity, totalItems } = useCart();
  const WHATSAPP_NUMBER = "5584994085244";

  const handleCheckout = () => {
    if (items.length === 0) return;

    let message = "Olá! Gostaria de finalizar o pedido com os seguintes produtos:\n\n";
    items.forEach((item: CartItem) => {
      message += `• ${item.name} (${item.subtitle})\n`;
      message += `  Qtd: ${item.quantity} x ${item.price}\n\n`;
    });

    const totalPrice = items.reduce((acc: number, item: CartItem) => {
      const priceVal = parseFloat(item.price.replace("R$", "").replace(",", "."));
      return acc + (priceVal * item.quantity);
    }, 0);

    message += `Total: R$ ${totalPrice.toFixed(2).replace(".", ",")}\n`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, "_blank");
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          aria-label="Carrinho"
          className="relative text-foreground/80 transition-transform duration-300 hover:scale-110 cursor-pointer"
        >
          <ShoppingBag className="size-5 stroke-[1.5]" />
          {totalItems() > 0 && (
            <span className="absolute -top-2 -right-2 grid size-4 place-items-center rounded-full bg-pink text-[10px] font-bold text-primary-foreground">
              {totalItems()}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-md z-[100]" side="right">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="flex items-center gap-2 text-pink">
            <ShoppingBag className="size-5" />
            Meu Carrinho
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
            <ShoppingBag className="mb-4 size-12 text-muted-foreground/30" />
            <p className="text-lg font-medium">Seu carrinho está vazio</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Adicione produtos para começar a comprar.
            </p>
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden">
            <ScrollArea className="flex-1 px-6">
              <div className="divide-y divide-border py-4">
                {items.map((item: CartItem) => (
                  <div key={item.name} className="flex gap-4 py-4">
                    <div className="size-20 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-medium leading-tight">{item.name}</h4>
                          <button
                            onClick={() => removeItem(item.name)}
                            className="text-muted-foreground hover:text-destructive cursor-pointer"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-pink">{item.price}</span>
                        <div className="flex items-center gap-2 rounded-full border border-border px-2 py-1">
                          <button
                            onClick={() => updateQuantity(item.name, item.quantity - 1)}
                            className="text-muted-foreground hover:text-pink cursor-pointer"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="min-w-[20px] text-center text-xs font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.name, item.quantity + 1)}
                            className="text-muted-foreground hover:text-pink cursor-pointer"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <SheetFooter className="mt-auto border-t bg-muted/30 px-6 py-6 sm:flex-col">
              <div className="mb-4 flex items-center justify-between text-lg font-bold w-full">
                <span>Total</span>
                <span className="text-pink">
                  R${" "}
                  {items
                    .reduce((acc: number, item: CartItem) => {
                      const priceVal = parseFloat(item.price.replace("R$", "").replace(",", "."));
                      return acc + (priceVal * item.quantity);
                    }, 0)
                    .toFixed(2)
                    .replace(".", ",")}
                </span>
              </div>
              <Button
                onClick={handleCheckout}
                className="h-12 w-full gap-2 rounded-full gradient-pink text-primary-foreground hover:opacity-90 cursor-pointer"
              >
                <MessageSquare className="size-4" />
                Finalizar Pedido no WhatsApp
              </Button>
            </SheetFooter>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
