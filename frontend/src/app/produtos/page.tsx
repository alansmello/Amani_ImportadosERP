import { Package } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/states/empty-state";

export default function ProdutosPage() {
  return (
    <main className="space-y-6">
      <PageHeader
        title="Produtos"
        description="Area reservada para a futura gestao de produtos e catalogo operacional."
      />
      <EmptyState
        title="Modulo de produtos em preparacao"
        description="Esta tela ainda nao oferece cadastro, edicao ou consulta operacional. A implementacao completa pertence a uma feature futura."
        icon={<Package className="h-5 w-5" aria-hidden />}
      />
    </main>
  );
}
