"use client";

import { AlertCircle, ArrowLeft, LoaderCircle, Save } from "lucide-react";
import Link from "next/link";
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
import { routes } from "@/config/routes";
import { useExpenseCategories } from "@/hooks/use-expense-categories";
import { useCreateExpense } from "@/hooks/use-expenses";
import { cn } from "@/lib/cn";
import { toApiError } from "@/services/errors";
import type { ExpensePaymentMethod } from "@/types/expense";

type ExpenseDraft = {
  dataCompetencia: string;
  valor: string;
  descricao: string;
  categoriaDespesaId: string;
  formaPagamento: string;
};

type ExpenseErrors = Partial<Record<keyof ExpenseDraft, string>>;

type ExpenseFormProps = {
  onCreated?: () => void;
};

const paymentMethods: ExpensePaymentMethod[] = [
  "Dinheiro",
  "PIX",
  "CartaoDebito",
  "CartaoCredito"
];

const initialDraft: ExpenseDraft = {
  dataCompetencia: new Date().toISOString().slice(0, 10),
  valor: "",
  descricao: "",
  categoriaDespesaId: "",
  formaPagamento: ""
};

const fieldLabelClassName = "text-sm font-medium text-text-primary";
const fieldErrorClassName = "text-xs font-medium leading-5 text-danger";
const selectClassName =
  "flex h-11 w-full rounded-amani border border-border bg-surface px-3 py-2 text-sm text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger";
const textareaClassName =
  "flex min-h-24 w-full rounded-amani border border-border bg-surface px-3 py-2 text-sm text-text-primary transition-colors placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger";

function validateDraft(draft: ExpenseDraft): ExpenseErrors {
  const errors: ExpenseErrors = {};
  const valor = Number(draft.valor);

  if (!draft.dataCompetencia) {
    errors.dataCompetencia = "Informe a data de competencia.";
  }

  if (!draft.categoriaDespesaId) {
    errors.categoriaDespesaId = "Selecione uma categoria ativa.";
  }

  if (!draft.formaPagamento) {
    errors.formaPagamento = "Selecione a forma de pagamento.";
  } else if (!paymentMethods.includes(draft.formaPagamento as ExpensePaymentMethod)) {
    errors.formaPagamento = "Forma de pagamento invalida para despesa.";
  }

  if (!draft.descricao.trim()) {
    errors.descricao = "Informe a descricao da despesa.";
  }

  if (!draft.valor.trim()) {
    errors.valor = "Informe o valor.";
  } else if (Number.isNaN(valor) || valor <= 0) {
    errors.valor = "Informe um valor maior que zero.";
  }

  return errors;
}

function hasErrors(errors: ExpenseErrors) {
  return Object.values(errors).some(Boolean);
}

export function ExpenseForm({ onCreated }: ExpenseFormProps) {
  const categoriesQuery = useExpenseCategories(false);
  const createExpense = useCreateExpense();

  const [draft, setDraft] = useState<ExpenseDraft>(initialDraft);
  const [errors, setErrors] = useState<ExpenseErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const categories = categoriesQuery.data ?? [];
  const isSubmitting = createExpense.isPending;

  function updateField(field: keyof ExpenseDraft, value: string) {
    setDraft((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setSubmitError(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const validationErrors = validateDraft(draft);
    setErrors(validationErrors);

    if (hasErrors(validationErrors)) {
      return;
    }

    setSubmitError(null);

    try {
      await createExpense.mutateAsync({
        dataCompetencia: draft.dataCompetencia,
        valor: Number(draft.valor),
        descricao: draft.descricao.trim(),
        categoriaDespesaId: draft.categoriaDespesaId,
        formaPagamento: draft.formaPagamento as ExpensePaymentMethod
      });
      onCreated?.();
    } catch (error) {
      setSubmitError(toApiError(error).message);
    }
  }

  if (categoriesQuery.isLoading) {
    return (
      <LoadingState
        title="Carregando categorias"
        description="Aguarde enquanto as categorias ativas sao carregadas."
      />
    );
  }

  if (categoriesQuery.isError) {
    return (
      <ErrorState
        title="Nao foi possivel carregar as categorias"
        description="Verifique a conexao e tente novamente."
        onRetry={() => void categoriesQuery.refetch()}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Card>
        <CardHeader>
          <CardTitle>Nova despesa</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-5 tablet:grid-cols-2">
          {submitError ? (
            <div className="col-span-full flex items-start gap-2 rounded-amani border border-danger bg-surface-light px-4 py-3 text-sm leading-6 text-danger">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>{submitError}</span>
            </div>
          ) : null}

          <div className="grid gap-2">
            <label className={fieldLabelClassName} htmlFor="expense-date">
              Data de competencia
            </label>
            <Input
              id="expense-date"
              type="date"
              value={draft.dataCompetencia}
              onChange={(event) =>
                updateField("dataCompetencia", event.target.value)
              }
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.dataCompetencia)}
              aria-describedby={
                errors.dataCompetencia ? "expense-date-error" : undefined
              }
            />
            {errors.dataCompetencia ? (
              <p id="expense-date-error" className={fieldErrorClassName}>
                {errors.dataCompetencia}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label className={fieldLabelClassName} htmlFor="expense-category">
              Categoria
            </label>
            <select
              id="expense-category"
              className={cn(selectClassName)}
              value={draft.categoriaDespesaId}
              onChange={(event) =>
                updateField("categoriaDespesaId", event.target.value)
              }
              disabled={isSubmitting || categories.length === 0}
              aria-invalid={Boolean(errors.categoriaDespesaId)}
              aria-describedby={
                errors.categoriaDespesaId ? "expense-category-error" : undefined
              }
            >
              <option value="">
                {categories.length === 0
                  ? "Nenhuma categoria ativa"
                  : "Selecione uma categoria"}
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.nome}
                </option>
              ))}
            </select>
            {errors.categoriaDespesaId ? (
              <p id="expense-category-error" className={fieldErrorClassName}>
                {errors.categoriaDespesaId}
              </p>
            ) : categories.length === 0 ? (
              <p className="text-xs leading-5 text-text-secondary">
                Cadastre uma categoria ativa antes de lancar despesas.
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label className={fieldLabelClassName} htmlFor="expense-value">
              Valor (R$)
            </label>
            <Input
              id="expense-value"
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              placeholder="0,00"
              value={draft.valor}
              onChange={(event) => updateField("valor", event.target.value)}
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.valor)}
              aria-describedby={errors.valor ? "expense-value-error" : undefined}
            />
            {errors.valor ? (
              <p id="expense-value-error" className={fieldErrorClassName}>
                {errors.valor}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label className={fieldLabelClassName} htmlFor="expense-payment">
              Forma de pagamento
            </label>
            <select
              id="expense-payment"
              className={cn(selectClassName)}
              value={draft.formaPagamento}
              onChange={(event) =>
                updateField("formaPagamento", event.target.value)
              }
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.formaPagamento)}
              aria-describedby={
                errors.formaPagamento ? "expense-payment-error" : undefined
              }
            >
              <option value="">Selecione</option>
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
            {errors.formaPagamento ? (
              <p id="expense-payment-error" className={fieldErrorClassName}>
                {errors.formaPagamento}
              </p>
            ) : null}
          </div>

          <div className="col-span-full grid gap-2">
            <label
              className={fieldLabelClassName}
              htmlFor="expense-description"
            >
              Descricao
            </label>
            <textarea
              id="expense-description"
              className={cn(textareaClassName)}
              value={draft.descricao}
              onChange={(event) => updateField("descricao", event.target.value)}
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.descricao)}
              aria-describedby={
                errors.descricao ? "expense-description-error" : undefined
              }
            />
            {errors.descricao ? (
              <p id="expense-description-error" className={fieldErrorClassName}>
                {errors.descricao}
              </p>
            ) : null}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 tablet:flex-row">
          <Button
            type="submit"
            disabled={isSubmitting || categories.length === 0}
            className="w-full tablet:w-auto"
          >
            {isSubmitting ? (
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Save className="h-4 w-4" aria-hidden />
            )}
            <span>{isSubmitting ? "Salvando" : "Criar despesa"}</span>
          </Button>

          <Button asChild variant="secondary">
            <Link href={routes.despesas}>
              <ArrowLeft className="h-4 w-4" aria-hidden />
              <span>Voltar</span>
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
