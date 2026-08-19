import { ShoppingBag, X, Check } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface ProductModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { addItem } = useCart();
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});

  const variations = Array.isArray(product?.variations) ? product.variations : [];

  useEffect(() => {
    if (isOpen && variations.length > 0) {
      const initial: Record<string, string> = {};
      variations.forEach((v: any) => {
        if (v.options && v.options.length > 0) {
          initial[v.name] = v.options[0];
        }
      });
      setSelectedVariations(initial);
    }
  }, [isOpen, product]);

  if (!product) return null;

  const mainImage = product.product_images?.find((img: any) => img.is_main)?.url || product.product_images?.[0]?.url;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      subtitle: product.subtitle || '',
      price: `R$ ${Number(product.price).toFixed(2)}`,
      image: mainImage,
      selectedVariations: Object.keys(selectedVariations).length > 0 ? selectedVariations : undefined,
    });
    toast.success("Produto adicionado ao carrinho!");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-4xl p-0 overflow-hidden sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Imagem do Produto */}
          <div className="bg-cream/30 p-8 flex items-center justify-center relative min-h-[300px] md:min-h-[500px]">
            <img
              src={mainImage}
              alt={product.name}
              className="max-h-full max-w-full object-contain drop-shadow-xl animate-fade-up"
            />
          </div>

          {/* Detalhes do Produto */}
          <div className="p-8 flex flex-col justify-center">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                  {product.name}
                </h2>
                {product.subtitle && (
                  <p className="text-lg text-muted-foreground mt-1">
                    {product.subtitle}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-pink">
                  R$ {Number(product.price).toFixed(2)}
                </span>
                {product.stock <= 5 && product.stock > 0 && (
                  <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Apenas {product.stock} em estoque
                  </span>
                )}
              </div>

              <div className="prose prose-sm text-muted-foreground">
                <p className="leading-relaxed">
                  {product.description || "Sem descrição disponível para este produto."}
                </p>
              </div>

              {variations.length > 0 && (
                <div className="space-y-4 py-4 border-t border-border">
                  {variations.map((variation: any) => (
                    <div key={variation.name} className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">
                        {variation.name}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {variation.options.map((option: string) => {
                          const isSelected = selectedVariations[variation.name] === option;
                          return (
                            <button
                              key={option}
                              onClick={() => setSelectedVariations(prev => ({ ...prev, [variation.name]: option }))}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                                isSelected
                                  ? "bg-pink border-pink text-white shadow-sm"
                                  : "bg-white border-border text-muted-foreground hover:border-pink/50"
                              }`}
                            >
                              <span className="flex items-center gap-1">
                                {isSelected && <Check className="size-3" />}
                                {option}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-6 border-t border-border">
                <Button
                  onClick={handleAddToCart}
                  className="w-full h-12 gradient-pink text-primary-foreground font-bold rounded-xl gap-3 shadow-lg hover:opacity-90 transition-all active:scale-[0.98]"
                >
                  <ShoppingBag className="size-5" />
                  Adicionar ao Carrinho
                </Button>
                
                <p className="mt-4 text-center text-xs text-muted-foreground">
                  Finalize sua compra pelo WhatsApp após adicionar os produtos ao carrinho.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
