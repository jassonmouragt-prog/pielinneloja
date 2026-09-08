import { Loader2, Gem, Circle, CircleDot, Ear } from "lucide-react";
import { Reveal } from "./Reveal";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { listCategories } from "@/lib/queries.queries";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");
}

const CATEGORY_ICONS: Record<string, any> = {
  brincos: Ear,
  colares: Gem,
  pulseiras: Circle,
  anéis: CircleDot,
  aneis: CircleDot,
};

function getIcon(name: string) {
  const slug = slugify(name);
  if (CATEGORY_ICONS[slug]) return CATEGORY_ICONS[slug];
  return Gem;
}

const FEATURED = ["Brincos", "Colares", "Pulseiras", "Anéis"];

export function Categories() {
  const listCategoriesFn = useServerFn(listCategories);
  const { data: categories, isLoading } = useQuery({
    queryKey: ["public-categories"],
    queryFn: async () => listCategoriesFn(),
    staleTime: 1000 * 60 * 60,
  });

  const ordered = FEATURED.map((name) =>
    (categories ?? []).find((c: any) => c.name === name),
  ).filter(Boolean);

  const display = ordered.length > 0 ? ordered : (categories ?? []).slice(0, 4);

  return (
    <section id="categorias" className="bg-gradient-hero">
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-[60px] lg:py-12">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-7 w-7 animate-spin text-silver-deep" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-y-8 md:grid-cols-4 md:gap-0 md:divide-x md:divide-gray-200">
            {display.map((category: any, index: number) => {
              const Icon = getIcon(category.name);
              const slug = slugify(category.name);
              return (
                <Reveal key={category.id} delay={index * 60} className="flex">
                  <Link
                    to="/categoria/$slug"
                    params={{ slug }}
                    className="group flex w-full flex-col items-center justify-center gap-3 px-4 py-6 text-center glass rounded-2xl hover:glass-strong transition-all duration-300 md:py-4"
                  >
                    <Icon
                      className="size-9 stroke-[1.2] text-silver-deep transition-transform duration-300 group-hover:scale-110"
                      strokeWidth={1.2}
                    />
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-ink transition-colors duration-300 group-hover:text-silver-deep">
                      {category.name}
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}