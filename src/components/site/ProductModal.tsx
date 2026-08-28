import { ShoppingBag, Check, Package, AlertCircle } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";
import { publicImageUrl } from "@/lib/storage/public-url";

interface ProductModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

function resolveProductImage(product: any): string | null {
  const images = product?.product_images ?? product?.productImages ?? [];
  const main = images.find((img: any) => img.is_main || img.isMain);
  const url = (main ?? images[0])?.url;
  if (!url) return null;
  return publicImageUrl(url);
}

interface VariationOption {
  id?: string;
  name: string;
  options: string[];
  stockByOption?: Record<string, number>;
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { addItem } = useCart();
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});

  const variations: VariationOption[] = useMemo(() => {
    if (!product?.variations) return [];
    if (Array.isArray(product.variations)) return product.variations;
    return [];
  }, [product]);

  const hasVariations = variations.length > 0;

  useEffect(() => {
    if (isOpen) {
      setSelectedVariations({});
    }
  }, [isOpen, product]);

  if (!product) return null;

  const mainImage = resolveProductImage(product);
  const stock = product.stockQuantity ?? product.stock ?? 0;

  const getOptionStock = (varName: string, optValue: string): number | null => {
    const v = variations.find((vv) => vv.name === varName);
    if (!v?.stockByOption) return null;
    return v.stockByOption[optValue] ?? null;
  };

  const isComplete = !hasVariations ||
    variations.every((v) => selectedVariations[v.name]);

  const isAnyOutOfStock = hasVariations &&
    Object.entries(selectedVariations).some(([name, value]) => {
      const s = getOptionStock(name, value);
      return s !== null && s <= 0;
    });

  const handleAddToCart = () => {
    if (hasVariations) {
      const missing = variations.filter((v) => !selectedVariations[v.name]);
      if (missing.length > 0) {
        toast.error(`Selecione: ${missing.map((m) => m.name).join(", ")}`);
        return;
      }
      const outOfStock = Object.entries(selectedVariations).find(([name, value]) => {
        const s = getOptionStock(name, value);
        return s !== null && s <= 0;
      });
      if (outOfStock) {
        toast.error(`"${outOfStock[0]}: ${outOfStock[1]}" está esgotado.`);
        return;
      }
    }

    addItem({
      id: product.id,
      name: product.name,
      subtitle: product.subtitle || "",
      price: `R$ ${Number(product.price).toFixed(2)}`,
      image: mainImage || "",
      selectedVariations: hasVariations ? selectedVariations : undefined,
    });
    toast.success("Produto adicionado ao carrinho!");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-4xl p-0 overflow-hidden sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="bg-cream/30 p-8 flex items-center justify-center relative min-h-[300px] md:min-h-[500px]">
            {mainImage ? (
              <img
                src={mainImage}
                alt={product.name}
                className="max-h-full max-w-full object-contain drop-shadow-xl animate-fade-up"
              />
            ) : (
              <div className="text-muted-foreground text-sm">Sem imagem</div>
            )}
          </div>

          <div className="p-6 sm:p-8 flex flex-col">
            <div className="space-y-4 flex-1">
              <div>
                <h2 className="text-2xl font-bold text-foreground sm:text-3xl">{product.name}</h2>
                {product.subtitle && (
                  <p className="text-base text-muted-foreground mt-1">{product.subtitle}</p>
                )}
              </div>

              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-3xl font-bold text-pink">
                  R$ {Number(product.price).toFixed(2)}
                </span>
                <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                  💰 no Pix
                </span>
              </div>

              {stock > 0 && stock <= 5 && (
                <div className="flex items-center gap-1.5 text-xs">
                  <AlertCircle className="size-3.5 text-yellow-600" />
                  <span className="text-yellow-700 font-semibold">Apenas {stock} em estoque</span>
                </div>
              )}

              {product.description && (
                <div className="prose prose-sm text-muted-foreground">
                  <p className="leading-relaxed text-sm">{product.description}</p>
                </div>
              )}

              {hasVariations && (
                <div className="space-y-4 py-4 border-t border-border">
                  {variations.map((variation) => (
                    <div key={variation.name} className="space-y-2">
                      <label className="text-sm font-semibold text-foreground flex items-center justify-between">
                        <span>
                          {variation.name}
                          {selectedVariations[variation.name] && (
                            <span className="text-pink font-bold ml-1.5">
                              — {selectedVariations[variation.name]}
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-normal">obrigatório</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {variation.options.map((option) => {
                          const optStock = getOptionStock(variation.name, option);
                          const isSelected = selectedVariations[variation.name] === option;
                          const isOut = optStock !== null && optStock <= 0;
                          return (
                            <button
                              key={option}
                              type="button"
                              disabled={isOut}
                              onClick={() =>
                                setSelectedVariations((prev) => ({
                                  ...prev,
                                  [variation.name]: option,
                                }))
                              }
                              className={`relative px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                                isSelected
                                  ? "bg-pink border-pink text-white shadow-sm"
                                  : isOut
                                    ? "bg-muted border-border text-muted-foreground line-through opacity-60 cursor-not-allowed"
                                    : "bg-white border-border text-foreground hover:border-pink/50"
                              }`}
                            >
                              <span className="flex items-center gap-1.5">
                                {isSelected && <Check className="size-3" />}
                                {option}
                                {optStock !== null && optStock > 0 && optStock <= 3 && (
                                  <span className={`text-[9px] ${isSelected ? "text-white/80" : "text-yellow-600"}`}>
                                    ({optStock})
                                  </span>
                                )}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4 border-t border-border">
                <Button
                  onClick={handleAddToCart}
                  disabled={!isComplete || isAnyOutOfStock}
                  className="w-full h-12 gradient-pink text-primary-foreground font-bold rounded-xl gap-3 shadow-lg hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="size-5" />
                  {hasVariations
                    ? isComplete
                      ? "Adicionar ao Carrinho"
                      : "Selecione as opções"
                    : "Adicionar ao Carrinho"}
                </Button>

                <p className="mt-3 text-center text-xs text-muted-foreground">
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
