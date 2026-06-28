"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { ExpenseCategoriesManager } from "@/components/financeiro/expense-categories-manager";
import { PageHeader } from "@/components/layout/page-header";
import { ContextualBackButton } from "@/components/layout/contextual-back-button";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

export default function CategoriasDespesaPage() {
  return (
    <main className="space-y-6">
      <PageHeader
        title="Categorias de despesa"
        description="Gerencie categorias ativas e inativas usadas nos lancamentos operacionais."
        actions={
          <div className="flex flex-col gap-2 tablet:flex-row">
            <ContextualBackButton fallbackHref={routes.despesas} />
            <Button asChild>
              <Link href={routes.despesasNova}>
                <Plus className="h-4 w-4" aria-hidden />
                <span>Nova despesa</span>
              </Link>
            </Button>
          </div>
        }
      />

      <ExpenseCategoriesManager />
    </main>
  );
}
