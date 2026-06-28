"use client";

import { LoaderCircle, Save } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import {
  CustomerFormFields,
  type CustomerFormErrors,
  type CustomerFormValues
} from "@/components/clientes/customer-form-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { useCreateCustomer } from "@/hooks/use-customers";
import { toApiError } from "@/services/errors";
import type { Customer, CustomerPayload } from "@/types/customer";

type QuickCustomerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (customer: Customer) => void;
};

const INITIAL_VALUES: CustomerFormValues = {
  nome: "",
  email: "",
  telefone: ""
};

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

export function QuickCustomerDialog({
  open,
  onOpenChange,
  onSuccess
}: QuickCustomerDialogProps) {
  const createCustomer = useCreateCustomer();
  const [values, setValues] = useState<CustomerFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<CustomerFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Reset values when dialog is opened
  useEffect(() => {
    if (open) {
      setValues(INITIAL_VALUES);
      setErrors({});
      setSubmitError(null);
    }
  }, [open]);

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
      const newCustomer = await createCustomer.mutateAsync(validation.payload);
      onSuccess(newCustomer);
      onOpenChange(false);
    } catch (error) {
      const apiError = toApiError(error);
      setSubmitError(apiError.message);
    }
  }

  const isSubmitting = createCustomer.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>Cadastrar cliente rápido</DialogTitle>
            <DialogDescription>
              Insira o nome e opcionais para cadastrar o cliente sem perder a venda.
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 space-y-4">
            {submitError ? (
              <div className="rounded-amani border border-danger bg-surface-light px-4 py-3 text-sm leading-6 text-danger">
                {submitError}
              </div>
            ) : null}

            <CustomerFormFields
              values={values}
              errors={errors}
              disabled={isSubmitting}
              onChange={updateField}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Save className="h-4 w-4" aria-hidden />
              )}
              <span>{isSubmitting ? "Salvando" : "Salvar cliente"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
