"use client";

import { LoaderCircle, Save } from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import {
  ProductFormFields,
  type ProductFormErrors,
  type ProductFormValues
} from "@/components/produtos/product-form-fields";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { toApiError } from "@/services/errors";
import type { Category } from "@/types/category";
import type { Product, ProductPayload } from "@/types/product";
import type { Supplier } from "@/types/supplier";

type ProductFormMode = "create" | "edit";

type ProductFormProps = {
  mode: ProductFormMode;
  categories: Category[];
  suppliers: Supplier[];
  initialProduct?: Product;
  isSubmitting?: boolean;
  successMessage?: string;
  onSubmit: (payload: ProductPayload) => Promise<void>;
};

function formatNumberInput(value: number | undefined) {
  if (value === undefined) {
    return "";
  }

  return String(value);
}

function buildInitialValues(initialProduct?: Product): ProductFormValues {
  return {
    nome: initialProduct?.nome ?? "",
    precoVenda: formatNumberInput(initialProduct?.precoVenda),
    custo: formatNumberInput(initialProduct?.custo),
    categoriaId: initialProduct?.categoriaId ?? "",
    fornecedorId: initialProduct?.fornecedorId ?? ""
  };
}

function parseDecimal(value: string) {
  return Number(value.replace(",", "."));
}

function validateValues(
  values: ProductFormValues,
  categories: Category[],
  suppliers: Supplier[]
) {
  const errors: ProductFormErrors = {};
  const nome = values.nome.trim();
  const precoVenda = parseDecimal(values.precoVenda);
  const custo = parseDecimal(values.custo);

  if (!nome) {
    errors.nome = "Informe o nome do produto.";
  }

  if (!values.precoVenda.trim() || Number.isNaN(precoVenda)) {
    errors.precoVenda = "Informe um preco de venda valido.";
  } else if (precoVenda < 0) {
    errors.precoVenda = "O preco de venda nao pode ser negativo.";
  }

  if (!values.custo.trim() || Number.isNaN(custo)) {
    errors.custo = "Informe um custo valido.";
  } else if (custo < 0) {
    errors.custo = "O custo nao pode ser negativo.";
  }

  if (!values.categoriaId) {
    errors.categoriaId = "Selecione uma categoria.";
  } else if (!categories.some((category) => category.id === values.categoriaId)) {
    errors.categoriaId = "Selecione uma categoria carregada pela API.";
  }

  if (
    values.fornecedorId &&
    !suppliers.some((supplier) => supplier.id === values.fornecedorId)
  ) {
    errors.fornecedorId = "Selecione um fornecedor carregado pela API.";
  }

  return {
    errors,
    payload: {
      nome,
      precoVenda,
      custo,
      categoriaId: values.categoriaId,
      fornecedorId: values.fornecedorId || null
    } satisfies ProductPayload
  };
}

export function ProductForm({
  mode,
  categories,
  suppliers,
  initialProduct,
  isSubmitting = false,
  successMessage,
  onSubmit
}: ProductFormProps) {
  const initialValues = useMemo(
    () => buildInitialValues(initialProduct),
    [initialProduct]
  );
  const [values, setValues] = useState<ProductFormValues>(initialValues);
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isCreateMode = mode === "create";
  const title = isCreateMode ? "Cadastrar produto" : "Editar produto";
  const description = isCreateMode
    ? "Preencha os dados reais do produto para salvar no catalogo."
    : "Atualize somente os campos permitidos pelo contrato de produto.";
  const submitLabel = isCreateMode ? "Salvar produto" : "Atualizar produto";

  function updateField(field: keyof ProductFormValues, value: string) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value
    }));
    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined
    }));
    setSubmitError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    const validation = validateValues(values, categories, suppliers);
    setErrors(validation.errors);

    if (Object.keys(validation.errors).length > 0) {
      return;
    }

    try {
      await onSubmit(validation.payload);
    } catch (error) {
      const apiError = toApiError(error);
      setSubmitError(apiError.message);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} noValidate>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {submitError ? (
            <div className="rounded-amani border border-danger bg-surface-light px-4 py-3 text-sm leading-6 text-danger">
              {submitError}
            </div>
          ) : null}

          {successMessage ? (
            <div className="rounded-amani border border-success bg-surface-light px-4 py-3 text-sm leading-6 text-text-primary">
              {successMessage}
            </div>
          ) : null}

          <ProductFormFields
            values={values}
            errors={errors}
            categories={categories}
            suppliers={suppliers}
            disabled={isSubmitting}
            onChange={updateField}
          />
        </CardContent>
        <CardFooter className="flex-col items-stretch tablet:flex-row tablet:justify-end">
          <Button
            type="submit"
            disabled={isSubmitting || categories.length === 0}
          >
            {isSubmitting ? (
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Save className="h-4 w-4" aria-hidden />
            )}
            <span>{isSubmitting ? "Salvando" : submitLabel}</span>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
