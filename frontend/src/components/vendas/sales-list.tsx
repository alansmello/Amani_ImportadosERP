"use client";

import { ContextualLink } from "@/components/layout/contextual-link";
import { ArrowRight, ShoppingCart } from "lucide-react";

import {
  formatSaleCurrency,
  formatSaleDate,
  formatSaleProfit
} from "@/components/vendas/sale-formatters";
import { EmptyState } from "@/components/states/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { vendaDetalhe } from "@/config/routes";
import type { Customer } from "@/types/customer";
import type { SaleListItem } from "@/types/sale";

type SalesListProps = {
  sales: SaleListItem[];
  customers: Customer[];
  usingFilters?: boolean;
};

function getCustomerName(customers: Customer[], id: string) {
  return customers.find((customer) => customer.id === id)?.nome ?? "Cliente";
}

export function SalesList({
  sales,
  customers,
  usingFilters = false
}: SalesListProps) {
  if (sales.length === 0) {
    return (
      <EmptyState
        title="Nenhuma venda encontrada"
        description={
          usingFilters
            ? "Nenhuma venda corresponde aos filtros aplicados. Ajuste o periodo ou o cliente e tente novamente."
            : "Nenhuma venda registrada. Use a acao Nova venda para registrar a primeira venda."
        }
        variant="empty"
        icon={<ShoppingCart className="h-5 w-5" aria-hidden />}
      />
    );
  }

  const totalVendas = sales.reduce((sum, sale) => sum + sale.totalVenda, 0);
  const totalLucro = sales.reduce((sum, sale) => sum + sale.lucro, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendas</CardTitle>
        <CardDescription>
          {sales.length} venda(s) — Total:{" "}
          {formatSaleCurrency(totalVendas)} — Lucro:{" "}
          {formatSaleProfit(totalLucro)}
        </CardDescription>
      </CardHeader>
      <CardContent className="min-w-0">
        <Table className="min-w-[40rem]">
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Apresentacao</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Lucro</TableHead>
              <TableHead className="text-right">Acao</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell className="min-w-44 max-w-60 font-medium">
                  <span className="block break-words">
                    {getCustomerName(customers, sale.clienteId)}
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatSaleDate(sale.dataVenda)}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {sale.possuiApresentacaoFracionada ? (
                    <Badge variant="neutral">Fracionada</Badge>
                  ) : (
                    <span className="text-sm text-text-secondary">Legado</span>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatSaleCurrency(sale.totalVenda)}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatSaleProfit(sale.lucro)}
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="secondary" size="sm">
                    <ContextualLink href={vendaDetalhe(sale.id)}>
                      <span>Detalhe</span>
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </ContextualLink>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
