"use client";

import { ReceiptText } from "lucide-react";

import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import type { OperatorExpense } from "@/types/operator-expense";

type OperatorExpensesListProps = {
  expenses: OperatorExpense[];
  totalTaxas: number;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(2).replace(".", ",")}%`;
}

export function OperatorExpensesList({
  expenses,
  totalTaxas,
  isLoading,
  isError,
  onRetry
}: OperatorExpensesListProps) {
  if (isLoading) {
    return (
      <LoadingState
        title="Carregando despesas"
        description="Aguarde enquanto as despesas de operadora sao consultadas."
      />
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Nao foi possivel carregar despesas"
        description="Tente novamente para consultar as taxas de operadora."
        onRetry={onRetry}
      />
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-amani border border-border bg-surface-light px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            Total de taxas
          </p>
          <p className="mt-1 text-lg font-semibold text-text-primary">
            {formatCurrency(totalTaxas)}
          </p>
        </div>
        <EmptyState
          title="Nenhuma despesa encontrada"
          description="Ajuste os filtros de periodo ou forma de pagamento."
          badgeLabel="Sem despesas"
          variant="empty"
          icon={<ReceiptText className="h-5 w-5" aria-hidden />}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-amani border border-border bg-surface-light px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
          Total de taxas
        </p>
        <p className="mt-1 text-lg font-semibold text-text-primary">
          {formatCurrency(totalTaxas)}
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Forma</TableHead>
            <TableHead>Venda</TableHead>
            <TableHead className="text-right">Bruto</TableHead>
            <TableHead className="text-right">Taxa</TableHead>
            <TableHead className="text-right">Liquido</TableHead>
            <TableHead className="text-right">Despesa</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell>
                {new Date(expense.dataRegistro).toLocaleDateString("pt-BR")}
              </TableCell>
              <TableCell>{expense.formaPagamento}</TableCell>
              <TableCell className="font-mono text-xs">{expense.vendaId}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(expense.valorBruto)}
              </TableCell>
              <TableCell className="text-right">
                {formatPercent(expense.percentualTaxa)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(expense.valorLiquido)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(expense.valorTaxa)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
