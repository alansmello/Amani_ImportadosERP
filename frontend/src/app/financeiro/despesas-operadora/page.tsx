"use client";

import Link from "next/link";
import { ArrowLeft, FilterX } from "lucide-react";
import { useState } from "react";

import { OperatorExpensesList } from "@/components/financeiro/operator-expenses-list";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { routes } from "@/config/routes";
import { useOperatorExpenses } from "@/hooks/use-operator-expenses";
import type { OperatorExpenseFilters } from "@/types/operator-expense";
import type { PaymentMethod } from "@/types/payment-settings";

const EMPTY_FILTERS: OperatorExpenseFilters = {};

export default function DespesasOperadoraPage() {
  const [filters, setFilters] = useState<OperatorExpenseFilters>(EMPTY_FILTERS);
  const expensesQuery = useOperatorExpenses(filters);

  function updateFilter(field: keyof OperatorExpenseFilters, value: string) {
    const nextValue =
      field === "formaPagamento" ? (value as PaymentMethod | "") : value;

    setFilters((current) => ({
      ...current,
      [field]: nextValue || undefined
    }));
  }

  function clearFilters() {
    setFilters(EMPTY_FILTERS);
  }

  return (
    <main className="space-y-6">
      <PageHeader
        title="Despesas de operadora"
        description="Consulte taxas de cartao registradas pelo roteamento financeiro das vendas."
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.contasReceber}>
              <ArrowLeft className="h-4 w-4" aria-hidden />
              <span>Voltar</span>
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="grid gap-4 pt-6 tablet:grid-cols-[repeat(3,minmax(0,1fr))_auto] tablet:items-end">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-text-primary" htmlFor="operator-expense-start">
              Data inicial
            </label>
            <Input
              id="operator-expense-start"
              type="date"
              value={filters.dataInicio ?? ""}
              onChange={(event) => updateFilter("dataInicio", event.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-text-primary" htmlFor="operator-expense-end">
              Data final
            </label>
            <Input
              id="operator-expense-end"
              type="date"
              value={filters.dataFim ?? ""}
              onChange={(event) => updateFilter("dataFim", event.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-text-primary" htmlFor="operator-expense-method">
              Forma
            </label>
            <select
              id="operator-expense-method"
              className="flex h-11 w-full rounded-amani border border-border bg-surface px-3 py-2 text-sm text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              value={filters.formaPagamento ?? ""}
              onChange={(event) =>
                updateFilter("formaPagamento", event.target.value)
              }
            >
              <option value="">Todas</option>
              <option value="CartaoDebito">Cartao de debito</option>
              <option value="CartaoCredito">Cartao de credito</option>
            </select>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={clearFilters}
            className="w-full tablet:w-auto"
          >
            <FilterX className="h-4 w-4" aria-hidden />
            <span>Limpar</span>
          </Button>
        </CardContent>
      </Card>

      <OperatorExpensesList
        expenses={expensesQuery.data ?? []}
        isLoading={expensesQuery.isLoading}
        isError={expensesQuery.isError}
        onRetry={() => void expensesQuery.refetch()}
      />
    </main>
  );
}
