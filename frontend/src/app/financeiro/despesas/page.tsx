"use client";

import Link from "next/link";
import { Plus, Tags } from "lucide-react";
import { useMemo, useState } from "react";

import { ExpenseFiltersPanel } from "@/components/financeiro/expense-filters";
import { ExpensesList } from "@/components/financeiro/expenses-list";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { useExpenseCategories } from "@/hooks/use-expense-categories";
import { useExpenses } from "@/hooks/use-expenses";
import type { ExpenseFilters } from "@/types/expense";

const EMPTY_FILTERS: ExpenseFilters = {};

export default function DespesasPage() {
  const [filters, setFilters] = useState<ExpenseFilters>(EMPTY_FILTERS);

  const normalizedFilters = useMemo(
    () => ({
      dataInicio: filters.dataInicio || undefined,
      dataFim: filters.dataFim || undefined,
      categoriaId: filters.categoriaId || undefined
    }),
    [filters]
  );

  const expensesQuery = useExpenses(normalizedFilters);
  const categoriesQuery = useExpenseCategories(true);

  const hasActiveFilters = Boolean(
    normalizedFilters.dataInicio ||
      normalizedFilters.dataFim ||
      normalizedFilters.categoriaId
  );

  function handleClearFilters() {
    setFilters(EMPTY_FILTERS);
  }

  return (
    <main className="space-y-6">
      <PageHeader
        title="Despesas"
        description="Consulte despesas operacionais por data de competencia e categoria."
        actions={
          <div className="flex flex-col gap-2 tablet:flex-row">
            <Button asChild variant="secondary">
              <Link href={routes.despesasCategorias}>
                <Tags className="h-4 w-4" aria-hidden />
                <span>Categorias</span>
              </Link>
            </Button>
            <Button asChild>
              <Link href={routes.despesasNova}>
                <Plus className="h-4 w-4" aria-hidden />
                <span>Nova despesa</span>
              </Link>
            </Button>
          </div>
        }
      />

      <ExpenseFiltersPanel
        filters={filters}
        categories={categoriesQuery.data ?? []}
        onFiltersChange={setFilters}
        onClear={handleClearFilters}
        disabled={expensesQuery.isLoading || categoriesQuery.isLoading}
        hasActiveFilters={hasActiveFilters}
      />

      <ExpensesList
        expenses={expensesQuery.data ?? []}
        isLoading={expensesQuery.isLoading || categoriesQuery.isLoading}
        isError={expensesQuery.isError || categoriesQuery.isError}
        onRetry={() => {
          if (expensesQuery.isError) void expensesQuery.refetch();
          if (categoriesQuery.isError) void categoriesQuery.refetch();
        }}
        usingFilters={hasActiveFilters}
      />
    </main>
  );
}
