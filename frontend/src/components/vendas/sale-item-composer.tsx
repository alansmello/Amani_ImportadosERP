"use client";

import { Check, X } from "lucide-react";

import { formatSaleQuantity } from "@/components/vendas/sale-formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import type { Product } from "@/types/product";
import type { SaleItemDraft, SaleValidationError } from "@/types/sale";
import type { StockProduct } from "@/types/stock";

type SaleItemComposerProps = {
  item: SaleItemDraft;
  products: Product[];
  stockByProductId: Map<string, StockProduct>;
  errors: SaleValidationError[];
  disabled?: boolean;
  isEditing: boolean;
  onChange: (
    field: keyof Omit<SaleItemDraft, "id">,
    value: string
  ) => void;
  onInclude: () => void;
  onCancelEdit?: () => void;
};

const fieldLabelClassName = "text-sm font-medium text-text-primary";
const fieldErrorClassName = "text-xs font-medium leading-5 text-danger";
const selectClassName =
  "flex h-11 w-full rounded-amani border border-border bg-surface px-3 py-2 text-sm text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger";

function getError(
  errors: SaleValidationError[],
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

function StockHint({
  item,
  stockByProductId
}: {
  item: SaleItemDraft;
  stockByProductId: Map<string, StockProduct>;
}) {
  if (!item.produtoId) {
    return null;
  }

  const stock = stockByProductId.get(item.produtoId);

  if (!stock) {
    return (
      <p className="text-xs leading-5 text-warning">
        Saldo nao encontrado no estoque carregado.
      </p>
    );
  }

  if (stock.saldoAtual <= 0) {
    return (
      <p className="text-xs leading-5 text-warning">
        Sem saldo disponivel no estoque carregado.
      </p>
    );
  }

  return (
    <p className="text-xs leading-5 text-text-secondary">
      Saldo exibido: {formatSaleQuantity(stock.saldoAtual)}. O backend confirma
      a disponibilidade ao registrar.
    </p>
  );
}

export function SaleItemComposer({
  item,
  products,
  stockByProductId,
  errors,
  disabled = false,
  isEditing,
  onChange,
  onInclude,
  onCancelEdit
}: SaleItemComposerProps) {
  const productError = getError(errors, "produtoId", item.id);
  const quantityError = getError(errors, "quantidade", item.id);
  const priceError = getError(errors, "precoUnitario", item.id);
  const discountError = getError(errors, "desconto", item.id);
  const increaseError = getError(errors, "acrescimo", item.id);

  return (
    <div className="rounded-amani border border-border bg-surface-light p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-text-primary">
          {isEditing ? "Editar item selecionado" : "Compor novo item"}
        </h4>
        {isEditing && onCancelEdit && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancelEdit}
            disabled={disabled}
          >
            <X className="h-4 w-4" aria-hidden />
            <span>Cancelar edição</span>
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <label
            className={fieldLabelClassName}
            htmlFor={`composer-product-${item.id}`}
          >
            Produto
          </label>
          <select
            id={`composer-product-${item.id}`}
            className={cn(selectClassName)}
            value={item.produtoId}
            onChange={(event) => onChange("produtoId", event.target.value)}
            disabled={disabled || products.length === 0}
            aria-invalid={Boolean(productError)}
            aria-describedby={
              productError
                ? `composer-product-${item.id}-error`
                : `composer-product-${item.id}-help`
            }
          >
            <option value="">Selecione um produto</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.nome}
              </option>
            ))}
          </select>
          <div id={`composer-product-${item.id}-help`} className="space-y-1">
            <StockHint item={item} stockByProductId={stockByProductId} />
          </div>
          <div id={`composer-product-${item.id}-error`}>
            <FieldError message={productError} />
          </div>
        </div>

        <div className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-4">
          <div className="grid gap-2">
            <label
              className={fieldLabelClassName}
              htmlFor={`composer-quantity-${item.id}`}
            >
              Quantidade
            </label>
            <Input
              id={`composer-quantity-${item.id}`}
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={item.quantidade}
              onChange={(event) => onChange("quantidade", event.target.value)}
              disabled={disabled}
              aria-invalid={Boolean(quantityError)}
              aria-describedby={
                quantityError ? `composer-quantity-${item.id}-error` : undefined
              }
            />
            <div id={`composer-quantity-${item.id}-error`}>
              <FieldError message={quantityError} />
            </div>
          </div>

          <div className="grid gap-2">
            <label
              className={fieldLabelClassName}
              htmlFor={`composer-price-${item.id}`}
            >
              Preco unitario
            </label>
            <Input
              id={`composer-price-${item.id}`}
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={item.precoUnitario}
              onChange={(event) => onChange("precoUnitario", event.target.value)}
              disabled={disabled}
              aria-invalid={Boolean(priceError)}
              aria-describedby={
                priceError ? `composer-price-${item.id}-error` : undefined
              }
            />
            <div id={`composer-price-${item.id}-error`}>
              <FieldError message={priceError} />
            </div>
          </div>

          <div className="grid gap-2">
            <label
              className={fieldLabelClassName}
              htmlFor={`composer-discount-${item.id}`}
            >
              Desconto do item
            </label>
            <Input
              id={`composer-discount-${item.id}`}
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={item.desconto}
              onChange={(event) => onChange("desconto", event.target.value)}
              disabled={disabled}
              aria-invalid={Boolean(discountError)}
              aria-describedby={
                discountError ? `composer-discount-${item.id}-error` : undefined
              }
            />
            <div id={`composer-discount-${item.id}-error`}>
              <FieldError message={discountError} />
            </div>
          </div>

          <div className="grid gap-2">
            <label
              className={fieldLabelClassName}
              htmlFor={`composer-increase-${item.id}`}
            >
              Acrescimo do item
            </label>
            <Input
              id={`composer-increase-${item.id}`}
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={item.acrescimo}
              onChange={(event) => onChange("acrescimo", event.target.value)}
              disabled={disabled}
              aria-invalid={Boolean(increaseError)}
              aria-describedby={
                increaseError ? `composer-increase-${item.id}-error` : undefined
              }
            />
            <div id={`composer-increase-${item.id}-error`}>
              <FieldError message={increaseError} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="button"
          onClick={onInclude}
          disabled={disabled}
          className="w-full tablet:w-auto"
        >
          <Check className="h-4 w-4" aria-hidden />
          <span>{isEditing ? "Atualizar item" : "Incluir item na venda"}</span>
        </Button>
      </div>
    </div>
  );
}
