"use client";

import { Input } from "@/components/ui/input";
import type { CreateCategoryPayload } from "@/types/category";

export type CategoryFormValues = {
  nome: string;
};

export type CategoryFormErrors = Partial<Record<keyof CategoryFormValues, string>>;

type CategoryFormFieldsProps = {
  values: CategoryFormValues;
  errors: CategoryFormErrors;
  disabled?: boolean;
  idPrefix?: string;
  onChange: (field: keyof CategoryFormValues, value: string) => void;
};

export const emptyCategoryFormValues: CategoryFormValues = { nome: "" };

export function validateCategoryValues(values: CategoryFormValues) {
  const errors: CategoryFormErrors = {};
  const nome = values.nome.trim();

  if (!nome) {
    errors.nome = "Informe o nome da categoria.";
  } else if (nome.length > 150) {
    errors.nome = "O nome deve ter no maximo 150 caracteres.";
  }

  return {
    errors,
    payload: { nome } satisfies CreateCategoryPayload
  };
}

export function CategoryFormFields({
  values,
  errors,
  disabled = false,
  idPrefix = "product-category",
  onChange
}: CategoryFormFieldsProps) {
  const inputId = `${idPrefix}-name`;
  const errorId = `${inputId}-error`;

  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium text-text-primary" htmlFor={inputId}>
        Nome
      </label>
      <Input
        id={inputId}
        value={values.nome}
        onChange={(event) => onChange("nome", event.target.value)}
        disabled={disabled}
        maxLength={150}
        aria-invalid={Boolean(errors.nome)}
        aria-describedby={errors.nome ? errorId : undefined}
        autoComplete="off"
      />
      {errors.nome ? (
        <p id={errorId} className="text-xs font-medium leading-5 text-danger">
          {errors.nome}
        </p>
      ) : null}
    </div>
  );
}
