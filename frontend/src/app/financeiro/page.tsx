import { CreditCard } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/states/empty-state";

export default function FinanceiroPage() {
  return (
    <main className="space-y-6">
      <PageHeader
        title="Financeiro"
        description="Area reservada para os futuros fluxos financeiros do ERP."
      />
      <EmptyState
        title="Modulo financeiro em preparacao"
        description="Nao ha indicadores, valores reais ou regras financeiras nesta fase. A tela existe para validar a estrutura inicial."
        icon={<CreditCard className="h-5 w-5" aria-hidden />}
      />
    </main>
  );
}
