import { ClipboardList } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/states/empty-state";

export default function ComprasPage() {
  return (
    <main className="space-y-6">
      <PageHeader
        title="Compras"
        description="Area reservada para futuros fluxos de compras, recebimentos e acompanhamento operacional."
      />
      <EmptyState
        title="Modulo de compras em preparacao"
        description="A rota existe para validar navegacao e layout. Nenhuma compra, recebimento ou regra operacional e executada nesta fase."
        icon={<ClipboardList className="h-5 w-5" aria-hidden />}
      />
    </main>
  );
}
