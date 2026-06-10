import { ShoppingCart } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/states/empty-state";

export default function VendasPage() {
  return (
    <main className="space-y-6">
      <PageHeader
        title="Vendas"
        description="Area reservada para futuros fluxos de venda e atendimento operacional."
      />
      <EmptyState
        title="Modulo de vendas em preparacao"
        description="Esta tela nao registra vendas nem valida estoque. Esses fluxos serao entregues em uma feature operacional dedicada."
        icon={<ShoppingCart className="h-5 w-5" aria-hidden />}
      />
    </main>
  );
}
