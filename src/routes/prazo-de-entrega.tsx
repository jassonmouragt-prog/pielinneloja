import { createFileRoute } from "@tanstack/react-router";
import { InstitutionalLayout } from "@/components/site/InstitutionalLayout";

export const Route = createFileRoute("/prazo-de-entrega")({
  component: () => (
    <InstitutionalLayout title="Prazo de Entrega">
      <p>Entregamos em todo o Brasil! O prazo varia de acordo com a sua região:</p>
      <div className="mt-8 overflow-hidden rounded-lg border border-pink/20">
        <table className="w-full text-sm text-left">
          <thead className="bg-cream text-foreground uppercase text-[10px] font-bold">
            <tr>
              <th className="px-4 py-3 border-b border-pink/10">Região</th>
              <th className="px-4 py-3 border-b border-pink/10">Prazo Estimado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pink/10">
            <tr>
              <td className="px-4 py-3">Nordeste</td>
              <td className="px-4 py-3">2 a 5 dias úteis</td>
            </tr>
            <tr>
              <td className="px-4 py-3">Demais Regiões</td>
              <td className="px-4 py-3">7 a 15 dias úteis</td>
            </tr>
          </tbody>
        </table>
      </div>
    </InstitutionalLayout>
  ),
});
