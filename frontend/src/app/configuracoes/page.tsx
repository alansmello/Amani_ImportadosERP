import { Settings } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/states/empty-state";

export default function ConfiguracoesPage() {
  return (
    <main className="space-y-6">
      <PageHeader
        title="Configuracoes"
        description="Area reservada para futuras preferencias e parametros do sistema."
      />
      <EmptyState
        title="Configuracoes em preparacao"
        description="Esta rota nao altera parametros nem permissoes. Recursos de configuracao serao planejados em feature futura."
        icon={<Settings className="h-5 w-5" aria-hidden />}
      />
    </main>
  );
}
