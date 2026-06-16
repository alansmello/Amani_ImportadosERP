"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import type { PurchaseItemDraft, PurchaseValidationError } from "@/types/purchase";
import type { Product } from "@/types/product";

type PurchaseItemEditorProps = {
  item: PurchaseItemDraft;
  index: number;
  products: Product[];
  errors: PurchaseValidationError[];
  disabled?: boolean;
  canRemove?: boolean;
  onChange: (
    itemId: string,
    field: keyof Omit<PurchaseItemDraft, "id">,
    value: string
  ) => void;
  onRemove: (itemId: string) => void;
};

const fieldLabelClassName = "text-sm font-medium text-text-primary";
const fieldErrorClassName = "text-xs font-medium leading-5 text-danger";
const fieldHelpClassName = "text-xs leading-5 text-text-secondary";
const selectClassName =
  "flex h-11 w-full rounded-amani border border-border bg-surface px-3 py-2 text-sm text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger";

function getError(
  errors: PurchaseValidationError[],
  field: string,
  itemId: string
) {
  return errors.find((error) => error.field === field && error.itemId === itemId)
    ?.message;
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className={fieldErrorClassName}>{message}</p>;
}

export function PurchaseItemEditor({
  item,
  index,
  products,
  errors,
  disabled = false,
  canRemove = true,
  onChange,
  onRemove
}: PurchaseItemEditorProps) {
  const productError = getError(errors, "produtoId", item.id);
  const quantityError = getError(errors, "quantidade", item.id);
  const costError = getError(errors, "custoUnitario", item.id);
  const discountError = getError(errors, "desconto", item.id);
  const increaseError = getError(errors, "acrescimo", item.id);

  return (
    <div className="rounded-amani border border-border bg-surface-light p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-text-primary">
          Item {index + 1}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled || !canRemove}
          onClick={() => onRemove(item.id)}
          aria-label={`Remover item ${index + 1}`}
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          <span>Remover</span>
        </Button>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <label
            className={fieldLabelClassName}
            htmlFor={`purchase-item-product-${item.id}`}
          >
            Produto
          </label>
          <select
            id={`purchase-item-product-${item.id}`}
            className={cn(selectClassName)}
            value={item.produtoId}
            onChange={(event) =>
              onChange(item.id, "produtoId", event.target.value)
            }
            disabled={disabled || products.length === 0}
            aria-invalid={Boolean(productError)}
            aria-describedby={
              productError
                ? `purchase-item-product-${item.id}-error`
                : `purchase-item-product-${item.id}-help`
            }
          >
            <option value="">Selecione um produto</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.nome}
              </option>
            ))}
          </select>
          <p
            id={`purchase-item-product-${item.id}-help`}
            className={fieldHelpClassName}
          >
            Cada produto pode aparecer apenas uma vez na compra.
          </p>
          <div id={`purchase-item-product-${item.id}-error`}>
            <FieldError message={productError} />
          </div>
        </div>

        <div className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-4">
          <div className="grid gap-2">
            <label
              className={fieldLabelClassName}
              htmlFor={`purchase-item-quantity-${item.id}`}
            >
              Quantidade
            </label>
            <Input
              id={`purchase-item-quantity-${item.id}`}
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={item.quantidade}
              onChange={(event) =>
                onChange(item.id, "quantidade", event.target.value)
              }
              disabled={disabled}
              aria-invalid={Boolean(quantityError)}
              aria-describedby={
                quantityError
                  ? `purchase-item-quantity-${item.id}-error`
                  : undefined
              }
            />
            <div id={`purchase-item-quantity-${item.id}-error`}>
              <FieldError message={quantityError} />
            </div>
          </div>

          <div className="grid gap-2">
            <label
              className={fieldLabelClassName}
              htmlFor={`purchase-item-cost-${item.id}`}
            >
              Custo unitario
            </label>
            <Input
              id={`purchase-item-cost-${item.id}`}
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={item.custoUnitario}
              onChange={(event) =>
                onChange(item.id, "custoUnitario", event.target.value)
              }
              disabled={disabled}
              aria-invalid={Boolean(costError)}
              aria-describedby={
                costError ? `purchase-item-cost-${item.id}-error` : undefined
              }
            />
            <div id={`purchase-item-cost-${item.id}-error`}>
              <FieldError message={costError} />
            </div>
          </div>

          <div className="grid gap-2">
            <label
              className={fieldLabelClassName}
              htmlFor={`purchase-item-discount-${item.id}`}
            >
              Desconto
            </label>
            <Input
              id={`purchase-item-discount-${item.id}`}
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={item.desconto}
              onChange={(event) =>
                onChange(item.id, "desconto", event.target.value)
              }
              disabled={disabled}
              aria-invalid={Boolean(discountError)}
              aria-describedby={
                discountError
                  ? `purchase-item-discount-${item.id}-error`
                  : undefined
              }
            />
            <div id={`purchase-item-discount-${item.id}-error`}>
              <FieldError message={discountError} />
            </div>
          </div>

          <div className="grid gap-2">
            <label
              className={fieldLabelClassName}
              htmlFor={`purchase-item-increase-${item.id}`}
            >
              Acrescimo
            </label>
            <Input
              id={`purchase-item-increase-${item.id}`}
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={item.acrescimo}
              onChange={(event) =>
                onChange(item.id, "acrescimo", event.target.value)
              }
              disabled={disabled}
              aria-invalid={Boolean(increaseError)}
              aria-describedby={
                increaseError
                  ? `purchase-item-increase-${item.id}-error`
                  : undefined
              }
            />
            <div id={`purchase-item-increase-${item.id}-error`}>
              <FieldError message={increaseError} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
