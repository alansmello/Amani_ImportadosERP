"use client";

import { AlertTriangle, CheckCircle2, History } from "lucide-react";

import { EmptyState } from "@/components/states/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import type { PurchaseLoss, PurchaseReceipt } from "@/types/purchase";
import type { Product } from "@/types/product";

type PurchaseHistoryProps = {
  receipts: PurchaseReceipt[];
  losses: PurchaseLoss[];
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

export function PurchaseHistory({
  receipts,
  losses,
  products
}: PurchaseHistoryProps) {
  const events = [
    ...receipts.map((receipt) => ({
      id: receipt.id,
      kind: "receipt" as const,
      produtoId: receipt.produtoId,
      quantidade: receipt.quantidade,
      date: receipt.dataRecebimento,
      description: receipt.observacao
    })),
    ...losses.map((loss) => ({
      id: loss.id,
      kind: "loss" as const,
      produtoId: loss.produtoId,
      quantidade: loss.quantidade,
      date: loss.dataPerda,
      description: loss.observacao,
      motive: loss.motivo
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (events.length === 0) {
    return (
      <EmptyState
        title="Sem historico operacional"
        description="Recebimentos e perdas registrados para esta compra aparecerao aqui."
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
          Recebimentos confirmados e perdas registradas pela fonte oficial.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {events.map((event) => (
          <div
            key={`${event.kind}-${event.id}`}
            className="rounded-amani border border-border bg-surface-light p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {event.kind === "receipt" ? (
                    <CheckCircle2
                      className="h-4 w-4 text-success"
                      aria-hidden
                    />
                  ) : (
                    <AlertTriangle
                      className="h-4 w-4 text-warning"
                      aria-hidden
                    />
                  )}
                  <p className="text-sm font-semibold text-text-primary">
                    {getProductName(products, event.produtoId)}
                  </p>
                </div>
                <p className="mt-2 text-sm text-text-secondary">
                  {event.quantidade} unidade(s) · {formatDate(event.date)}
                </p>
                {event.description ? (
                  <p className="mt-2 text-sm leading-6 text-text-primary">
                    {event.description}
                  </p>
                ) : null}
              </div>
              <Badge variant={event.kind === "receipt" ? "success" : "warning"}>
                {event.kind === "receipt" ? "Recebimento" : event.motive}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
