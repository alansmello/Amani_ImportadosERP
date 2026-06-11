import { Users } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/states/empty-state";

export default function ClienteDetalhePage() {
  return (
    <main className="space-y-6">
      <PageHeader
        title="Detalhes do Cliente"
        description="Area reservada para consulta individual de cliente."
      />
      <EmptyState
        title="Consulta de cliente em preparacao"
        description="Os detalhes do cliente serao carregados da API nas proximas tarefas."
        icon={<Users className="h-5 w-5" aria-hidden />}
      />
    </main>
  );
}
