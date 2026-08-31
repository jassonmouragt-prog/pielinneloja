import { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

interface InstitutionalLayoutProps {
  children: ReactNode;
  title: string;
}

export function InstitutionalLayout({ children, title }: InstitutionalLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-[800px] px-4 py-16 sm:px-6">
        <header className="mb-12 text-center">
          <h1 className="font-serif text-4xl font-semibold text-foreground mb-4">{title}</h1>
          <div className="h-px w-20 bg-gold mx-auto" />
        </header>
        <div className="prose prose-gold max-w-none text-muted-foreground leading-relaxed space-y-6">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
