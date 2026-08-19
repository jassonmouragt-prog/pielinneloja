import { ArrowRight, Loader2 } from "lucide-react";
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
    }
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

        <div className="mt-8 grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 lg:grid-cols-7 lg:gap-x-6">
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
                  className="mx-auto grid aspect-square w-full max-w-[112px] place-items-center overflow-hidden rounded-full transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundColor: '#F062921A' }}
                >
                  {(() => {
                    const icons: Record<string, string> = {
                      'maquiagem': '/src/assets/cat-maquiagem.png',
                      'skincare': '/src/assets/cat-skincare.png',
                      'cabelos': '/src/assets/cat-cabelos.png',
                      'corpo': '/src/assets/cat-corpo.png',
                      'kits': '/src/assets/cat-kits.png',
                      'acessorios': '/src/assets/cat-acessorios.png'
                    };
                    const slug = category.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '');
                    const iconUrl = category.image_url || icons[slug];
                    
                    return iconUrl ? (
                      <img
                        src={iconUrl}
                        alt={category.name}
                        loading="lazy"
                        width={512}
                        height={512}
                        className="size-[78%] object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <span className="font-display text-lg font-bold text-primary-foreground italic">
                        NEW
                      </span>
                    );
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