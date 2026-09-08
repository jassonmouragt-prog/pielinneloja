import { Link } from "@tanstack/react-router";

export function Hero() {
  return (
    <section className="py-12 lg:py-20">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-4">
        <Link
          to="/colecoes"
          className="group relative block overflow-hidden rounded-3xl shadow-glass"
          aria-label="Ver coleções mais vendidas"
        >
          <img
            src="/hero-banner-v2.png"
            alt="Pielinne Semijoias"
            className="h-[350px] sm:h-[450px] lg:h-[550px] w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent rounded-3xl" />

          <div className="absolute inset-0 flex items-center">
            <div className="px-10 sm:px-16 lg:px-20 max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-white/60 mb-4">
                ✦ Nova Coleção
              </p>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light text-white leading-[1.1]">
                Descubra
                <br />
                <span className="font-serif italic font-normal">Nossas Peças</span>
              </h2>
              <p className="mt-5 text-sm sm:text-base font-light text-white/70 leading-relaxed max-w-md">
                Semijoias elegantes para todos os momentos da sua vida.
              </p>
              <div className="mt-8 inline-flex items-center gap-3 border border-white/30 rounded-full px-6 py-3 text-xs font-medium uppercase tracking-[0.2em] text-white transition-all duration-300 group-hover:bg-white group-hover:text-ink group-hover:border-white">
                Ver Coleções
                <span className="text-white/50 group-hover:text-ink/50 transition-colors">→</span>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}