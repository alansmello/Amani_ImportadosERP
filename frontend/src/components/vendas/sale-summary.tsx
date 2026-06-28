"use client";

import { CheckCircle2, CircleAlert, Pencil, Trash2 } from "lucide-react";

import { formatSaleCurrency } from "@/components/vendas/sale-formatters";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import type { Product } from "@/types/product";
import type { SaleDraft } from "@/types/sale";

type SaleSummaryProps = {
  draft: SaleDraft;
  products: Product[];
  canSubmit: boolean;
  disabled?: boolean;
  onEditItem?: (itemId: string) => void;
  onRemoveItem?: (itemId: string) => void;
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
export function SaleSummary({
  draft,
  products,
  canSubmit,
  disabled = false,
  onEditItem,
  onRemoveItem
}: SaleSummaryProps) {
  const itemsSubtotal = draft.items.reduce(
    (total, item) =>
      total + getSafeNumber(item.quantidade) * getSafeNumber(item.precoUnitario),
    0
  );
  const itemsDiscountTotal = draft.items.reduce(
    (total, item) => total + getSafeNumber(item.desconto),
    0
  );
  const itemsIncreaseTotal = draft.items.reduce(
    (total, item) => total + getSafeNumber(item.acrescimo),
    0
  );
  const itemsNetTotal = draft.items.reduce(
    (total, item) => total + calculateItemPreview(item),
    0
  );
  const previewTotal =
    itemsNetTotal - getSafeNumber(draft.desconto) + getSafeNumber(draft.acrescimo);
  const itemCount = draft.items.length;
  const productsById = new Map(products.map((product) => [product.id, product.nome]));

  return (
    <Card className="bg-surface-light">
      <CardHeader>
        <CardTitle>Resumo da venda</CardTitle>
        <CardDescription>
          Valores comerciais preenchidos antes da confirmacao oficial.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            Itens confirmados
          </p>
          {draft.items.length === 0 ? (
            <div className="rounded-amani border border-dashed border-border bg-surface px-3 py-3 text-xs text-text-secondary">
              Nenhum item confirmado ainda. Use o compositor ao lado para incluir.
            </div>
          ) : (
            <div className="space-y-2">
              {draft.items.map((item, index) => {
                const quantity = getSafeNumber(item.quantidade);
                const price = getSafeNumber(item.precoUnitario);
                const net = calculateItemPreview(item);
                const productName =
                  productsById.get(item.produtoId) ?? "Produto nao encontrado";

                return (
                  <div
                    key={item.id}
                    className="rounded-amani border border-border bg-surface px-3 py-3"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-text-primary">
                            {index + 1}. {productName}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-text-secondary">
                            {quantity} x {formatSaleCurrency(price)}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-text-primary">
                          {formatSaleCurrency(net)}
                        </p>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        {onEditItem ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            disabled={disabled}
                            onClick={() => onEditItem(item.id)}
                          >
                            <Pencil className="h-4 w-4" aria-hidden />
                            <span>Editar</span>
                          </Button>
                        ) : null}
                        {onRemoveItem ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            disabled={disabled}
                            onClick={() => onRemoveItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden />
                            <span>Remover</span>
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <dl className="grid gap-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-text-secondary">Itens</dt>
            <dd className="font-medium text-text-primary">{itemCount}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-text-secondary">Subtotal bruto dos itens</dt>
            <dd className="font-medium text-text-primary">
              {formatSaleCurrency(itemsSubtotal)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-text-secondary">Descontos dos itens</dt>
            <dd className="font-medium text-text-primary">
              {formatSaleCurrency(itemsDiscountTotal)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-text-secondary">Acrescimos dos itens</dt>
            <dd className="font-medium text-text-primary">
              {formatSaleCurrency(itemsIncreaseTotal)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-text-secondary">Subtotal liquido dos itens</dt>
            <dd className="font-medium text-text-primary">
              {formatSaleCurrency(itemsNetTotal)}
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
