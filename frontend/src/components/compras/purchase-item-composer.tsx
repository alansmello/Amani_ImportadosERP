"use client";

import { Check, Eraser, Pencil, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import type { Product } from "@/types/product";
import type { PurchaseItemDraft, PurchaseValidationError } from "@/types/purchase";

type PurchaseItemComposerProps = {
  item: PurchaseItemDraft;
  products: Product[];
  errors: PurchaseValidationError[];
  disabled?: boolean;
  isEditing: boolean;
  canClear?: boolean;
  submitBlockMessage?: string | null;
  onChange: (
    field: keyof Omit<PurchaseItemDraft, "id">,
    value: string
  ) => void;
  onInclude: () => void;
  onCancelEdit?: () => void;
  onClear?: () => void;
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

export function PurchaseItemComposer({
  item,
  products,
  errors,
  disabled = false,
  isEditing,
  canClear = false,
  submitBlockMessage,
  onChange,
  onInclude,
  onCancelEdit,
  onClear
}: PurchaseItemComposerProps) {
  const productError = getError(errors, "produtoId", item.id);
  const quantityError = getError(errors, "quantidade", item.id);
  const costError = getError(errors, "custoUnitario", item.id);
  const discountError = getError(errors, "desconto", item.id);
  const increaseError = getError(errors, "acrescimo", item.id);

  return (
    <div className="space-y-4 rounded-amani border border-border bg-surface-light p-4">
      <div className="flex flex-col gap-3 tablet:flex-row tablet:items-start tablet:justify-between">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-text-primary">
            {isEditing ? "Editar item confirmado" : "Compor novo item"}
          </h4>
          <p className={fieldHelpClassName}>
            Preencha um item por vez e confirme para adicionar ao carrinho.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {isEditing && onCancelEdit ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancelEdit}
              disabled={disabled}
              className="w-full tablet:w-auto"
            >
              <X className="h-4 w-4" aria-hidden />
              <span>Cancelar edicao</span>
            </Button>
          ) : null}

          {!isEditing && canClear && onClear ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClear}
              disabled={disabled}
              className="w-full tablet:w-auto"
            >
              <Eraser className="h-4 w-4" aria-hidden />
              <span>Limpar composicao</span>
            </Button>
          ) : null}
        </div>
      </div>

      {submitBlockMessage ? (
        <div className="rounded-amani border border-warning bg-surface px-3 py-3 text-xs leading-5 text-warning">
          {submitBlockMessage}
        </div>
      ) : null}

      <div className="grid gap-4">
        <div className="grid gap-2">
          <label
            className={fieldLabelClassName}
            htmlFor={`purchase-composer-product-${item.id}`}
          >
            Produto
          </label>
          <select
            id={`purchase-composer-product-${item.id}`}
            className={cn(selectClassName)}
            value={item.produtoId}
            onChange={(event) => onChange("produtoId", event.target.value)}
            disabled={disabled || products.length === 0}
            aria-invalid={Boolean(productError)}
            aria-describedby={
              productError
                ? `purchase-composer-product-${item.id}-error`
                : `purchase-composer-product-${item.id}-help`
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
            id={`purchase-composer-product-${item.id}-help`}
            className={fieldHelpClassName}
          >
            Cada produto pode aparecer apenas uma vez na compra.
          </p>
          <div id={`purchase-composer-product-${item.id}-error`}>
            <FieldError message={productError} />
          </div>
        </div>

        <div className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-4">
          <div className="grid gap-2">
            <label
              className={fieldLabelClassName}
              htmlFor={`purchase-composer-quantity-${item.id}`}
            >
              Quantidade
            </label>
            <Input
              id={`purchase-composer-quantity-${item.id}`}
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={item.quantidade}
              onChange={(event) => onChange("quantidade", event.target.value)}
              disabled={disabled}
              aria-invalid={Boolean(quantityError)}
              aria-describedby={
                quantityError
                  ? `purchase-composer-quantity-${item.id}-error`
                  : `purchase-composer-quantity-${item.id}-help`
              }
            />
            <p
              id={`purchase-composer-quantity-${item.id}-help`}
              className={fieldHelpClassName}
            >
              Informe a quantidade inteira na unidade principal do produto.
            </p>
            <div id={`purchase-composer-quantity-${item.id}-error`}>
              <FieldError message={quantityError} />
            </div>
          </div>

          <div className="grid gap-2">
            <label
              className={fieldLabelClassName}
              htmlFor={`purchase-composer-cost-${item.id}`}
            >
              Custo unitario
            </label>
            <Input
              id={`purchase-composer-cost-${item.id}`}
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={item.custoUnitario}
              onChange={(event) =>
                onChange("custoUnitario", event.target.value)
              }
              disabled={disabled}
              aria-invalid={Boolean(costError)}
              aria-describedby={
                costError
                  ? `purchase-composer-cost-${item.id}-error`
                  : undefined
              }
            />
            <div id={`purchase-composer-cost-${item.id}-error`}>
              <FieldError message={costError} />
            </div>
          </div>

          <div className="grid gap-2">
            <label
              className={fieldLabelClassName}
              htmlFor={`purchase-composer-discount-${item.id}`}
            >
              Desconto do item
            </label>
            <Input
              id={`purchase-composer-discount-${item.id}`}
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={item.desconto}
              onChange={(event) => onChange("desconto", event.target.value)}
              disabled={disabled}
              aria-invalid={Boolean(discountError)}
              aria-describedby={
                discountError
                  ? `purchase-composer-discount-${item.id}-error`
                  : undefined
              }
            />
            <div id={`purchase-composer-discount-${item.id}-error`}>
              <FieldError message={discountError} />
            </div>
          </div>

          <div className="grid gap-2">
            <label
              className={fieldLabelClassName}
              htmlFor={`purchase-composer-increase-${item.id}`}
            >
              Acrescimo do item
            </label>
            <Input
              id={`purchase-composer-increase-${item.id}`}
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={item.acrescimo}
              onChange={(event) => onChange("acrescimo", event.target.value)}
              disabled={disabled}
              aria-invalid={Boolean(increaseError)}
              aria-describedby={
                increaseError
                  ? `purchase-composer-increase-${item.id}-error`
                  : undefined
              }
            />
            <div id={`purchase-composer-increase-${item.id}-error`}>
              <FieldError message={increaseError} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-4 tablet:flex-row tablet:justify-end">
        <Button
          type="button"
          variant={isEditing ? "secondary" : "primary"}
          onClick={onInclude}
          disabled={disabled}
          className="w-full tablet:w-auto"
        >
          {isEditing ? (
            <Pencil className="h-4 w-4" aria-hidden />
          ) : (
            <Check className="h-4 w-4" aria-hidden />
          )}
          <span>
            {isEditing ? "Atualizar item" : "Incluir item na compra"}
          </span>
        </Button>
      </div>
    </div>
  );
}
