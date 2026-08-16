"use client";

import { ContextualLink } from "@/components/layout/contextual-link";
import { ArrowRight, ClipboardList } from "lucide-react";

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
import { compraDetalhe } from "@/config/routes";
import type { PurchaseListItem } from "@/types/purchase";
import type { Supplier } from "@/types/supplier";

type PurchaseListProps = {
  purchases: PurchaseListItem[];
  suppliers: Supplier[];
  pendingByPurchase?: Record<string, number>;
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
    Devolvida: "Devolvida",
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

export function PurchaseList({
  purchases,
  suppliers,
  pendingByPurchase = {}
}: PurchaseListProps) {
  if (purchases.length === 0) {
    return (
      <EmptyState
        title="Nenhuma compra encontrada"
        description="Ajuste os filtros ou registre uma nova compra para acompanhar mercadorias em transito."
        variant="empty"
        icon={<ClipboardList className="h-5 w-5" aria-hidden />}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compras</CardTitle>
        <CardDescription>
          Lista operacional com fornecedor, data, situacao e pendencias.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-w-0">
        <Table className="min-w-[46rem]">
          <TableHeader>
            <TableRow>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Situacao</TableHead>
              <TableHead>Pendencia</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead className="text-right">Acao</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.map((purchase) => {
              const pendingQuantity = pendingByPurchase[purchase.id] ?? 0;

              return (
                <TableRow key={purchase.id}>
                  <TableCell className="min-w-44 max-w-60 font-medium">
                    <span className="block break-words">
                      {getSupplierName(suppliers, purchase.fornecedorId)}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(purchase.dataCompra)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={getStatusVariant(purchase.status)}>
                        {getStatusLabel(purchase.status)}
                      </Badge>
                      <Badge
                        variant={getRefundStatusVariant(
                          purchase.situacaoReembolso
                        )}
                      >
                        {getRefundStatusLabel(purchase.situacaoReembolso)}
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
                  </TableCell>
                  <TableCell>
                    {pendingQuantity > 0
                      ? `${pendingQuantity} unidade(s)`
                      : "Sem pendencia informada"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span className="block">
                      {formatCurrency(purchase.totalCompra)}
                    </span>
                    {typeof purchase.custoFinanceiroLiquido === "number" ? (
                      <span className="mt-1 block text-xs text-success">
                        Liquido:{" "}
                        {formatCurrency(purchase.custoFinanceiroLiquido)}
                      </span>
                    ) : null}
                    {typeof purchase.totalReembolsadoLiquido === "number" &&
                    purchase.totalReembolsadoLiquido > 0 ? (
                      <span className="mt-1 block text-xs text-info">
                        Reembolsado:{" "}
                        {formatCurrency(purchase.totalReembolsadoLiquido)}
                      </span>
                    ) : null}
                    {purchase.valorPendenteCusto !== undefined ? (
                      purchase.valorPendenteCusto !== null ? (
                        <span className="mt-1 block text-xs text-text-secondary">
                          Pendente: {formatCurrency(purchase.valorPendenteCusto)}
                        </span>
                      ) : purchase.motivoValorPendenteIndisponivel ? (
                        <span className="mt-1 block max-w-64 whitespace-normal text-xs text-warning">
                          {purchase.motivoValorPendenteIndisponivel}
                        </span>
                      ) : null
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="secondary" size="sm">
                      <ContextualLink href={compraDetalhe(purchase.id)}>
                        <span>Detalhe</span>
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </ContextualLink>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
