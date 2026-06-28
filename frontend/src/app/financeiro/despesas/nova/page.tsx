"use client";

import Link from "next/link";
import { Tags } from "lucide-react";
import { useRouter } from "next/navigation";

import { ExpenseForm } from "@/components/financeiro/expense-form";
import { PageHeader } from "@/components/layout/page-header";
import { ContextualBackButton } from "@/components/layout/contextual-back-button";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

export default function NovaDespesaPage() {
  const router = useRouter();

  function handleCreated() {
    router.push(routes.despesas);
  }

  return (
    <main className="space-y-6">
      <PageHeader
        title="Nova despesa"
        description="Registre uma despesa operacional com categoria ativa, data, valor e forma de pagamento."
        actions={
          <div className="flex flex-col gap-2 tablet:flex-row">
            <ContextualBackButton fallbackHref={routes.despesas} />
            <Button asChild variant="secondary">
              <Link href={routes.despesasCategorias}>
                <Tags className="h-4 w-4" aria-hidden />
                <span>Categorias</span>
              </Link>
            </Button>
          </div>
        }
      />

      <ExpenseForm onCreated={handleCreated} />
    </main>
  );
}
