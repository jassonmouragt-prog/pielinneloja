import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Trophy, Crown, Medal, ShoppingBag, Loader2 } from "lucide-react";
import { getTopSellingProducts } from "@/lib/ranking.queries";
import { publicImageUrl } from "@/lib/storage/public-url";

const podiumStyle = (position: number): {
  bg: string;
  ring: string;
  iconColor: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
} => {
  switch (position) {
    case 0:
      return {
        bg: "bg-gradient-to-br from-yellow-50 to-amber-50",
        ring: "ring-2 ring-yellow-300",
        iconColor: "text-yellow-500",
        icon: Crown,
        label: "1º lugar",
      };
    case 1:
      return {
        bg: "bg-gradient-to-br from-slate-50 to-gray-50",
        ring: "ring-2 ring-slate-300",
        iconColor: "text-slate-500",
        icon: Medal,
        label: "2º lugar",
      };
    case 2:
      return {
        bg: "bg-gradient-to-br from-orange-50 to-amber-50",
        ring: "ring-2 ring-orange-300",
        iconColor: "text-orange-500",
        icon: Medal,
        label: "3º lugar",
      };
    default:
      return {
        bg: "bg-muted",
        ring: "ring-1 ring-border",
        iconColor: "text-muted-foreground",
        icon: Trophy,
        label: "",
      };
  }
};

function resolveImage(product: any): string | null {
  const images = product.product_images ?? [];
  const main = images.find((img: any) => img.is_main || img.isMain);
  const url = (main ?? images[0])?.url;
  if (!url) return null;
  return publicImageUrl(url);
}

export function TopSelling() {
  const getTopFn = useServerFn(getTopSellingProducts);
  const { data: topProducts, isLoading } = useQuery({
    queryKey: ["top-selling"],
    queryFn: () => getTopFn(),
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <section className="bg-cream/30">
        <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:py-14">
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-pink" />
          </div>
        </div>
      </section>
    );
  }

  if (!topProducts || topProducts.length === 0) {
    return null;
  }

  return (
    <section className="bg-cream/30">
      <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:py-14">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Trophy className="size-6 text-yellow-500" />
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            Top 3 mais vendidos do mês 🏆
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:gap-5">
          {topProducts.map((product: any, index: number) => {
            const style = podiumStyle(index);
            const Icon = style.icon;
            const imageUrl = resolveImage(product);

            return (
              <div
                key={product.productId}
                className={`${style.bg} ${style.ring} rounded-xl border border-border overflow-hidden flex flex-col`}
              >
                <div className="relative bg-white/60 p-4">
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full shadow-sm">
                    <Icon className={`size-4 ${style.iconColor}`} />
                    <span className={`text-xs font-bold ${style.iconColor}`}>
                      {style.label}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 bg-pink/10 text-pink text-[10px] font-bold px-2 py-1 rounded-full">
                    {product.totalSold} {product.totalSold === 1 ? "vendido" : "vendidos"}
                  </div>
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.name}
                      loading="lazy"
                      width={400}
                      height={400}
                      className="mx-auto h-40 w-auto object-contain"
                    />
                  ) : (
                    <div className="h-40 grid place-items-center text-muted-foreground text-sm">
                      Sem imagem
                    </div>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-sm font-medium text-foreground line-clamp-2 min-h-[2.5em]">
                    {product.name}
                  </h3>
                  {product.subtitle && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {product.subtitle}
                    </p>
                  )}
                  <div className="mt-auto pt-3 flex items-baseline gap-1.5">
                    <span className="text-base font-bold text-foreground">
                      R$ {Number(product.price).toFixed(2)}
                    </span>
                    <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                      no Pix
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
