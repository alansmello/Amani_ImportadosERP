"use client";

import { LoaderCircle, Save } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import {
  CustomerFormFields,
  type CustomerFormErrors,
  type CustomerFormValues
} from "@/components/clientes/customer-form-fields";
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
import type { Customer, CustomerPayload } from "@/types/customer";

type CustomerFormMode = "create" | "edit";

type CustomerFormProps = {
  mode: CustomerFormMode;
  initialCustomer?: Customer;
  isSubmitting?: boolean;
  successMessage?: string;
  onSubmit: (payload: CustomerPayload) => Promise<void>;
};

function buildInitialValues(initialCustomer?: Customer): CustomerFormValues {
  return {
    nome: initialCustomer?.nome ?? "",
    email: initialCustomer?.email ?? "",
    telefone: initialCustomer?.telefone ?? ""
  };
}

function normalizeOptional(value: string) {
  const normalizedValue = value.trim();

  return normalizedValue ? normalizedValue : null;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateValues(values: CustomerFormValues) {
  const errors: CustomerFormErrors = {};
  const nome = values.nome.trim();
  const email = normalizeOptional(values.email);
  const telefone = normalizeOptional(values.telefone);

  if (!nome) {
    errors.nome = "Informe o nome do cliente.";
  }

  if (email && !isValidEmail(email)) {
    errors.email = "Informe um email valido.";
  }

  return {
    errors,
    payload: {
      nome,
      email,
      telefone
    } satisfies CustomerPayload
  };
}

export function CustomerForm({
  mode,
  initialCustomer,
  isSubmitting = false,
  successMessage,
  onSubmit
}: CustomerFormProps) {
  const initialValues = useMemo(
    () => buildInitialValues(initialCustomer),
    [initialCustomer]
  );
  const [values, setValues] = useState<CustomerFormValues>(initialValues);
  const [errors, setErrors] = useState<CustomerFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setValues(initialValues);
    setErrors({});
    setSubmitError(null);
  }, [initialValues]);

  const isCreateMode = mode === "create";
  const title = isCreateMode ? "Cadastrar cliente" : "Editar cliente";
  const description = isCreateMode
    ? "Preencha os dados reais do cliente para salvar na carteira."
    : "Atualize somente os campos permitidos pelo contrato de cliente.";
  const submitLabel = isCreateMode ? "Salvar cliente" : "Atualizar cliente";

  function updateField(field: keyof CustomerFormValues, value: string) {
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

    const validation = validateValues(values);
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

          <CustomerFormFields
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
