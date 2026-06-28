"use client";

import { LoaderCircle, Save } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import {
  SupplierFormFields,
  type SupplierFormErrors,
  type SupplierFormValues
} from "@/components/fornecedores/supplier-form-fields";
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
import type { Supplier, SupplierPayload } from "@/types/supplier";

type SupplierFormMode = "create" | "edit";

type SupplierFormProps = {
  mode: SupplierFormMode;
  initialSupplier?: Supplier;
  isSubmitting?: boolean;
  successMessage?: string;
  onSubmit: (payload: SupplierPayload) => Promise<void>;
};

function buildInitialValues(initialSupplier?: Supplier): SupplierFormValues {
  return {
    nome: initialSupplier?.nome ?? "",
    telefone: initialSupplier?.telefone ?? ""
  };
}

export function validateSupplierValues(values: SupplierFormValues) {
  const errors: SupplierFormErrors = {};
  const nome = values.nome.trim();
  const telefone = values.telefone.trim();

  if (!nome) {
    errors.nome = "Informe o nome do fornecedor.";
  }

  if (telefone.length > 50) {
    errors.telefone = "O telefone deve ter no maximo 50 caracteres.";
  }

  return {
    errors,
    payload: {
      nome,
      telefone: telefone || null
    } satisfies SupplierPayload
  };
}

export function SupplierForm({
  mode,
  initialSupplier,
  isSubmitting = false,
  successMessage,
  onSubmit
}: SupplierFormProps) {
  const initialValues = useMemo(
    () => buildInitialValues(initialSupplier),
    [initialSupplier]
  );
  const [values, setValues] = useState<SupplierFormValues>(initialValues);
  const [errors, setErrors] = useState<SupplierFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setValues(initialValues);
    setErrors({});
    setSubmitError(null);
  }, [initialValues]);

  const isCreateMode = mode === "create";
  const title = isCreateMode ? "Cadastrar fornecedor" : "Editar fornecedor";
  const description = isCreateMode
    ? "Informe o nome e, se disponivel, o telefone do fornecedor."
    : "Atualize os dados operacionais do fornecedor.";
  const submitLabel = isCreateMode ? "Salvar fornecedor" : "Atualizar fornecedor";

  function updateField(field: keyof SupplierFormValues, value: string) {
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

    const validation = validateSupplierValues(values);
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

          <SupplierFormFields
            values={values}
            errors={errors}
            disabled={isSubmitting}
            onChange={updateField}
          />
        </CardContent>
        <CardFooter className="flex-col items-stretch tablet:flex-row tablet:justify-end">
          <Button type="submit" disabled={isSubmitting}>
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
