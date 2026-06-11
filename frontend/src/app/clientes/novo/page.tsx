import { Users } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/states/empty-state";

export default function NovoClientePage() {
  return (
    <main className="space-y-6">
      <PageHeader
        title="Novo Cliente"
        description="Area reservada para o cadastro de clientes."
      />
      <EmptyState
        title="Cadastro de cliente em preparacao"
        description="O formulario sera conectado aos dados reais da API nas proximas tarefas."
        icon={<Users className="h-5 w-5" aria-hidden />}
      />
    </main>
  );
}
