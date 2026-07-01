"use client";

import type { ReactNode } from "react";

import {
  formatSaleCurrency,
  formatSaleDate,
  formatSaleProfit,
  formatSaleQuantity
} from "@/components/vendas/sale-formatters";
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
import type { Customer } from "@/types/customer";
import type { Product } from "@/types/product";
import type { Sale } from "@/types/sale";

type SaleDetailProps = {
  sale: Sale;
  customers: Customer[];
  products: Product[];
  cancelAction?: ReactNode;
};

function getCustomerName(customers: Customer[], id: string) {
  return customers.find((customer) => customer.id === id)?.nome ?? "Cliente";
}

function getProductName(products: Product[], id: string) {
  return products.find((product) => product.id === id)?.nome ?? "Produto";
}

export function SaleDetail({
  sale,
  customers,
  products,
  cancelAction
}: SaleDetailProps) {
  const hasProfit =
    typeof sale.lucro === "number" && Number.isFinite(sale.lucro);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 tablet:flex-row tablet:items-start tablet:justify-between">
            <div className="min-w-0">
              <CardTitle>Venda</CardTitle>
              <CardDescription className="mt-2">
                {getCustomerName(customers, sale.clienteId)} —{" "}
                {formatSaleDate(sale.dataVenda)}
              </CardDescription>
            </div>
            {cancelAction ? <div>{cancelAction}</div> : null}
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-4">
          <div className="rounded-amani border border-border bg-surface-light p-4">
            <p className="text-xs uppercase text-text-secondary">Total</p>
            <p className="mt-2 text-lg font-semibold text-text-primary">
              {formatSaleCurrency(sale.total)}
            </p>
          </div>
          <div className="rounded-amani border border-border bg-surface-light p-4">
            <p className="text-xs uppercase text-text-secondary">Desconto</p>
            <p className="mt-2 text-lg font-semibold text-text-primary">
              {formatSaleCurrency(sale.desconto)}
            </p>
          </div>
          <div className="rounded-amani border border-border bg-surface-light p-4">
            <p className="text-xs uppercase text-text-secondary">Acrescimo</p>
            <p className="mt-2 text-lg font-semibold text-text-primary">
              {formatSaleCurrency(sale.acrescimo)}
            </p>
          </div>
          <div className="rounded-amani border border-border bg-surface-light p-4">
            <p className="text-xs uppercase text-text-secondary">
              Lucro oficial
            </p>
            {hasProfit ? (
              <p className="mt-2 text-lg font-semibold text-text-primary">
                {formatSaleProfit(sale.lucro)}
              </p>
            ) : (
              <p className="mt-2 text-sm text-text-secondary">
                Nao disponivel
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Itens</CardTitle>
          <CardDescription>
            Produtos, quantidades, precos e valores registrados pelo backend.
          </CardDescription>
        </CardHeader>
        <CardContent className="min-w-0">
          <Table className="min-w-[52rem]">
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Apresentacao</TableHead>
                <TableHead>Equivalente estoque</TableHead>
                <TableHead>Preco unitario</TableHead>
                <TableHead>Desconto</TableHead>
                <TableHead>Acrescimo</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sale.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="min-w-48 max-w-64 font-medium">
                    <span className="block break-words">
                      {getProductName(products, item.produtoId)}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatSaleQuantity(item.quantidade)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {item.apresentacaoNome ?? "Unidade principal"}
                    {item.fatorNumeradorAplicado && item.fatorDenominadorAplicado
                      ? ` (${item.fatorNumeradorAplicado}/${item.fatorDenominadorAplicado})`
                      : ""}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatSaleQuantity(
                      item.quantidadeConvertidaEstoque ?? item.quantidade
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatSaleCurrency(item.precoUnitario)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatSaleCurrency(item.desconto)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatSaleCurrency(item.acrescimo)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatSaleCurrency(item.valorTotal)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
