import { Users } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/states/empty-state";

export default function EditarClientePage() {
  return (
    <main className="space-y-6">
      <PageHeader
        title="Editar Cliente"
        description="Area reservada para edicao de clientes."
      />
      <EmptyState
        title="Edicao de cliente em preparacao"
        description="O formulario de edicao sera conectado aos dados reais da API nas proximas tarefas."
        icon={<Users className="h-5 w-5" aria-hidden />}
      />
    </main>
  );
}
