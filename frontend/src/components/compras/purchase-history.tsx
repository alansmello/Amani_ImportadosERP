"use client";

import { AlertTriangle, CheckCircle2, History, RotateCcw, Undo2 } from "lucide-react";

import { PurchaseEventCancelDialog } from "@/components/compras/purchase-event-cancel-dialog";
import { EmptyState } from "@/components/states/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import type {
  PurchaseLoss,
  PurchaseReceipt,
  PurchaseRefund,
  PurchaseReturn
} from "@/types/purchase";
import type { Product } from "@/types/product";

type PurchaseHistoryProps = {
  compraId: string;
  receipts: PurchaseReceipt[];
  losses: PurchaseLoss[];
  refunds?: PurchaseRefund[];
  returns?: PurchaseReturn[];
  products: Product[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function getProductName(products: Product[], id: string) {
  return products.find((product) => product.id === id)?.nome ?? "Produto";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

function getReturnMotiveLabel(value: string) {
  const labels: Record<string, string> = {
    ProdutoFalsificado: "Produto falsificado",
    Avaria: "Avaria",
    ProdutoIncorreto: "Produto incorreto",
    DesistenciaRecusa: "Desistencia/recusa",
    Outro: "Outro"
  };

  return labels[value] ?? value;
}

export function PurchaseHistory({
  compraId,
  receipts,
  losses,
  refunds = [],
  returns = [],
  products
}: PurchaseHistoryProps) {
  const events = [
    ...receipts.map((receipt) => ({
      id: receipt.id,
      kind: "receipt" as const,
      dimension: "Estoque",
      produtoId: receipt.produtoId,
      quantidade: receipt.quantidade,
      date: receipt.dataRecebimento,
      registeredAt: null,
      description: receipt.observacao
    })),
    ...losses.map((loss) => ({
      id: loss.id,
      kind: "loss" as const,
      dimension: "Logistica",
      produtoId: loss.produtoId,
      quantidade: loss.quantidade,
      date: loss.dataPerda,
      registeredAt: null,
      description: loss.observacao,
      motive: loss.motivo
    })),
    ...returns.map((purchaseReturn) => ({
      id: purchaseReturn.id,
      kind: "return" as const,
      dimension:
        purchaseReturn.momento === "DepoisDoRecebimento"
          ? "Estoque"
          : "Logistica",
      produtoId: null,
      itemId: purchaseReturn.compraItemId,
      quantidade: purchaseReturn.quantidadeVigente,
      date: purchaseReturn.dataDevolucao,
      registeredAt: purchaseReturn.criadoEm,
      description: purchaseReturn.observacao,
      motive: purchaseReturn.motivo,
      compensated: purchaseReturn.compensada,
      requiresPhysicalConfirmation:
        purchaseReturn.momento === "DepoisDoRecebimento"
    })),
    ...refunds.map((refund) => ({
      id: refund.id,
      kind: "refund" as const,
      dimension: "Financeiro",
      produtoId: null,
      quantidade: null,
      date: refund.dataReembolso,
      registeredAt: refund.criadoEm ?? null,
      description: refund.observacao,
      value: refund.valorLiquido,
      reference: refund.referenciaExterna,
      cancelled: refund.cancelado
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (events.length === 0) {
    return (
      <EmptyState
        title="Sem historico operacional"
        description="Recebimentos, perdas e reembolsos registrados para esta compra aparecerao aqui."
        variant="empty"
        icon={<History className="h-5 w-5" aria-hidden />}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historico</CardTitle>
        <CardDescription>
          Recebimentos, perdas e reembolsos registrados pela fonte oficial.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {events.map((event) => (
          <div
            key={`${event.kind}-${event.id}`}
            className="rounded-amani border border-border bg-surface-light p-4"
          >
            <div className="flex flex-col gap-3 tablet:flex-row tablet:items-start tablet:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {event.kind === "receipt" ? (
                    <CheckCircle2
                      className="h-4 w-4 text-success"
                      aria-hidden
                    />
                  ) : event.kind === "refund" ? (
                    <RotateCcw className="h-4 w-4 text-info" aria-hidden />
                  ) : event.kind === "return" ? (
                    <Undo2 className="h-4 w-4 text-warning" aria-hidden />
                  ) : (
                    <AlertTriangle
                      className="h-4 w-4 text-warning"
                      aria-hidden
                    />
                  )}
                  <p className="break-words text-sm font-semibold text-text-primary">
                    {event.kind === "refund"
                      ? "Reembolso recebido"
                      : event.kind === "return"
                        ? "Devolucao de compra"
                        : getProductName(products, event.produtoId)}
                  </p>
                </div>
                <p className="mt-2 text-sm text-text-secondary">
                  {event.kind === "refund"
                    ? `${formatCurrency(event.value)} - Efetiva: ${formatDate(event.date)}`
                    : `${event.quantidade} unidade(s) - Efetiva: ${formatDate(event.date)}`}
                </p>
                {event.registeredAt ? (
                  <p className="mt-1 text-xs leading-5 text-text-secondary">
                    Registro: {formatDate(event.registeredAt)}
                  </p>
                ) : null}
                {event.kind === "refund" && event.reference ? (
                  <p className="mt-2 break-words text-xs leading-5 text-text-secondary">
                    Referencia: {event.reference}
                  </p>
                ) : null}
                {event.kind === "return" && event.compensated ? (
                  <p className="mt-2 text-xs font-medium leading-5 text-warning">
                    Devolucao compensada. O historico original foi preservado.
                  </p>
                ) : null}
                {event.kind === "refund" && event.cancelled ? (
                  <p className="mt-2 text-xs font-medium leading-5 text-warning">
                    Reembolso cancelado por evento compensatorio.
                  </p>
                ) : null}
                {event.description ? (
                  <p className="mt-2 break-words text-sm leading-6 text-text-primary">
                    {event.description}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <Badge
                  variant={
                    event.dimension === "Financeiro"
                      ? "info"
                      : event.dimension === "Estoque"
                        ? "success"
                        : "warning"
                  }
                >
                  {event.dimension}
                </Badge>
                <Badge
                  variant={
                    event.kind === "receipt"
                      ? "success"
                      : event.kind === "refund"
                        ? "info"
                        : "warning"
                  }
                >
                  {event.kind === "receipt"
                    ? "Recebimento"
                    : event.kind === "refund"
                      ? event.cancelled
                        ? "Reembolso cancelado"
                        : "Reembolso"
                      : event.kind === "return"
                        ? event.compensated
                          ? "Devolucao compensada"
                          : getReturnMotiveLabel(event.motive)
                        : event.motive}
                </Badge>
                {event.kind === "return" && !event.compensated ? (
                  <PurchaseEventCancelDialog
                    compraId={compraId}
                    eventId={event.id}
                    kind="return"
                    requiresPhysicalConfirmation={
                      event.requiresPhysicalConfirmation
                    }
                  />
                ) : null}
                {event.kind === "refund" && !event.cancelled ? (
                  <PurchaseEventCancelDialog
                    compraId={compraId}
                    eventId={event.id}
                    kind="refund"
                  />
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
