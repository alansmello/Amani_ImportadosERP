"use client";

import { PageHeader } from "@/components/layout/page-header";
import { ContextualBackButton } from "@/components/layout/contextual-back-button";
import { SaleForm } from "@/components/vendas/sale-form";
import { routes } from "@/config/routes";

export default function NovaVendaPage() {
  return (
    <main className="space-y-6">
      <PageHeader
        title="Nova venda"
        description="Registre venda com cliente, itens e validacao oficial de estoque."
        actions={
          <ContextualBackButton fallbackHref={routes.vendas} />
        }
      />

      <SaleForm />
    </main>
  );
}
