"use client";

import { useRouter } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { ContextualBackButton } from "@/components/layout/contextual-back-button";
import { ReceivableForm } from "@/components/financeiro/receivable-form";
import { routes } from "@/config/routes";

export default function NovaContaReceberPage() {
  const router = useRouter();

  function handleCreated() {
    router.push(routes.contasReceber);
  }

  return (
    <main className="space-y-6">
      <PageHeader
        title="Nova conta a receber"
        description="Registre uma conta a receber informando cliente, valor e data de vencimento."
        actions={
          <ContextualBackButton fallbackHref={routes.contasReceber} />
        }
      />

      <ReceivableForm onCreated={handleCreated} />
    </main>
  );
}
