import { createFileRoute } from "@tanstack/react-router";
import { InstitutionalLayout } from "@/components/site/InstitutionalLayout";
import { MessageSquare, Mail, MapPin } from "lucide-react";

export const Route = createFileRoute("/fale-conosco")({
  component: () => (
    <InstitutionalLayout title="Fale Conosco">
      <p className="text-center mb-12">
        Estamos aqui para ajudar! Escolha o canal de sua preferência:
      </p>
      <div className="grid gap-6 sm:grid-cols-3">
        <a
          href="https://wa.me/5584994085244"
          target="_blank"
          className="flex flex-col items-center p-6 bg-cream/50 rounded-xl hover:bg-pink/10 transition-colors border border-pink/10"
        >
          <MessageSquare className="size-8 text-pink mb-3" />
          <span className="font-semibold text-foreground">WhatsApp</span>
          <span className="text-xs text-muted-foreground mt-1">(84) 99408-5244</span>
        </a>
        <div className="flex flex-col items-center p-6 bg-cream/50 rounded-xl border border-pink/10">
          <Mail className="size-8 text-pink mb-3" />
          <span className="font-semibold text-foreground">E-mail</span>
          <span className="text-xs text-muted-foreground mt-1">contato@lojinhamaakeup.com</span>
        </div>
        <div className="flex flex-col items-center p-6 bg-cream/50 rounded-xl border border-pink/10">
          <MapPin className="size-8 text-pink mb-3" />
          <span className="font-semibold text-foreground">Endereço</span>
          <span className="text-xs text-muted-foreground mt-1 text-center italic">
            Natal, RN - Brasil
          </span>
        </div>
      </div>
    </InstitutionalLayout>
  ),
});
