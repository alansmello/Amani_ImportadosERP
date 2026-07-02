"use client";

import { CheckCircle2, CircleAlert, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import type { Product } from "@/types/product";
import type { PurchaseDraft } from "@/types/purchase";

type PurchaseSummaryProps = {
  draft: PurchaseDraft;
  products: Product[];
  canSubmit: boolean;
  disabled?: boolean;
  editingItemId?: string | null;
  onEditItem?: (itemId: string) => void;
  onRemoveItem?: (itemId: string) => void;
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

function parseDraftNumber(value: string) {
  const normalized = value.trim().replace(",", ".");
  return normalized === "" ? 0 : Number(normalized);
}

function getSafeNumber(value: string) {
  const parsed = parseDraftNumber(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function calculateItemGross(item: PurchaseDraft["items"][number]) {
  return getSafeNumber(item.quantidade) * getSafeNumber(item.custoUnitario);
}

function calculateItemNet(item: PurchaseDraft["items"][number]) {
  return (
    calculateItemGross(item) -
    getSafeNumber(item.desconto) +
    getSafeNumber(item.acrescimo)
  );
}

export function PurchaseSummary({
  draft,
  products,
  canSubmit,
  disabled = false,
  editingItemId,
  onEditItem,
  onRemoveItem
}: PurchaseSummaryProps) {
  const itemCount = draft.items.length;
  const productsById = new Map(products.map((product) => [product.id, product]));
  const itemsSubtotal = draft.items.reduce(
    (total, item) => total + calculateItemGross(item),
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
    (total, item) => total + calculateItemNet(item),
    0
  );
  const previewTotal =
    itemsNetTotal - getSafeNumber(draft.desconto) + getSafeNumber(draft.acrescimo);

  return (
    <Card className="bg-surface-light">
      <CardHeader>
        <CardTitle>Carrinho da compra</CardTitle>
        <CardDescription>
          Revise os itens confirmados antes do registro oficial da compra.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            Itens confirmados
          </p>

          {itemCount === 0 ? (
            <div className="rounded-amani border border-dashed border-border bg-surface px-3 py-3 text-xs leading-5 text-text-secondary">
              Nenhum item confirmado ainda. Use o compositor para adicionar ao
              carrinho.
            </div>
          ) : (
            <div className="space-y-2">
              {draft.items.map((item, index) => {
                const productName =
                  productsById.get(item.produtoId)?.nome ?? "Produto nao encontrado";
                const quantity = getSafeNumber(item.quantidade);
                const cost = getSafeNumber(item.custoUnitario);
                const gross = calculateItemGross(item);
                const net = calculateItemNet(item);
                const isEditingItem = editingItemId === item.id;

                return (
                  <div
                    key={item.id}
                    className="rounded-amani border border-border bg-surface px-3 py-3"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-3 tablet:flex-row tablet:items-start tablet:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="break-words text-sm font-medium text-text-primary">
                              {index + 1}. {productName}
                            </p>
                            {isEditingItem ? (
                              <span className="rounded-full border border-warning px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-warning">
                                Em edicao
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-xs leading-5 text-text-secondary">
                            {quantity} un. x {formatCurrency(cost)}
                          </p>
                          <p className="text-xs leading-5 text-text-secondary">
                            Bruto {formatCurrency(gross)} | Desc.{" "}
                            {formatCurrency(getSafeNumber(item.desconto))} | Acr.{" "}
                            {formatCurrency(getSafeNumber(item.acrescimo))}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold text-text-primary">
                          {formatCurrency(net)}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 tablet:flex-row tablet:justify-end">
                        {onEditItem ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            disabled={disabled || Boolean(editingItemId)}
                            onClick={() => onEditItem(item.id)}
                            className="w-full tablet:w-auto"
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
                            disabled={disabled || Boolean(editingItemId)}
                            onClick={() => onRemoveItem(item.id)}
                            className="w-full tablet:w-auto"
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
            <dt className="text-text-secondary">Subtotal bruto consultivo</dt>
            <dd className="font-medium text-text-primary">
              {formatCurrency(itemsSubtotal)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-text-secondary">Descontos dos itens</dt>
            <dd className="font-medium text-text-primary">
              {formatCurrency(itemsDiscountTotal)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-text-secondary">Acrescimos dos itens</dt>
            <dd className="font-medium text-text-primary">
              {formatCurrency(itemsIncreaseTotal)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-text-secondary">Subtotal liquido consultivo</dt>
            <dd className="font-medium text-text-primary">
              {formatCurrency(itemsNetTotal)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-text-secondary">Desconto geral preenchido</dt>
            <dd className="font-medium text-text-primary">
              {formatCurrency(getSafeNumber(draft.desconto))}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-text-secondary">Acrescimo geral preenchido</dt>
            <dd className="font-medium text-text-primary">
              {formatCurrency(getSafeNumber(draft.acrescimo))}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
            <dt className="text-text-secondary">Total preenchido consultivo</dt>
            <dd className="text-base font-semibold text-text-primary">
              {formatCurrency(previewTotal)}
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
              ? "Itens confirmados e compra pronta para enviar ao backend."
              : "Revise fornecedor, itens confirmados e qualquer composicao pendente antes de registrar."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
