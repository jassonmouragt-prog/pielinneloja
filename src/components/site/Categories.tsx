import { ArrowRight, Loader2, Sparkles, Eye, Heart, Wind, Flower2, Gift, Scissors, ShoppingBag, Hand, Smile, Brush, Droplet, SprayCan, Gem } from "lucide-react";
import { Reveal } from "./Reveal";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { listCategories } from "@/lib/queries.queries";
import { publicImageUrl } from "@/lib/storage/public-url";

type IconComponent = React.ComponentType<{ className?: string }>;

interface CategoryTheme {
  icon: IconComponent;
  bg: string;
  hoverBg: string;
  text: string;
  border: string;
}

const THEME_BY_NAME: Record<string, CategoryTheme> = {
  "pele": {
    icon: Sparkles,
    bg: "bg-gradient-to-br from-pink-50 to-rose-50",
    hoverBg: "group-hover:from-pink-100 group-hover:to-rose-100",
    text: "text-pink-600",
    border: "border-pink-100",
  },
  "olhos": {
    icon: Eye,
    bg: "bg-gradient-to-br from-purple-50 to-fuchsia-50",
    hoverBg: "group-hover:from-purple-100 group-hover:to-fuchsia-100",
    text: "text-purple-600",
    border: "border-purple-100",
  },
  "labios": {
    icon: Heart,
    bg: "bg-gradient-to-br from-red-50 to-rose-50",
    hoverBg: "group-hover:from-red-100 group-hover:to-rose-100",
    text: "text-red-500",
    border: "border-red-100",
  },
  "sobrancelhas": {
    icon: Brush,
    bg: "bg-gradient-to-br from-amber-50 to-yellow-50",
    hoverBg: "group-hover:from-amber-100 group-hover:to-yellow-100",
    text: "text-amber-700",
    border: "border-amber-100",
  },
  "perfumaria": {
    icon: SprayCan,
    bg: "bg-gradient-to-br from-indigo-50 to-violet-50",
    hoverBg: "group-hover:from-indigo-100 group-hover:to-violet-100",
    text: "text-indigo-600",
    border: "border-indigo-100",
  },
  "skincare": {
    icon: Droplet,
    bg: "bg-gradient-to-br from-sky-50 to-cyan-50",
    hoverBg: "group-hover:from-sky-100 group-hover:to-cyan-100",
    text: "text-sky-600",
    border: "border-sky-100",
  },
  "cabelos": {
    icon: Wind,
    bg: "bg-gradient-to-br from-emerald-50 to-teal-50",
    hoverBg: "group-hover:from-emerald-100 group-hover:to-teal-100",
    text: "text-emerald-600",
    border: "border-emerald-100",
  },
  "corpo": {
    icon: Hand,
    bg: "bg-gradient-to-br from-orange-50 to-amber-50",
    hoverBg: "group-hover:from-orange-100 group-hover:to-amber-100",
    text: "text-orange-600",
    border: "border-orange-100",
  },
  "acessorios": {
    icon: Gem,
    bg: "bg-gradient-to-br from-fuchsia-50 to-pink-50",
    hoverBg: "group-hover:from-fuchsia-100 group-hover:to-pink-100",
    text: "text-fuchsia-600",
    border: "border-fuchsia-100",
  },
};

const DEFAULT_THEME: CategoryTheme = {
  icon: Sparkles,
  bg: "bg-gradient-to-br from-pink-50 to-rose-50",
  hoverBg: "group-hover:from-pink-100 group-hover:to-rose-100",
  text: "text-pink-600",
  border: "border-pink-100",
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");
}

function getTheme(name: string): CategoryTheme {
  return THEME_BY_NAME[slugify(name)] ?? DEFAULT_THEME;
}

export function Categories() {
  const listCategoriesFn = useServerFn(listCategories);
  const { data: categories, isLoading } = useQuery({
    queryKey: ['public-categories'],
    queryFn: async () => listCategoriesFn(),
    staleTime: 1000 * 60 * 60,
  });

  return (
    <section id="categorias" className="bg-cream">
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

        <div className="mt-8 grid grid-cols-2 gap-3 xs:grid-cols-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 lg:gap-5">
          {isLoading && (
            <div className="col-span-full flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-pink" />
            </div>
          )}
          {categories?.map((category: any, index: number) => {
            const theme = getTheme(category.name);
            const Icon = theme.icon;
            const slug = slugify(category.name);
            const imageUrl = publicImageUrl(category.imageUrl);

            return (
              <Reveal key={category.id} delay={index * 60}>
                <Link
                  to="/categoria/$slug"
                  params={{ slug }}
                  className="group block text-center"
                >
                  <div
                    className={`mx-auto grid aspect-square w-full max-w-[110px] sm:max-w-[130px] place-items-center overflow-hidden rounded-2xl border ${theme.bg} ${theme.border} ${theme.hoverBg} transition-all duration-300 group-hover:scale-105 group-hover:shadow-md`}
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={category.name}
                        loading="lazy"
                        width={200}
                        height={200}
                        className="size-[70%] object-contain transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <Icon className={`size-[40%] ${theme.text} transition-transform duration-300 group-hover:scale-110`} />
                    )}
                  </div>
                  <p className="mt-2.5 text-xs font-semibold text-foreground sm:text-sm group-hover:text-pink transition-colors">
                    {category.name}
                  </p>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
