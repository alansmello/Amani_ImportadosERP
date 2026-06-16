"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ImplantationFlow } from "@/components/implantacao/implantation-flow";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

export default function ImplantacaoInicialPage() {
  return (
    <main className="space-y-6">
      <PageHeader
        title="Implantacao inicial"
        description="Prepare os dados reais de partida do ERP sem misturar este fluxo com operacoes recorrentes."
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.configuracoes}>
              <ArrowLeft className="h-4 w-4" aria-hidden />
              <span>Configuracoes</span>
            </Link>
          </Button>
        }
      />

      <ImplantationFlow />
    </main>
  );
}
