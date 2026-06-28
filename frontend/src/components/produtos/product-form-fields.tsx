"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Category } from "@/types/category";
import type { Supplier } from "@/types/supplier";

export type ProductFormValues = {
  nome: string;
  precoVenda: string;
  custo: string;
  categoriaId: string;
  fornecedorId: string;
};

export type ProductFormErrors = Partial<Record<keyof ProductFormValues, string>>;

type ProductFormFieldsProps = {
  values: ProductFormValues;
  errors: ProductFormErrors;
  categories: Category[];
  suppliers: Supplier[];
  disabled?: boolean;
  allowQuickCreate?: boolean;
  onCreateCategory?: () => void;
  onCreateSupplier?: () => void;
  onChange: (field: keyof ProductFormValues, value: string) => void;
};

const fieldLabelClassName = "text-sm font-medium text-text-primary";
const fieldHelpClassName = "text-xs leading-5 text-text-secondary";
const fieldErrorClassName = "text-xs font-medium leading-5 text-danger";
const selectClassName =
  "flex h-11 w-full rounded-amani border border-border bg-surface px-3 py-2 text-sm text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className={fieldErrorClassName}>{message}</p>;
}

export function ProductFormFields({
  values,
  errors,
  categories,
  suppliers,
  disabled = false,
  allowQuickCreate = false,
  onCreateCategory,
  onCreateSupplier,
  onChange
}: ProductFormFieldsProps) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <label className={fieldLabelClassName} htmlFor="product-name">
          Nome
        </label>
        <Input
          id="product-name"
          value={values.nome}
          onChange={(event) => onChange("nome", event.target.value)}
          disabled={disabled}
          aria-invalid={Boolean(errors.nome)}
          aria-describedby={errors.nome ? "product-name-error" : undefined}
          autoComplete="off"
        />
        <div id="product-name-error">
          <FieldError message={errors.nome} />
        </div>
      </div>

      <div className="grid gap-5 tablet:grid-cols-2">
        <div className="grid gap-2">
          <label className={fieldLabelClassName} htmlFor="product-price">
            Preco de venda
          </label>
          <Input
            id="product-price"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={values.precoVenda}
            onChange={(event) => onChange("precoVenda", event.target.value)}
            disabled={disabled}
            aria-invalid={Boolean(errors.precoVenda)}
            aria-describedby={
              errors.precoVenda ? "product-price-error" : undefined
            }
          />
          <div id="product-price-error">
            <FieldError message={errors.precoVenda} />
          </div>
        </div>

        <div className="grid gap-2">
          <label className={fieldLabelClassName} htmlFor="product-cost">
            Custo
          </label>
          <Input
            id="product-cost"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={values.custo}
            onChange={(event) => onChange("custo", event.target.value)}
            disabled={disabled}
            aria-invalid={Boolean(errors.custo)}
            aria-describedby={errors.custo ? "product-cost-error" : undefined}
          />
          <div id="product-cost-error">
            <FieldError message={errors.custo} />
          </div>
        </div>
      </div>

      <div className="grid gap-5 tablet:grid-cols-2">
        <div className="grid gap-2">
          <div className="flex flex-col gap-2 tablet:flex-row tablet:items-center tablet:justify-between">
            <label className={fieldLabelClassName} htmlFor="product-category">
              Categoria
            </label>
            {allowQuickCreate ? (
              <Button type="button" variant="secondary" size="sm" onClick={onCreateCategory} disabled={disabled}>
                <Plus className="h-4 w-4" aria-hidden />
                <span>Cadastrar categoria</span>
              </Button>
            ) : null}
          </div>
          <select
            id="product-category"
            className={cn(selectClassName)}
            value={values.categoriaId}
            onChange={(event) => onChange("categoriaId", event.target.value)}
            disabled={disabled || categories.length === 0}
            aria-invalid={Boolean(errors.categoriaId)}
            aria-describedby={
              errors.categoriaId
                ? "product-category-error"
                : "product-category-help"
            }
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nome}
              </option>
            ))}
          </select>
          <p id="product-category-help" className={fieldHelpClassName}>
            Obrigatoria para salvar o produto.
          </p>
          <div id="product-category-error">
            <FieldError message={errors.categoriaId} />
          </div>
        </div>

        <div className="grid gap-2">
          <div className="flex flex-col gap-2 tablet:flex-row tablet:items-center tablet:justify-between">
            <label className={fieldLabelClassName} htmlFor="product-supplier">
              Fornecedor
            </label>
            {allowQuickCreate ? (
              <Button type="button" variant="secondary" size="sm" onClick={onCreateSupplier} disabled={disabled}>
                <Plus className="h-4 w-4" aria-hidden />
                <span>Cadastrar fornecedor</span>
              </Button>
            ) : null}
          </div>
          <select
            id="product-supplier"
            className={cn(selectClassName)}
            value={values.fornecedorId}
            onChange={(event) => onChange("fornecedorId", event.target.value)}
            disabled={disabled}
            aria-invalid={Boolean(errors.fornecedorId)}
            aria-describedby={
              errors.fornecedorId ? "product-supplier-error" : undefined
            }
          >
            <option value="">Sem fornecedor</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.nome}
              </option>
            ))}
          </select>
          {suppliers.length === 0 ? (
            <p className={fieldHelpClassName}>
              Nenhum fornecedor disponivel. O produto pode ser salvo sem
              fornecedor.
            </p>
          ) : null}
          <div id="product-supplier-error">
            <FieldError message={errors.fornecedorId} />
          </div>
        </div>
      </div>
    </div>
  );
}
