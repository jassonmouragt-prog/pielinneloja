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
          <h1 className="text-4xl font-bold text-foreground mb-4">{title}</h1>
          <div className="h-1.5 w-20 bg-pink mx-auto rounded-full" />
        </header>
        <div className="prose prose-pink max-w-none text-muted-foreground leading-relaxed space-y-6">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
