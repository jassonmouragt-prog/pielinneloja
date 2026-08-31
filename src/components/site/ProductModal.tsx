import { ShoppingBag, Check, AlertCircle, Package, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  name: string;
  options: string[];
  stockByOption?: Record<string, number>;
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { addItem } = useCart();
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  const variations: VariationOption[] = useMemo(() => {
    if (!product?.variations) return [];
    if (Array.isArray(product.variations)) return product.variations;
    return [];
  }, [product]);

  const hasVariations = variations.length > 0;

  useEffect(() => {
    if (isOpen) {
      setSelectedVariations({});
      setQuantity(1);
    }
  }, [isOpen, product]);

  if (!product) return null;

  const mainImage = resolveProductImage(product);
  const totalStock = product.stockQuantity ?? product.stock ?? 0;

  const getOptionStock = (varName: string, optValue: string): number | null => {
    const v = variations.find((vv) => vv.name === varName);
    if (!v?.stockByOption) return null;
    return v.stockByOption[optValue] ?? null;
  };

  const isComplete = !hasVariations || variations.every((v) => selectedVariations[v.name]);

  const selectedMaxStock = (() => {
    if (!hasVariations) return totalStock;
    let min = Infinity;
    for (const [name, value] of Object.entries(selectedVariations)) {
      const s = getOptionStock(name, value);
      if (s === null) continue;
      if (s < min) min = s;
    }
    return min === Infinity ? null : min;
  })();

  const isAnyOutOfStock =
    hasVariations &&
    Object.entries(selectedVariations).some(([name, value]) => {
      const s = getOptionStock(name, value);
      return s !== null && s <= 0;
    });

  const effectiveMax = selectedMaxStock ?? totalStock;
  const safeQuantity = Math.min(Math.max(1, quantity), Math.max(1, effectiveMax));

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

    if (safeQuantity > effectiveMax) {
      toast.error(`Quantidade indisponível. Máximo: ${effectiveMax}`);
      return;
    }

    addItem(
      {
        id: product.id,
        name: product.name,
        subtitle: product.subtitle || "",
        price: `R$ ${Number(product.price).toFixed(2)}`,
        image: mainImage || "",
        selectedVariations: hasVariations ? selectedVariations : undefined,
      },
      safeQuantity,
    );
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
                </div>

              {!hasVariations && totalStock > 0 && totalStock <= 5 && (
                <div className="flex items-center gap-1.5 text-xs">
                  <AlertCircle className="size-3.5 text-yellow-600" />
                  <span className="text-yellow-700 font-semibold">
                    Apenas {totalStock} em estoque
                  </span>
                </div>
              )}

              {hasVariations && isComplete && selectedMaxStock !== null && (
                <div
                  className={`flex items-center gap-1.5 text-xs ${selectedMaxStock <= 3 ? "text-yellow-700" : "text-muted-foreground"}`}
                >
                  <Package className="size-3.5" />
                  <span className="font-semibold">
                    {selectedMaxStock > 0
                      ? selectedMaxStock <= 3
                        ? `Apenas ${selectedMaxStock} em estoque`
                        : `${selectedMaxStock} em estoque`
                      : "Esgotado"}
                  </span>
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
                        <span className="text-[10px] text-muted-foreground font-normal">
                          obrigatório
                        </span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {variation.options.map((option) => {
                          const optStock = getOptionStock(variation.name, option);
                          const isSelected = selectedVariations[variation.name] === option;
                          const hasStockInfo = optStock !== null;
                          const isOut = hasStockInfo && optStock <= 0;
                          const isLow = hasStockInfo && optStock > 0 && optStock <= 3;
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
                              className={`relative px-3 py-2 rounded-lg text-xs font-medium transition-all border flex flex-col items-center gap-0.5 ${
                                isSelected
                                  ? "bg-pink border-pink text-white shadow-sm"
                                  : isOut
                                    ? "bg-muted/50 border-border text-muted-foreground cursor-not-allowed"
                                    : "bg-white border-border text-foreground hover:border-pink/50"
                              }`}
                            >
                              <span className="flex items-center gap-1.5">
                                {isSelected && <Check className="size-3" />}
                                {isOut && <X className="size-3" />}
                                <span className={isOut ? "line-through" : ""}>{option}</span>
                              </span>
                              {hasStockInfo && (
                                <span
                                  className={`text-[10px] font-normal ${
                                    isSelected
                                      ? "text-white/80"
                                      : isOut
                                        ? "text-red-500"
                                        : isLow
                                          ? "text-yellow-600"
                                          : "text-muted-foreground"
                                  }`}
                                >
                                  {isOut ? "Esgotado" : `${optStock} em estoque`}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {effectiveMax > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Quantidade</label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={safeQuantity <= 1}
                      className="h-10 w-10"
                    >
                      −
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      max={effectiveMax}
                      value={safeQuantity}
                      onChange={(e) => {
                        const v = parseInt(e.target.value) || 1;
                        setQuantity(Math.min(Math.max(1, v), effectiveMax));
                      }}
                      className="h-10 w-20 text-center text-base font-bold"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity((q) => Math.min(effectiveMax, q + 1))}
                      disabled={safeQuantity >= effectiveMax}
                      className="h-10 w-10"
                    >
                      +
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {effectiveMax} {effectiveMax === 1 ? "disponível" : "disponíveis"}
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-border">
                <Button
                  onClick={handleAddToCart}
                  disabled={!isComplete || isAnyOutOfStock || effectiveMax <= 0}
                  className="w-full h-12 gradient-pink text-primary-foreground font-bold rounded-xl gap-3 shadow-lg hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="size-5" />
                  {effectiveMax <= 0
                    ? "Esgotado"
                    : !isComplete
                      ? "Selecione as opções"
                      : safeQuantity > 1
                        ? `Adicionar ${safeQuantity} ao carrinho`
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
