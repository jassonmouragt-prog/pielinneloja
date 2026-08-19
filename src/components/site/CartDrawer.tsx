import { ShoppingBag, X, Plus, Minus, MessageSquare, Loader2, Tag } from "lucide-react";
import { useCart, type CartItem } from "@/hooks/useCart";
import { useHydrated } from "@/hooks/useHydrated";
import { registerPendingSale } from "@/lib/sales.functions";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CartDrawer() {
  const { items, removeItem, updateQuantity, totalItems, isOpen, setIsOpen, clearCart } = useCart();
  const hydrated = useHydrated();
  const [isRegistering, setIsRegistering] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [nameError, setNameError] = useState(false);
  const registerSale = useServerFn(registerPendingSale);
  const WHATSAPP_NUMBER = "5584994085244";

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
        return acc + (priceVal * item.quantity);
      }, 0);

      let message = `Olá! Meu nome é ${customerName}. Gostaria de finalizar o pedido com os seguintes produtos:\n\n`;
      items.forEach((item: CartItem) => {
        message += `• ${item.name} (${item.subtitle})\n`;
        if (item.selectedVariations) {
          const variationsStr = Object.entries(item.selectedVariations)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
          message += `  Variações: ${variationsStr}\n`;
        }
        message += `  Qtd: ${item.quantity} x ${item.price}\n\n`;
      });
      message += `Total: R$ ${totalPrice.toFixed(2).replace(".", ",")}\n`;

      const encodedMessage = encodeURIComponent(message);
      
      // 1. Registra no dashboard PRIMEIRO
      await registerSale({
        data: {
          customerName,
          totalAmount: totalPrice,
          whatsappMessage: message,
          items: items.map(item => ({
            productId: item.id || '',
            quantity: item.quantity,
            price: parseFloat(item.price.replace("R$", "").replace(",", ".")),
            variations: item.selectedVariations
          }))
        }
      });

      // 2. Só então redireciona para o WhatsApp
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
      
      // Tenta abrir em nova janela
      const newWindow = window.open(whatsappUrl, "_blank");
      
      // Se a janela foi bloqueada, tenta redirecionar na mesma aba como fallback
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        window.location.href = whatsappUrl;
      }
      
      clearCart();
      setIsOpen(false);
      toast.success("Pedido enviado! Aguarde o contato no WhatsApp.");
    } catch (error: any) {
      console.error("Error during checkout:", error);
      if (error.message === "WHATSAPP_BLOCKED") {
        toast.error("O redirecionamento para o WhatsApp foi bloqueado pelo navegador. Por favor, permita pop-ups.");
      } else {
        toast.error("Erro ao registrar pedido no sistema. Tente novamente ou entre em contato diretamente.");
      }
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          aria-label="Carrinho"
          className="relative text-foreground/80 transition-transform duration-300 hover:scale-110 cursor-pointer"
        >
          <ShoppingBag className="size-5 stroke-[1.5]" />
          {hydrated && totalItems() > 0 && (
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
                            onClick={() => removeItem(item.name, item.selectedVariations)}
                            className="text-muted-foreground hover:text-destructive cursor-pointer"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                        {item.selectedVariations && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Object.entries(item.selectedVariations).map(([key, value]) => (
                              <span key={key} className="inline-flex items-center gap-1 bg-pink/5 text-[10px] text-pink px-2 py-0.5 rounded-full border border-pink/10 font-medium">
                                <Tag className="size-2" />
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-pink">{item.price}</span>
                        <div className="flex items-center gap-2 rounded-full border border-border px-2 py-1">
                          <button
                            onClick={() => updateQuantity(item.name, item.quantity - 1, item.selectedVariations)}
                            className="text-muted-foreground hover:text-pink cursor-pointer"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="min-w-[20px] text-center text-xs font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.name, item.quantity + 1, item.selectedVariations)}
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
              <div className="mb-6 space-y-2 w-full">
                <Label htmlFor="customerName" className="text-sm font-medium">Seu Nome</Label>
                <Input
                  id="customerName"
                  placeholder="Como gostaria de ser chamado(a)?"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (e.target.value.trim()) setNameError(false);
                  }}
                  className={`rounded-full border-pink/30 focus-visible:ring-pink ${nameError ? "border-red-500 ring-1 ring-red-500" : ""}`}
                />
                {nameError && (
                  <p className="text-[10px] text-red-500 mt-1 ml-2 italic">O nome é obrigatório para finalizar o pedido.</p>
                )}
              </div>
              <Button
                onClick={handleCheckout}
                disabled={isRegistering}
                className="h-12 w-full gap-2 rounded-full gradient-pink text-primary-foreground hover:opacity-90 cursor-pointer"
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
