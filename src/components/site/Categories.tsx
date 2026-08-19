import { ArrowRight, Loader2, Sparkles, Heart, Wind, Flower2, Gift, Scissors, ShoppingBag } from "lucide-react";
import { Reveal } from "./Reveal";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@tanstack/react-router";


export function Categories() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['public-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });

  return (
    <section id="maquiagem" className="bg-cream">
      <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:py-14">
        <Reveal className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            Categorias em destaque
          </h2>
          <a
            href="#categorias"
            className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground transition-colors duration-300 hover:text-pink"
          >
            Ver todas <ArrowRight className="size-3.5" />
          </a>
        </Reveal>

        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-6 xs:grid-cols-4 sm:gap-x-4 sm:gap-y-8 lg:grid-cols-7 lg:gap-x-6">
          {isLoading && (
            <div className="col-span-full flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-pink" />
            </div>
          )}
          {categories?.map((category, index) => (
            <Reveal key={category.id} delay={index * 60}>
              <Link 
                to="/categoria/$slug" 
                params={{ slug: category.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-') }}
                className="group block text-center"
              >
                <div
                  className="mx-auto grid aspect-square w-full max-w-[80px] xs:max-w-[100px] sm:max-w-[112px] place-items-center overflow-hidden rounded-full transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundColor: '#E84688' }}
                >
                  {(() => {
                    const icons: Record<string, React.ReactNode> = {
                      'maquiagem': <Sparkles className="size-[50%] text-white" />,
                      'skincare': <Heart className="size-[50%] text-white" />,
                      'cabelos': <Wind className="size-[50%] text-white" />,
                      'corpo': <Flower2 className="size-[50%] text-white" />,
                      'kits': <Gift className="size-[50%] text-white" />,
                      'acessorios': <Scissors className="size-[50%] text-white" />,
                      'perfumaria': <ShoppingBag className="size-[50%] text-white" />
                    };
                    const slug = category.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '');
                    
                    if (category.image_url) {
                      return (
                        <img
                          src={category.image_url}
                          alt={category.name}
                          loading="lazy"
                          width={512}
                          height={512}
                          className="size-[78%] object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                      );
                    }

                    return icons[slug] || <Sparkles className="size-[50%] text-white" />;
                  })()}
                </div>
                <p className="mt-3 text-xs font-medium text-foreground sm:text-sm">
                  {category.name}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}