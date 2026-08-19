import { Reveal } from "./Reveal";
import feedAsset from "@/assets/instagram/feed.png.asset.json";

export function InstagramSection() {
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
            className="shrink-0 rounded-md border border-pink-soft px-4 py-2 text-xs font-medium text-pink transition-colors duration-300 hover:bg-blush"
          >
            Seguir no Instagram
          </a>
        </Reveal>

        <Reveal delay={100} className="mt-7">
          <a
            href="https://www.instagram.com/sualojinhamakeup/"
            target="_blank"
            rel="noreferrer"
            className="block overflow-hidden rounded-xl border border-border/50 shadow-sm transition-all duration-300 hover:shadow-md"
          >
            <img
              src={feedAsset.url}
              alt="Instagram Feed @sualojinhamakeup"
              loading="lazy"
              className="w-full object-cover"
            />
          </a>
        </Reveal>
      </div>
    </section>
  );
}