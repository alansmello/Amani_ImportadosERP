"use client";

import { ImplantationFlow } from "@/components/implantacao/implantation-flow";
import { PageHeader } from "@/components/layout/page-header";

export default function ImplantacaoInicialPage() {
  return (
    <main className="space-y-6">
      <PageHeader
        title="Implantacao inicial"
        description="Prepare os dados reais de partida do ERP sem misturar este fluxo com operacoes recorrentes."
      />

      <ImplantationFlow />
    </main>
  );
}
