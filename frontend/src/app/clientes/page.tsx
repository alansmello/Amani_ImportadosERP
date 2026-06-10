import { Users } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/states/empty-state";

export default function ClientesPage() {
  return (
    <main className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Area reservada para a futura gestao de clientes do Amani ERP."
      />
      <EmptyState
        title="Modulo de clientes em preparacao"
        description="Esta rota valida a estrutura inicial de navegacao. Fluxos de cadastro e manutencao de clientes serao implementados em feature futura."
        icon={<Users className="h-5 w-5" aria-hidden />}
      />
    </main>
  );
}
