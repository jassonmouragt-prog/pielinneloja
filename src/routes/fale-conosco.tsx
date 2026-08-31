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
          href="https://wa.me/5541985073920"
          target="_blank"
          className="flex flex-col items-center p-6 bg-beige/50 rounded-xl hover:bg-gold/10 transition-colors border border-gold/20"
        >
          <MessageSquare className="size-8 text-gold-deep mb-3" />
          <span className="font-semibold text-foreground">WhatsApp</span>
          <span className="text-xs text-muted-foreground mt-1">(41) 98507-3920</span>
        </a>
        <div className="flex flex-col items-center p-6 bg-beige/50 rounded-xl border border-gold/20">
          <Mail className="size-8 text-gold-deep mb-3" />
          <span className="font-semibold text-foreground">E-mail</span>
          <span className="text-xs text-muted-foreground mt-1">contato@pielinne.com</span>
        </div>
        <div className="flex flex-col items-center p-6 bg-beige/50 rounded-xl border border-gold/20">
          <MapPin className="size-8 text-gold-deep mb-3" />
          <span className="font-semibold text-foreground">Endereço</span>
          <span className="text-xs text-muted-foreground mt-1 text-center italic">
            Foz do Iguaçu &amp; Curitiba, PR - Brasil
          </span>
        </div>
      </div>
    </InstitutionalLayout>
  ),
});
