import { Reveal } from "./Reveal";
import { useQuery } from "@tanstack/react-query";
import { getInstagramPosts } from "@/lib/instagram.functions";
import { Loader2, Instagram } from "lucide-react";

export function InstagramSection() {
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['instagram-posts'],
    queryFn: () => getInstagramPosts(),
    staleTime: 1000 * 60 * 60, // 1 hora
  });

  return (
    <section id="favoritos" className="bg-background">
      <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:py-14">
        <Reveal className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              Siga a <span className="text-pink">@sualojinhamakeup</span>
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Dicas, lançamentos, promoções e muito mais!
            </p>
          </div>
          <a
            href="https://www.instagram.com/sualojinhamakeup/"
            target="_blank"
            rel="noreferrer"
            className="shrink-0 flex items-center gap-2 rounded-md border border-pink-soft px-4 py-2 text-xs font-medium text-pink transition-colors duration-300 hover:bg-blush"
          >
            <Instagram className="size-4" />
            Seguir no Instagram
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