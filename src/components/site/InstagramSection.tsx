import { instagramPosts } from "./data";
import { Reveal } from "./Reveal";

export function InstagramSection() {
  return (
    <section id="novidades" className="bg-background">
      <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:py-14">
        <Reveal className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              Siga a <span className="text-pink">@sualojinhamaakeup</span>
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Dicas, lançamentos, promoções e muito mais!
            </p>
          </div>
          <a
            href="https://instagram.com/sualojinhamaakeup"
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded-md border border-pink-soft px-4 py-2 text-xs font-medium text-pink transition-colors duration-300 hover:bg-blush"
          >
            Seguir no Instagram
          </a>
        </Reveal>

        <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">
          {instagramPosts.map((post, index) => (
            <Reveal key={post.alt} delay={index * 60}>
              <a
                href="https://instagram.com/sualojinhamaakeup"
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden rounded-lg"
              >
                <img
                  src={post.image}
                  alt={post.alt}
                  loading="lazy"
                  width={560}
                  height={700}
                  className="aspect-[4/5] w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}