"use client";

import { AlertCircle, CalendarClock, LoaderCircle, Save } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";

import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCustomers } from "@/hooks/use-customers";
import {
  useCreateReceivable,
  useUpdateReceivable
} from "@/hooks/use-receivables";
import { cn } from "@/lib/cn";
import { toApiError } from "@/services/errors";
import type { CreateReceivablePayload, UpdateReceivablePayload } from "@/types/receivable";

type CreateModeProps = {
  mode?: "create";
  onCreated?: () => void;
};

type EditModeProps = {
  mode: "edit";
  receivableId: string;
  initialValor: number;
  initialDataVencimento: string;
  onUpdated?: () => void;
};

type ReceivableFormProps = CreateModeProps | EditModeProps;

type FormDraft = {
  clienteId: string;
  valor: string;
  dataVencimento: string;
};

type FormErrors = {
  clienteId?: string;
  valor?: string;
  dataVencimento?: string;
};

const fieldLabelClassName = "text-sm font-medium text-text-primary";
const fieldErrorClassName = "text-xs font-medium leading-5 text-danger";
const selectClassName =
  "flex h-11 w-full rounded-amani border border-border bg-surface px-3 py-2 text-sm text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger";

function isDateInPast(dateStr: string): boolean {
  if (!dateStr) return false;
  const today = new Date().toISOString().slice(0, 10);
  return dateStr < today;
}

function buildInitialDraft(props: ReceivableFormProps): FormDraft {
  if (props.mode === "edit") {
    return {
      clienteId: "",
      valor: String(props.initialValor),
      dataVencimento: props.initialDataVencimento.slice(0, 10)
    };
  }
  return { clienteId: "", valor: "", dataVencimento: "" };
}

function validateDraft(draft: FormDraft, isEdit: boolean): FormErrors {
  const errors: FormErrors = {};

  if (!isEdit && !draft.clienteId) {
    errors.clienteId = "Selecione um cliente.";
  }

  const valor = Number(draft.valor);
  if (!draft.valor.trim()) {
    errors.valor = "Informe o valor.";
  } else if (isNaN(valor) || valor <= 0) {
    errors.valor = "Informe um valor maior que zero.";
  }

  if (!draft.dataVencimento) {
    errors.dataVencimento = "Informe a data de vencimento.";
  }

  return errors;
}

function hasErrors(errors: FormErrors): boolean {
  return Object.values(errors).some(Boolean);
}

export function ReceivableForm(props: ReceivableFormProps) {
  const isEdit = props.mode === "edit";

  const customersQuery = useCustomers();
  const createReceivable = useCreateReceivable();
  const updateReceivable = useUpdateReceivable();

  const [draft, setDraft] = useState<FormDraft>(() => buildInitialDraft(props));
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isSubmitting = isEdit
    ? updateReceivable.isPending
    : createReceivable.isPending;
  const customers = customersQuery.data ?? [];
  const isPastDate = isDateInPast(draft.dataVencimento);

  function updateField(field: keyof FormDraft, value: string) {
    setDraft((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setSubmitError(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const validationErrors = validateDraft(draft, isEdit);
    setErrors(validationErrors);

    if (hasErrors(validationErrors)) {
      return;
    }

    setSubmitError(null);

    try {
      if (isEdit && props.mode === "edit") {
        const payload: UpdateReceivablePayload = {
          valor: Number(draft.valor),
          dataVencimento: draft.dataVencimento
        };
        await updateReceivable.mutateAsync({
          id: props.receivableId,
          payload
        });
        props.onUpdated?.();
      } else if (!isEdit && props.mode !== "edit") {
        const payload: CreateReceivablePayload = {
          clienteId: draft.clienteId,
          valor: Number(draft.valor),
          dataVencimento: draft.dataVencimento
        };
        await createReceivable.mutateAsync(payload);
        props.onCreated?.();
      }
    } catch (error) {
      const apiError = toApiError(error);
      setSubmitError(apiError.message);
    }
  }

  if (!isEdit && customersQuery.isLoading) {
    return (
      <LoadingState
        title="Carregando clientes"
        description="Aguarde enquanto os clientes sao carregados."
      />
    );
  }

  if (!isEdit && customersQuery.isError) {
    return (
      <ErrorState
        title="Nao foi possivel carregar os clientes"
        description="Verifique a conexao e tente novamente."
        onRetry={() => void customersQuery.refetch()}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Card>
        <CardHeader>
          <CardTitle>
            {isEdit ? "Editar conta a receber" : "Nova conta a receber"}
          </CardTitle>
        </CardHeader>

        <CardContent className="grid gap-5 tablet:grid-cols-2">
          {submitError ? (
            <div className="col-span-full flex items-start gap-2 rounded-amani border border-danger bg-surface-light px-4 py-3 text-sm leading-6 text-danger">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>{submitError}</span>
            </div>
          ) : null}

          {!isEdit ? (
            <div className="col-span-full grid gap-2">
              <label
                className={fieldLabelClassName}
                htmlFor="receivable-cliente"
              >
                Cliente
              </label>
              <select
                id="receivable-cliente"
                className={cn(selectClassName)}
                value={draft.clienteId}
                onChange={(e) => updateField("clienteId", e.target.value)}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.clienteId)}
                aria-describedby={
                  errors.clienteId ? "receivable-cliente-error" : undefined
                }
              >
                <option value="">Selecione um cliente</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.nome}
                  </option>
                ))}
              </select>
              {errors.clienteId ? (
                <p
                  id="receivable-cliente-error"
                  className={fieldErrorClassName}
                >
                  {errors.clienteId}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="grid gap-2">
            <label
              className={fieldLabelClassName}
              htmlFor="receivable-valor"
            >
              Valor (R$)
            </label>
            <Input
              id="receivable-valor"
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              placeholder="0,00"
              value={draft.valor}
              onChange={(e) => updateField("valor", e.target.value)}
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.valor)}
              aria-describedby={
                errors.valor ? "receivable-valor-error" : undefined
              }
            />
            {errors.valor ? (
              <p id="receivable-valor-error" className={fieldErrorClassName}>
                {errors.valor}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label
              className={fieldLabelClassName}
              htmlFor="receivable-data-vencimento"
            >
              Data de vencimento
            </label>
            <Input
              id="receivable-data-vencimento"
              type="date"
              value={draft.dataVencimento}
              onChange={(e) => updateField("dataVencimento", e.target.value)}
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.dataVencimento)}
              aria-describedby={
                errors.dataVencimento
                  ? "receivable-data-error"
                  : isPastDate
                    ? "receivable-data-help"
                    : undefined
              }
            />
            {errors.dataVencimento ? (
              <p id="receivable-data-error" className={fieldErrorClassName}>
                {errors.dataVencimento}
              </p>
            ) : isPastDate ? (
              <p
                id="receivable-data-help"
                className="flex items-center gap-1 text-xs leading-5 text-text-secondary"
              >
                <CalendarClock
                  className="h-3.5 w-3.5 shrink-0"
                  aria-hidden
                />
                Data no passado. A conta sera salva normalmente.
              </p>
            ) : null}
          </div>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full tablet:w-auto"
          >
            {isSubmitting ? (
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Save className="h-4 w-4" aria-hidden />
            )}
            <span>
              {isSubmitting
                ? "Salvando"
                : isEdit
                  ? "Salvar alteracoes"
                  : "Criar conta"}
            </span>
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
