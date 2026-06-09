import { Boxes } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/states/empty-state";

export default function EstoquePage() {
  return (
    <main className="space-y-6">
      <PageHeader
        title="Estoque"
        description="Area reservada para acompanhamento futuro de estoque e movimentacoes."
      />
      <EmptyState
        title="Modulo de estoque em preparacao"
        description="A tela nao calcula saldo nem movimentacoes. O backend continuara sendo a fonte de verdade para regras de estoque."
        icon={<Boxes className="h-5 w-5" aria-hidden />}
      />
    </main>
  );
}
