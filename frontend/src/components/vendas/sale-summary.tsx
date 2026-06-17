"use client";

import { CheckCircle2, CircleAlert } from "lucide-react";

import { formatSaleCurrency } from "@/components/vendas/sale-formatters";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import type { SaleDraft } from "@/types/sale";

type SaleSummaryProps = {
  draft: SaleDraft;
  canSubmit: boolean;
};

function parseDraftNumber(value: string) {
  const normalized = value.trim().replace(",", ".");
  return normalized === "" ? 0 : Number(normalized);
}

function getSafeNumber(value: string) {
  const parsed = parseDraftNumber(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function calculateItemPreview(item: SaleDraft["items"][number]) {
  const quantity = getSafeNumber(item.quantidade);
  const price = getSafeNumber(item.precoUnitario);
  const discount = getSafeNumber(item.desconto);
  const increase = getSafeNumber(item.acrescimo);

  return quantity * price - discount + increase;
}

function calculatePreviewTotal(draft: SaleDraft) {
  const itemsTotal = draft.items.reduce(
    (total, item) => total + calculateItemPreview(item),
    0
  );

  return (
    itemsTotal - getSafeNumber(draft.desconto) + getSafeNumber(draft.acrescimo)
  );
}

export function SaleSummary({ draft, canSubmit }: SaleSummaryProps) {
  const itemsTotal = draft.items.reduce(
    (total, item) => total + calculateItemPreview(item),
    0
  );
  const previewTotal = calculatePreviewTotal(draft);
  const itemCount = draft.items.length;

  return (
    <Card className="bg-surface-light">
      <CardHeader>
        <CardTitle>Resumo da venda</CardTitle>
        <CardDescription>
          Valores comerciais preenchidos antes da confirmacao oficial.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="grid gap-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-text-secondary">Itens</dt>
            <dd className="font-medium text-text-primary">{itemCount}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-text-secondary">Subtotal dos itens</dt>
            <dd className="font-medium text-text-primary">
              {formatSaleCurrency(itemsTotal)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-text-secondary">Desconto geral</dt>
            <dd className="font-medium text-text-primary">
              {formatSaleCurrency(getSafeNumber(draft.desconto))}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-text-secondary">Acrescimo geral</dt>
            <dd className="font-medium text-text-primary">
              {formatSaleCurrency(getSafeNumber(draft.acrescimo))}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
            <dt className="text-text-secondary">Total preenchido</dt>
            <dd className="text-base font-semibold text-text-primary">
              {formatSaleCurrency(previewTotal)}
            </dd>
          </div>
        </dl>

        <div className="flex items-start gap-2 rounded-amani border border-border bg-surface px-3 py-2 text-xs leading-5 text-text-secondary">
          {canSubmit ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          ) : (
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          )}
          <p>
            {canSubmit
              ? "Pronto para enviar a fonte oficial."
              : "Revise cliente, itens e valores antes de registrar."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
