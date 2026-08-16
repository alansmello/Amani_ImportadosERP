"use client";

import { PackageOpen, RotateCcw } from "lucide-react";

import { LossDialog } from "@/components/compras/loss-dialog";
import { PurchaseHistory } from "@/components/compras/purchase-history";
import { ReceiptDialog } from "@/components/compras/receipt-dialog";
import { RefundDialog } from "@/components/compras/refund-dialog";
import { ReturnDialog } from "@/components/compras/return-dialog";
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
import { usePurchaseRefunds, usePurchaseReturns } from "@/hooks/use-purchases";
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

function getRefundStatusLabel(status?: string | null) {
  const labels: Record<string, string> = {
    SemReembolso: "Sem reembolso",
    Parcial: "Reembolso parcial",
    Integral: "Reembolso integral"
  };

  return status ? labels[status] ?? status : "Sem reembolso";
}

function getRefundStatusVariant(status?: string | null) {
  if (status === "Integral") {
    return "success" as const;
  }

  if (status === "Parcial") {
    return "info" as const;
  }

  return "neutral" as const;
}
function getReturnLogisticsStatusLabel(
  status?: string | null,
  description?: string | null
) {
  const labels: Record<string, string> = {
    SemDevolucao: "Sem devolucao",
    ParcialmenteDevolvida: "Parcialmente devolvida",
    Devolvida: "Recebida e devolvida",
    ParcialmenteCompensada: "Parcialmente compensada",
    DevolucaoCompensada: "Devolucao compensada"
  };

  return description || (status ? labels[status] ?? status : "Sem devolucao");
}

function getReturnLogisticsStatusVariant(status?: string | null) {
  if (status === "Devolvida" || status === "ParcialmenteDevolvida") {
    return "warning" as const;
  }

  if (status === "ParcialmenteCompensada") {
    return "info" as const;
  }

  if (status === "DevolucaoCompensada") {
    return "success" as const;
  }

  return "neutral" as const;
}

export function PurchaseDetail({
  purchase,
  receipts,
  losses,
  products,
  suppliers
}: PurchaseDetailProps) {
  const refundsQuery = usePurchaseRefunds(purchase.id);
  const returnsQuery = usePurchaseReturns(purchase.id);
  const refunds = refundsQuery.data?.reembolsos ?? [];
  const returns = returnsQuery.data?.items ?? [];
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
            <div className="flex flex-wrap gap-2">
              <Badge variant={getStatusVariant(purchase.status)}>
                {getStatusLabel(purchase.status)}
              </Badge>
              {purchase.possuiDevolucao ? (
                <Badge
                  variant={getReturnLogisticsStatusVariant(
                    purchase.situacaoLogisticaDevolucao
                  )}
                >
                  {getReturnLogisticsStatusLabel(
                    purchase.situacaoLogisticaDevolucao,
                    purchase.descricaoSituacaoLogisticaDevolucao
                  )}
                </Badge>
              ) : null}
            </div>
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
          <div className="flex flex-col gap-4 tablet:flex-row tablet:items-start tablet:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-amani border border-border bg-surface-light text-info">
                  <RotateCcw className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0">
                  <CardTitle>Reembolsos</CardTitle>
                  <CardDescription className="mt-1">
                    Creditos recebidos do fornecedor entram no caixa sem alterar
                    o total bruto da compra.
                  </CardDescription>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={getRefundStatusVariant(purchase.situacaoReembolso)}
              >
                {getRefundStatusLabel(purchase.situacaoReembolso)}
              </Badge>
              <RefundDialog purchase={purchase} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 tablet:grid-cols-3">
          <div className="rounded-amani border border-border bg-surface-light p-4">
            <p className="text-xs uppercase text-text-secondary">
              Reembolsado liquido
            </p>
            <p className="mt-2 text-lg font-semibold text-success">
              {formatCurrency(purchase.totalReembolsadoLiquido ?? 0)}
            </p>
          </div>
          <div className="rounded-amani border border-border bg-surface-light p-4">
            <p className="text-xs uppercase text-text-secondary">
              Saldo reembolsavel
            </p>
            <p className="mt-2 text-lg font-semibold text-text-primary">
              {formatCurrency(purchase.saldoReembolsavel ?? purchase.total)}
            </p>
          </div>
          <div className="rounded-amani border border-border bg-surface-light p-4">
            <p className="text-xs uppercase text-text-secondary">
              Custo financeiro liquido
            </p>
            <p className="mt-2 text-lg font-semibold text-text-primary">
              {formatCurrency(purchase.custoFinanceiroLiquido ?? purchase.total)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Itens</CardTitle>
          <CardDescription>
            Quantidades oficiais compradas, recebidas historicamente, devolvidas, compensadas, perdidas e pendentes.
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
                <TableHead>Devolvida</TableHead>
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
                      <span className="block">
                        {(item.quantidadeDevolvidaAntes ?? 0) +
                          (item.quantidadeDevolvidaDepois ?? 0)}
                      </span>
                      {item.quantidadeDevolvidaDepois ? (
                        <span className="mt-1 block text-xs text-warning">
                          Depois do recebimento: {item.quantidadeDevolvidaDepois}
                        </span>
                      ) : null}
                      {item.quantidadeDevolvidaDepoisCompensada ? (
                        <span className="mt-1 block text-xs text-success">
                          Compensada: {item.quantidadeDevolvidaDepoisCompensada}
                        </span>
                      ) : null}
                    </TableCell>
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
                        <ReturnDialog
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

      <PurchaseHistory
        compraId={purchase.id}
        receipts={receipts}
        losses={losses}
        refunds={refunds}
        returns={returns}
        products={products}
      />
    </div>
  );
}
