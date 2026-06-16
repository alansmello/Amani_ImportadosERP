"use client";

import { PackageOpen } from "lucide-react";

import { LossDialog } from "@/components/compras/loss-dialog";
import { PurchaseHistory } from "@/components/compras/purchase-history";
import { ReceiptDialog } from "@/components/compras/receipt-dialog";
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
import type {
  Purchase,
  PurchaseLoss,
  PurchaseReceipt
} from "@/types/purchase";
import type { Product } from "@/types/product";
import type { Supplier } from "@/types/supplier";

type PurchaseDetailProps = {
  purchase: Purchase;
  receipts: PurchaseReceipt[];
  losses: PurchaseLoss[];
  products: Product[];
  suppliers: Supplier[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short"
  }).format(new Date(value));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

function getProductName(products: Product[], id: string) {
  return products.find((product) => product.id === id)?.nome ?? "Produto";
}

function getSupplierName(suppliers: Supplier[], id: string) {
  return suppliers.find((supplier) => supplier.id === id)?.nome ?? "Fornecedor";
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    EmTransito: "Em transito",
    ParcialmenteRecebida: "Parcial",
    Recebida: "Recebida",
    Finalizada: "Finalizada",
    ComPerda: "Com perda"
  };

  return labels[status] ?? status;
}

function getStatusVariant(status: string) {
  if (status.toLowerCase().includes("perda")) {
    return "warning" as const;
  }

  if (status.toLowerCase().includes("recebida")) {
    return "success" as const;
  }

  return "info" as const;
}

export function PurchaseDetail({
  purchase,
  receipts,
  losses,
  products,
  suppliers
}: PurchaseDetailProps) {
  const totalPending = purchase.items.reduce(
    (total, item) => total + item.quantidadePendente,
    0
  );

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 tablet:flex-row tablet:items-start tablet:justify-between">
            <div className="min-w-0">
              <CardTitle>Compra em acompanhamento</CardTitle>
              <CardDescription className="mt-2">
                {getSupplierName(suppliers, purchase.fornecedorId)} -{" "}
                {formatDate(purchase.dataCompra)}
              </CardDescription>
            </div>
            <Badge variant={getStatusVariant(purchase.status)}>
              {getStatusLabel(purchase.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 tablet:grid-cols-4">
          <div className="rounded-amani border border-border bg-surface-light p-4">
            <p className="text-xs uppercase text-text-secondary">Total</p>
            <p className="mt-2 text-lg font-semibold text-text-primary">
              {formatCurrency(purchase.total)}
            </p>
          </div>
          <div className="rounded-amani border border-border bg-surface-light p-4">
            <p className="text-xs uppercase text-text-secondary">Desconto</p>
            <p className="mt-2 text-lg font-semibold text-text-primary">
              {formatCurrency(purchase.desconto)}
            </p>
          </div>
          <div className="rounded-amani border border-border bg-surface-light p-4">
            <p className="text-xs uppercase text-text-secondary">Acrescimo</p>
            <p className="mt-2 text-lg font-semibold text-text-primary">
              {formatCurrency(purchase.acrescimo)}
            </p>
          </div>
          <div className="rounded-amani border border-border bg-surface-light p-4">
            <p className="text-xs uppercase text-text-secondary">Pendente</p>
            <p className="mt-2 text-lg font-semibold text-text-primary">
              {totalPending} unidade(s)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Itens</CardTitle>
          <CardDescription>
            Quantidades oficiais compradas, recebidas, perdidas e pendentes.
          </CardDescription>
        </CardHeader>
        <CardContent className="min-w-0">
          <Table className="min-w-[56rem]">
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Comprada</TableHead>
                <TableHead>Recebida</TableHead>
                <TableHead>Perdida</TableHead>
                <TableHead>Pendente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchase.items.map((item) => {
                const hasPending = item.quantidadePendente > 0;

                return (
                  <TableRow key={item.id}>
                    <TableCell className="min-w-48 max-w-64 font-medium">
                      <span className="block break-words">
                        {getProductName(products, item.produtoId)}
                      </span>
                    </TableCell>
                    <TableCell>{item.quantidadeComprada}</TableCell>
                    <TableCell>{item.quantidadeRecebida}</TableCell>
                    <TableCell>{item.quantidadePerdida}</TableCell>
                    <TableCell>
                      <span className={hasPending ? "text-warning" : "text-success"}>
                        {item.quantidadePendente}
                      </span>
                    </TableCell>
                    <TableCell>{formatCurrency(item.valorTotal)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex min-w-44 flex-wrap justify-end gap-2">
                        <ReceiptDialog
                          compraId={purchase.id}
                          item={item}
                          productName={getProductName(products, item.produtoId)}
                        />
                        <LossDialog
                          compraId={purchase.id}
                          item={item}
                          productName={getProductName(products, item.produtoId)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-amani border border-border bg-surface-light text-primary">
              <PackageOpen className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle>Transito e estoque</CardTitle>
              <CardDescription className="mt-1">
                Esta compra nao representa estoque disponivel. Somente
                recebimento confirmado gera entrada rastreavel.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <PurchaseHistory receipts={receipts} losses={losses} products={products} />
    </div>
  );
}
