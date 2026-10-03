import { ShoppingCart, X, Plus, Minus, MessageSquare, Loader2, Tag } from "lucide-react";
import { useCart, getCartItemLimit, type CartItem } from "@/hooks/useCart";
import { useHydrated } from "@/hooks/useHydrated";
import { registerPendingSale } from "@/lib/sales.functions";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { useState, useRef } from "react";
import { socialLinks } from "@/lib/site-config";
import { buildOrderMessage } from "@/lib/order-message";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CartDrawer() {
  const { items, removeItem, updateQuantity, totalItems, isOpen, setIsOpen, clearCart } = useCart();
  const hydrated = useHydrated();
  const [isRegistering, setIsRegistering] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [nameError, setNameError] = useState(false);
  const registerSale = useServerFn(registerPendingSale);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const handleCheckout = async () => {
    setNameError(false);
    if (items.length === 0) return;

    if (!customerName.trim()) {
      setNameError(true);
      toast.error("Por favor, informe seu nome para finalizar o pedido.");
      return;
    }

    if (customerName.length > 100) {
      toast.error("O nome deve ter no máximo 100 caracteres.");
      return;
    }

    setIsRegistering(true);

    try {
      const totalPrice = items.reduce((acc: number, item: CartItem) => {
        const priceVal = parseFloat(item.price.replace("R$", "").replace(",", "."));
        return acc + priceVal * item.quantity;
      }, 0);

      const message = buildOrderMessage(items, customerName, totalPrice);

      // 1. Registra no dashboard PRIMEIRO
      await registerSale({
        data: {
          customerName,
          totalAmount: totalPrice,
          whatsappMessage: message,
          items: items.map((item) => ({
            productId: item.id || "",
            quantity: item.quantity,
            price: parseFloat(item.price.replace("R$", "").replace(",", ".")),
            variations: item.selectedVariations,
          })),
        },
      });

      // 2. Só então redireciona para o WhatsApp
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `${socialLinks.whatsapp}?text=${encodedMessage}`;

      // Tenta abrir em nova janela
      const newWindow = window.open(whatsappUrl, "_blank");

      // Se a janela foi bloqueada, tenta redirecionar na mesma aba como fallback
      if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
        window.location.href = whatsappUrl;
      }

      clearCart();
      setIsOpen(false);
      toast.success("Pedido enviado! Aguarde o contato no WhatsApp.");
    } catch (error: unknown) {
      console.error("Error during checkout:", error);
      if (error instanceof Error && error.message === "WHATSAPP_BLOCKED") {
        toast.error(
          "O redirecionamento para o WhatsApp foi bloqueado pelo navegador. Por favor, permita pop-ups.",
        );
      } else {
        toast.error(
          "Erro ao registrar pedido no sistema. Tente novamente ou entre em contato diretamente.",
        );
      }
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Abrir carrinho"
          className="relative grid size-10 shrink-0 place-items-center rounded-full text-ink/80 transition-transform duration-300 hover:scale-110 cursor-pointer focus-visible:outline-2 focus-visible:outline-silver-deep"
        >
          <ShoppingCart className="size-5 stroke-[1.5]" />
          {hydrated && totalItems() > 0 && (
            <span className="absolute top-0 right-0 grid min-w-4 h-4 px-0.5 place-items-center rounded-full bg-silver-deep text-[10px] font-bold text-white">
              {totalItems()}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent
        className="flex w-full h-dvh flex-col p-0 sm:max-w-md z-[100] overflow-y-auto overflow-x-hidden bg-white"
        side="right"
        aria-describedby={undefined}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          titleRef.current?.focus();
        }}
      >
        <SheetHeader className="shrink-0 border-b border-gray-200 px-4 pr-12 py-4 sm:px-6">
          <SheetTitle
            ref={titleRef}
            tabIndex={-1}
            className="flex items-center gap-2 text-silver-deep outline-none"
          >
            <ShoppingCart className="size-5" />
            Meu Carrinho
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
            <ShoppingCart className="mb-4 size-12 text-muted-foreground/30" />
            <p className="text-lg font-medium text-ink">Seu carrinho está vazio</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Adicione produtos para começar a comprar.
            </p>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
            <div className="px-4 sm:px-6">
              <div className="divide-y divide-gray-200 py-4">
                {items.map((item: CartItem) => (
                  <div
                    key={`${item.id ?? item.name}-${JSON.stringify(item.selectedVariations)}`}
                    className="flex gap-3 py-4 sm:gap-4"
                  >
                    <div className="size-16 sm:size-20 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="min-w-0 break-words text-sm font-medium leading-tight text-ink">
                            {item.name}
                          </h4>
                          <button
                            onClick={() => removeItem(item.name, item.selectedVariations)}
                            type="button"
                            aria-label={`Remover ${item.name}`}
                            className="grid size-10 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-destructive cursor-pointer focus-visible:outline-2 focus-visible:outline-silver-deep"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                        <p className="break-words text-xs text-muted-foreground">{item.subtitle}</p>
                        {item.selectedVariations && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Object.entries(item.selectedVariations).map(([key, value]) => (
                              <span
                                key={key}
                                className="inline-flex items-center gap-1 bg-silver-soft text-[10px] text-silver-deep px-2 py-0.5 rounded-full border border-gray-200 font-medium"
                              >
                                <Tag className="size-2" />
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <span className="whitespace-nowrap text-sm font-bold text-silver-deep">
                          {item.price}
                        </span>
                        <div className="flex items-center rounded-full border border-gray-200 bg-white">
                          <button
                            type="button"
                            aria-label="Diminuir quantidade"
                            disabled={item.quantity <= 1}
                            onClick={() =>
                              updateQuantity(item.name, item.quantity - 1, item.selectedVariations)
                            }
                            className="grid size-10 place-items-center rounded-full text-muted-foreground hover:text-silver-deep cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-silver-deep"
                          >
                            <Minus className="size-4" />
                          </button>
                          <span
                            aria-live="polite"
                            className="min-w-[24px] text-center text-sm tabular-nums font-medium text-ink"
                          >
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Aumentar quantidade"
                            disabled={item.quantity >= getCartItemLimit(items, item)}
                            onClick={() =>
                              updateQuantity(item.name, item.quantity + 1, item.selectedVariations)
                            }
                            className="grid size-10 place-items-center rounded-full text-muted-foreground hover:text-silver-deep cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-silver-deep"
                          >
                            <Plus className="size-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <SheetFooter className="mt-auto shrink-0 flex-col border-t border-gray-200 bg-white px-4 py-6 sm:px-6 sm:flex-col sm:space-x-0 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              <div className="mb-4 flex items-center justify-between text-lg font-bold w-full">
                <span className="text-ink">Total</span>
                <span className="text-silver-deep">
                  R${" "}
                  {items
                    .reduce((acc: number, item: CartItem) => {
                      const priceVal = parseFloat(item.price.replace("R$", "").replace(",", "."));
                      return acc + priceVal * item.quantity;
                    }, 0)
                    .toFixed(2)
                    .replace(".", ",")}
                </span>
              </div>
              <div className="mb-6 space-y-2 w-full">
                <Label htmlFor="customerName" className="text-sm font-medium text-ink">
                  Seu Nome
                </Label>
                <Input
                  id="customerName"
                  placeholder="Como gostaria de ser chamado(a)?"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (e.target.value.trim()) setNameError(false);
                  }}
                  className={`rounded-full border-gray-300 focus-visible:ring-silver-deep ${nameError ? "border-red-500 ring-1 ring-red-500" : ""}`}
                />
                {nameError && (
                  <p className="text-[10px] text-red-500 mt-1 ml-2 italic">
                    O nome é obrigatório para finalizar o pedido.
                  </p>
                )}
              </div>
              <Button
                onClick={handleCheckout}
                disabled={isRegistering}
                className="h-12 w-full gap-2 rounded-full bg-silver-deep text-white hover:bg-silver/90 cursor-pointer"
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Enviando para WhatsApp...
                  </>
                ) : (
                  <>
                    <MessageSquare className="size-4" />
                    Finalizar Pedido no WhatsApp
                  </>
                )}
              </Button>
            </SheetFooter>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
