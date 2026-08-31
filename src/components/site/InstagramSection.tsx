import { Reveal } from "./Reveal";
import { useQuery } from "@tanstack/react-query";
import { getInstagramPosts } from "@/lib/instagram.functions";
import { Loader2, Instagram } from "lucide-react";

export function InstagramSection() {
  const {
    data: posts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["instagram-posts"],
    queryFn: () => getInstagramPosts(),
    staleTime: 1000 * 60 * 60, // 1 hora
  });

  return (
    <section id="favoritos" className="bg-background">
      <div className="mx-auto max-w-[1400px] px-6 py-20 lg:px-[60px] lg:py-28">
        <Reveal className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="mb-3 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-gold-deep">
              <span className="inline-block h-px w-10 bg-gold-deep" />
              Instagram
            </p>
            <h2 className="font-serif text-3xl font-semibold text-ink sm:text-4xl">
              Siga a <span className="italic text-gold-deep">@pielinne_semijoias</span>
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Novidades, dicas de uso e lançamentos no nosso feed!
            </p>
          </div>
          <a
            href="https://www.instagram.com/pielinne_semijoias/"
            target="_blank"
            rel="noreferrer"
            className="shrink-0 flex items-center gap-2 border border-gold/50 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-gold-deep transition-colors duration-300 hover:bg-gold hover:text-ink"
          >
            <Instagram className="size-4" />
            Seguir
          </a>
        </Reveal>

        {isLoading ? (
          <div className="mt-10 flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-pink" />
          </div>
        ) : error || !posts || posts.length === 0 ? (
          <div className="mt-10 text-center py-10 border border-dashed rounded-lg bg-muted/30">
            <p className="text-muted-foreground italic text-sm">
              Conecte o Token de Acesso do Instagram no painel para visualizar o feed real.
            </p>
          </div>
        ) : (
          <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">
            {posts.slice(0, 10).map((post, index) => (
              <Reveal key={post.id} delay={index * 60}>
                <a
                  href={post.permalink}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative block overflow-hidden rounded-lg aspect-[4/5]"
                >
                  <img
                    src={(post as any).display_url || post.media_url}
                    alt={post.caption || "Instagram post"}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Instagram className="text-white size-8" />
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
