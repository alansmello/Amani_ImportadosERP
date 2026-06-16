"use client";

import { Banknote, CheckCircle2, LoaderCircle } from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import {
  getValidationMessage,
  validateInitialCashBalanceDraft
} from "@/components/implantacao/implantation-validation";
import { ImplantationResultSummary } from "@/components/implantacao/implantation-result-summary";
import { ImplantationReviewDialog } from "@/components/implantacao/implantation-review-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRegisterInitialCashBalance } from "@/hooks/use-implantation";
import { toApiError } from "@/services/errors";
import type {
  ImplantationValidationError,
  InitialCashBalanceDraft,
  InitialCashBalancePayload,
  InitialCashBalanceResult
} from "@/types/implantation";
import { INITIAL_CASH_ORIGIN } from "@/types/implantation";

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function parseNumber(value: string) {
  return Number(value.trim().replace(",", "."));
}

function formatDateForApi(value: string) {
  return new Date(`${value}T00:00:00`).toISOString();
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

export function InitialCashStep() {
  const registerCashBalance = useRegisterInitialCashBalance();
  const [draft, setDraft] = useState<InitialCashBalanceDraft>({
    valor: "",
    data: todayInputValue(),
    descricao: ""
  });
  const [errors, setErrors] = useState<ImplantationValidationError[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<InitialCashBalanceResult | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const isCompleted = Boolean(result);
  const isSubmitting = registerCashBalance.isPending;

  const review = useMemo(
    () => ({
      valor: parseNumber(draft.valor),
      data: draft.data,
      descricao: draft.descricao.trim()
    }),
    [draft]
  );

  function updateField(field: keyof InitialCashBalanceDraft, value: string) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value
    }));
    setErrors((currentErrors) =>
      currentErrors.filter((error) => error.field !== field)
    );
    setSubmitError(null);
  }

  function buildPayload(): InitialCashBalancePayload {
    return {
      valor: parseNumber(draft.valor),
      data: formatDateForApi(draft.data),
      origem: INITIAL_CASH_ORIGIN,
      descricao: draft.descricao.trim() || null
    };
  }

  function validateForReview() {
    const validationErrors = validateInitialCashBalanceDraft(draft);
    setErrors(validationErrors);
    return validationErrors.length === 0;
  }

  function handleReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    if (isCompleted || !validateForReview()) {
      return;
    }

    setIsReviewOpen(true);
  }

  async function confirmSubmit() {
    setSubmitError(null);

    if (isCompleted || !validateForReview()) {
      setIsReviewOpen(false);
      return;
    }

    try {
      const response = await registerCashBalance.mutateAsync(buildPayload());
      setResult(response);
      setErrors([]);
      setIsReviewOpen(false);
    } catch (error) {
      const apiError = toApiError(error);
      setSubmitError(apiError.message);
      setIsReviewOpen(false);
    }
  }

  return (
    <>
      <Card>
        <form onSubmit={handleReview} noValidate>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 space-y-1.5">
                <CardTitle>Saldo inicial de caixa</CardTitle>
                <CardDescription>
                  Informe o saldo financeiro de partida. O registro definitivo
                  fica na fonte oficial do backend.
                </CardDescription>
              </div>
              {isCompleted ? (
                <div className="flex items-center gap-2 rounded-amani border border-success bg-surface-light px-3 py-2 text-sm font-medium text-success">
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                  <span>Concluido</span>
                </div>
              ) : null}
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {submitError ? (
              <ImplantationResultSummary
                status="error"
                title="Saldo inicial nao registrado"
                description={submitError}
              />
            ) : null}

            {result ? (
              <ImplantationResultSummary
                status="success"
                title="Saldo inicial registrado"
                description="A etapa foi concluida nesta sessao e nao pode ser enviada novamente por esta tela."
                details={[
                  { label: "Evento", value: result.eventoFinanceiroId },
                  { label: "Valor", value: formatCurrency(result.valor) },
                  { label: "Data", value: result.data },
                  { label: "Origem", value: result.origem }
                ]}
              />
            ) : null}

            <div className="grid gap-4 tablet:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-text-primary">
                  Valor
                </span>
                <Input
                  inputMode="decimal"
                  value={draft.valor}
                  disabled={isCompleted || isSubmitting}
                  aria-invalid={Boolean(getValidationMessage(errors, "valor"))}
                  onChange={(event) => updateField("valor", event.target.value)}
                />
                {getValidationMessage(errors, "valor") ? (
                  <span className="block text-sm text-danger">
                    {getValidationMessage(errors, "valor")}
                  </span>
                ) : null}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-text-primary">
                  Data
                </span>
                <Input
                  type="date"
                  value={draft.data}
                  disabled={isCompleted || isSubmitting}
                  aria-invalid={Boolean(getValidationMessage(errors, "data"))}
                  onChange={(event) => updateField("data", event.target.value)}
                />
                {getValidationMessage(errors, "data") ? (
                  <span className="block text-sm text-danger">
                    {getValidationMessage(errors, "data")}
                  </span>
                ) : null}
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-text-primary">
                Descricao
              </span>
              <Input
                value={draft.descricao}
                disabled={isCompleted || isSubmitting}
                placeholder="Opcional"
                onChange={(event) => updateField("descricao", event.target.value)}
              />
            </label>
          </CardContent>

          <CardFooter className="flex-col items-stretch tablet:flex-row tablet:justify-end">
            <Button type="submit" disabled={isCompleted || isSubmitting}>
              {isSubmitting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Banknote className="h-4 w-4" aria-hidden />
              )}
              <span>{isSubmitting ? "Enviando" : "Revisar saldo"}</span>
            </Button>
          </CardFooter>
        </form>
      </Card>

      <ImplantationReviewDialog
        open={isReviewOpen}
        title="Revisar saldo inicial"
        description="Confira valor e data antes de registrar o saldo inicial de caixa."
        confirmLabel="Confirmar saldo"
        isSubmitting={isSubmitting}
        onOpenChange={setIsReviewOpen}
        onConfirm={confirmSubmit}
      >
        <dl className="grid gap-3 rounded-amani border border-border bg-surface-light p-3 text-sm tablet:grid-cols-2">
          <div className="min-w-0">
            <dt className="text-xs uppercase text-text-secondary">Valor</dt>
            <dd className="break-words font-medium text-text-primary">
              {Number.isFinite(review.valor)
                ? formatCurrency(review.valor)
                : "Valor invalido"}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs uppercase text-text-secondary">Data</dt>
            <dd className="break-words font-medium text-text-primary">
              {review.data}
            </dd>
          </div>
          <div className="min-w-0 tablet:col-span-2">
            <dt className="text-xs uppercase text-text-secondary">Descricao</dt>
            <dd className="break-words font-medium text-text-primary">
              {review.descricao || "Sem descricao"}
            </dd>
          </div>
        </dl>
      </ImplantationReviewDialog>
    </>
  );
}

