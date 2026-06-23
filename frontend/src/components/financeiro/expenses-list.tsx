"use client";

import { CalendarDays, CreditCard, ReceiptText, Tags } from "lucide-react";

import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import type { Expense } from "@/types/expense";

type ExpensesListProps = {
  expenses: Expense[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  usingFilters?: boolean;
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "UTC"
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function formatDate(value: string) {
  if (!value) return "-";
  return dateFormatter.format(new Date(value));
}

export function ExpensesList({
  expenses,
  isLoading,
  isError,
  onRetry,
  usingFilters = false
}: ExpensesListProps) {
  if (isLoading) {
    return (
      <LoadingState
        title="Carregando despesas"
        description="Aguarde enquanto as despesas operacionais sao carregadas."
      />
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Nao foi possivel carregar as despesas"
        description="Verifique a conexao com o servidor e tente novamente."
        onRetry={onRetry}
      />
    );
  }

  if (expenses.length === 0) {
    return (
      <EmptyState
        title={
          usingFilters
            ? "Nenhuma despesa corresponde aos filtros"
            : "Nenhuma despesa cadastrada"
        }
        description={
          usingFilters
            ? "Limpe ou ajuste os filtros para consultar outros lancamentos."
            : "Use a acao Nova despesa para registrar o primeiro lancamento operacional."
        }
        variant="empty"
        icon={<ReceiptText className="h-5 w-5" aria-hidden />}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Despesas operacionais</CardTitle>
        <CardDescription>
          {expenses.length} lancamento(s) - Total:{" "}
          {formatCurrency(expenses.reduce((sum, expense) => sum + expense.valor, 0))}
        </CardDescription>
      </CardHeader>
      <CardContent className="min-w-0">
        <Table className="min-w-[58rem]">
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Forma</TableHead>
              <TableHead>Descricao</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="whitespace-nowrap">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-text-secondary" aria-hidden />
                    {formatDate(expense.dataCompetencia)}
                  </span>
                </TableCell>
                <TableCell className="min-w-40">
                  <span className="flex flex-wrap items-center gap-2">
                    <Tags className="h-4 w-4 text-text-secondary" aria-hidden />
                    <span className="break-words font-medium text-text-primary">
                      {expense.categoriaNome}
                    </span>
                    {!expense.categoriaAtiva ? (
                      <Badge variant="neutral">Inativa</Badge>
                    ) : null}
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <span className="inline-flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-text-secondary" aria-hidden />
                    {expense.formaPagamento}
                  </span>
                </TableCell>
                <TableCell className="min-w-56 max-w-96">
                  <span className="block break-words">{expense.descricao}</span>
                </TableCell>
                <TableCell className="whitespace-nowrap text-right font-semibold">
                  {formatCurrency(expense.valor)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
