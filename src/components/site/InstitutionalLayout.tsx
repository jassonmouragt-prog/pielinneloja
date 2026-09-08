import { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

interface InstitutionalLayoutProps {
  children: ReactNode;
  title: string;
}

export function InstitutionalLayout({ children, title }: InstitutionalLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="mx-auto max-w-[800px] px-4 py-10 sm:px-6 sm:py-16">
        <header className="mb-8 text-center sm:mb-12">
          <h1 className="font-serif text-3xl font-semibold text-ink mb-3 sm:text-4xl sm:mb-4">{title}</h1>
          <div className="h-px w-20 bg-silver-deep mx-auto" />
        </header>
        <div className="prose prose-silver max-w-none text-muted-foreground leading-relaxed space-y-6">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}