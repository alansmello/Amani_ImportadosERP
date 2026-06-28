"use client";

import { useRouter } from "next/navigation";

import { PurchaseForm } from "@/components/compras/purchase-form";
import { PageHeader } from "@/components/layout/page-header";
import { ContextualBackButton } from "@/components/layout/contextual-back-button";
import { routes } from "@/config/routes";

export default function NovaCompraPage() {
  const router = useRouter();

  function handleCreated(href: string) {
    router.push(href);
  }

  return (
    <main className="space-y-6">
      <PageHeader
        title="Nova compra"
        description="Registre a compra comercial sem gerar entrada automatica de estoque."
        actions={
          <ContextualBackButton fallbackHref={routes.compras} />
        }
      />

      <PurchaseForm onCreated={handleCreated} />
    </main>
  );
}
