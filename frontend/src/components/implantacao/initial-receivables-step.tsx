"use client";

import {
  CheckCircle2,
  LoaderCircle,
  Plus,
  ReceiptText,
  Trash2
} from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import {
  getValidationMessage,
  validateInitialReceivableDrafts
} from "@/components/implantacao/implantation-validation";
import { ImplantationResultSummary } from "@/components/implantacao/implantation-result-summary";
import { ImplantationReviewDialog } from "@/components/implantacao/implantation-review-dialog";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
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
import { useRegisterInitialReceivable } from "@/hooks/use-implantation";
import { useCustomers } from "@/hooks/use-customers";
import { toApiError } from "@/services/errors";
import type {
  ImplantationValidationError,
  ImplantationStepStatus,
  InitialReceivableDraft,
  InitialReceivablePayload,
  InitialReceivableResult
} from "@/types/implantation";
import { INITIAL_RECEIVABLE_ORIGIN } from "@/types/implantation";

const MAX_RECEIVABLE_DRAFTS = 10;

function createDraft(): InitialReceivableDraft {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`,
    clienteId: "",
    valor: "",
    dataVencimento: "",
    descricao: ""
  };
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

type InitialReceivablesStepProps = {
  onStatusChange?: (
    status: ImplantationStepStatus,
    errorMessage?: string
  ) => void;
};

export function InitialReceivablesStep({
  onStatusChange
}: InitialReceivablesStepProps) {
  const customersQuery = useCustomers("active");
  const registerReceivable = useRegisterInitialReceivable();
  const customers = useMemo(
    () => customersQuery.data ?? [],
    [customersQuery.data]
  );
  const [drafts, setDrafts] = useState<InitialReceivableDraft[]>([
    createDraft()
  ]);
  const [errors, setErrors] = useState<ImplantationValidationError[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [results, setResults] = useState<InitialReceivableResult[] | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const isCompleted = Boolean(results);
  const isSubmitting = registerReceivable.isPending;

  const customerNameById = useMemo(() => {
    return new Map(customers.map((customer) => [customer.id, customer.nome]));
  }, [customers]);

  useEffect(() => {
    if (isCompleted) {
      return;
    }

    if (customersQuery.isError) {
      onStatusChange?.("error", "Nao foi possivel carregar clientes ativos.");
      return;
    }

    if (!customersQuery.isLoading) {
      onStatusChange?.("editing");
    }
  }, [
    customersQuery.isError,
    customersQuery.isLoading,
    isCompleted,
    onStatusChange
  ]);

  const reviewItems = useMemo(() => {
    return drafts.map((draft) => ({
      id: draft.id,
      clienteNome: customerNameById.get(draft.clienteId) ?? "Cliente selecionado",
      valor: parseNumber(draft.valor),
      dataVencimento: draft.dataVencimento,
      descricao: draft.descricao.trim()
    }));
  }, [customerNameById, drafts]);

  function updateDraft(
    id: string,
    field: keyof Omit<InitialReceivableDraft, "id">,
    value: string
  ) {
    setDrafts((currentDrafts) =>
      currentDrafts.map((draft) =>
        draft.id === id ? { ...draft, [field]: value } : draft
      )
    );
    setErrors((currentErrors) =>
      currentErrors.filter(
        (error) => error.itemId !== id && error.field !== "recebiveis"
      )
    );
    setSubmitError(null);
  }

  function addDraft() {
    if (drafts.length >= MAX_RECEIVABLE_DRAFTS) {
      setErrors((currentErrors) => [
        ...currentErrors.filter((error) => error.field !== "recebiveis"),
        {
          field: "recebiveis",
          message: "Adicione no maximo 10 contas por lote."
        }
      ]);
      return;
    }

    setDrafts((currentDrafts) => [...currentDrafts, createDraft()]);
    setSubmitError(null);
  }

  function removeDraft(id: string) {
    setDrafts((currentDrafts) =>
      currentDrafts.length === 1
        ? currentDrafts
        : currentDrafts.filter((draft) => draft.id !== id)
    );
    setErrors((currentErrors) =>
      currentErrors.filter((error) => error.itemId !== id)
    );
    setSubmitError(null);
  }

  function buildPayload(draft: InitialReceivableDraft): InitialReceivablePayload {
    return {
      clienteId: draft.clienteId,
      valor: parseNumber(draft.valor),
      dataVencimento: formatDateForApi(draft.dataVencimento),
      origem: INITIAL_RECEIVABLE_ORIGIN,
      descricao: draft.descricao.trim() || null
    };
  }

  function validateForReview() {
    const validationErrors = validateInitialReceivableDrafts(drafts, customers);
    setErrors(validationErrors);
    return validationErrors.length === 0;
  }

  function handleReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    if (isCompleted || !validateForReview()) {
      if (!isCompleted) {
        onStatusChange?.("error", "Corrija as contas a receber iniciais.");
      }

      return;
    }

    onStatusChange?.("reviewing");
    setIsReviewOpen(true);
  }

  async function confirmSubmit() {
    setSubmitError(null);

    if (isCompleted || !validateForReview()) {
      if (!isCompleted) {
        onStatusChange?.("editing");
      }

      setIsReviewOpen(false);
      return;
    }

    const successfulResults: InitialReceivableResult[] = [];
    onStatusChange?.("submitting");

    try {
      for (const draft of drafts) {
        successfulResults.push(
          await registerReceivable.mutateAsync(buildPayload(draft))
        );
      }

      setResults(successfulResults);
      setErrors([]);
      setIsReviewOpen(false);
      onStatusChange?.("completed");
    } catch (error) {
      const apiError = toApiError(error);
      setSubmitError(apiError.message);
      setIsReviewOpen(false);
      onStatusChange?.("error", apiError.message);
    }
  }

  function handleReviewOpenChange(open: boolean) {
    setIsReviewOpen(open);

    if (!open && !isCompleted && !isSubmitting) {
      onStatusChange?.(submitError ? "error" : "editing", submitError ?? undefined);
    }
  }

  if (customersQuery.isLoading) {
    return (
      <LoadingState
        title="Carregando clientes"
        description="Aguarde enquanto a lista oficial de clientes ativos e carregada para as contas iniciais."
      />
    );
  }

  if (customersQuery.isError) {
    return (
      <ErrorState
        title="Nao foi possivel carregar clientes"
        description="Verifique a API de clientes e tente novamente antes de registrar contas a receber iniciais."
        onRetry={() => {
          void customersQuery.refetch();
        }}
      />
    );
  }

  if (customers.length === 0) {
    return (
      <EmptyState
        title="Nenhum cliente ativo disponivel"
        description="Cadastre ou reative clientes antes de registrar contas a receber iniciais."
        badgeLabel="Sem clientes"
        variant="empty"
        icon={<ReceiptText className="h-5 w-5" aria-hidden />}
      />
    );
  }

  return (
    <>
      <Card>
        <form onSubmit={handleReview} noValidate>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 space-y-1.5">
                <CardTitle>Contas a receber iniciais</CardTitle>
                <CardDescription>
                  Monte um lote local de recebiveis anteriores ao uso do ERP. A
                  etapa so conclui visualmente se todos os envios passarem.
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
                title="Contas iniciais nao concluidas"
                description={submitError}
              />
            ) : null}

            {results ? (
              <ImplantationResultSummary
                status="success"
                title="Contas a receber iniciais registradas"
                description="Todos os recebiveis do lote foram aceitos pela fonte oficial nesta sessao."
                details={[
                  { label: "Contas", value: results.length },
                  {
                    label: "Total",
                    value: formatCurrency(
                      results.reduce((total, item) => total + item.valor, 0)
                    )
                  },
                  { label: "Origem", value: INITIAL_RECEIVABLE_ORIGIN }
                ]}
              />
            ) : null}

            {getValidationMessage(errors, "recebiveis") ? (
              <div className="rounded-amani border border-danger bg-surface-light px-4 py-3 text-sm text-danger">
                {getValidationMessage(errors, "recebiveis")}
              </div>
            ) : null}

            <div className="space-y-3">
              {drafts.map((draft, index) => (
                <div
                  key={draft.id}
                  className="grid gap-3 rounded-amani border border-border bg-surface-light p-3 tablet:grid-cols-[minmax(0,1.35fr)_minmax(0,0.75fr)_minmax(0,0.8fr)_minmax(0,1fr)_auto]"
                >
                  <label className="min-w-0 space-y-2">
                    <span className="text-sm font-medium text-text-primary">
                      Cliente {index + 1}
                    </span>
                    <select
                      value={draft.clienteId}
                      disabled={isCompleted || isSubmitting}
                      aria-invalid={Boolean(
                        getValidationMessage(errors, "clienteId", draft.id)
                      )}
                      className="flex h-11 w-full rounded-amani border border-border bg-surface px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger"
                      onChange={(event) =>
                        updateDraft(draft.id, "clienteId", event.target.value)
                      }
                    >
                      <option value="">Selecione</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.nome}
                        </option>
                      ))}
                    </select>
                    {getValidationMessage(errors, "clienteId", draft.id) ? (
                      <span className="block text-sm text-danger">
                        {getValidationMessage(errors, "clienteId", draft.id)}
                      </span>
                    ) : null}
                  </label>

                  <label className="min-w-0 space-y-2">
                    <span className="text-sm font-medium text-text-primary">
                      Valor
                    </span>
                    <Input
                      inputMode="decimal"
                      value={draft.valor}
                      disabled={isCompleted || isSubmitting}
                      aria-invalid={Boolean(
                        getValidationMessage(errors, "valor", draft.id)
                      )}
                      onChange={(event) =>
                        updateDraft(draft.id, "valor", event.target.value)
                      }
                    />
                    {getValidationMessage(errors, "valor", draft.id) ? (
                      <span className="block text-sm text-danger">
                        {getValidationMessage(errors, "valor", draft.id)}
                      </span>
                    ) : null}
                  </label>

                  <label className="min-w-0 space-y-2">
                    <span className="text-sm font-medium text-text-primary">
                      Vencimento
                    </span>
                    <Input
                      type="date"
                      value={draft.dataVencimento}
                      disabled={isCompleted || isSubmitting}
                      aria-invalid={Boolean(
                        getValidationMessage(errors, "dataVencimento", draft.id)
                      )}
                      onChange={(event) =>
                        updateDraft(draft.id, "dataVencimento", event.target.value)
                      }
                    />
                    {getValidationMessage(errors, "dataVencimento", draft.id) ? (
                      <span className="block text-sm text-danger">
                        {getValidationMessage(
                          errors,
                          "dataVencimento",
                          draft.id
                        )}
                      </span>
                    ) : null}
                  </label>

                  <label className="min-w-0 space-y-2">
                    <span className="text-sm font-medium text-text-primary">
                      Descricao
                    </span>
                    <Input
                      value={draft.descricao}
                      disabled={isCompleted || isSubmitting}
                      placeholder="Opcional"
                      onChange={(event) =>
                        updateDraft(draft.id, "descricao", event.target.value)
                      }
                    />
                  </label>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={isCompleted || isSubmitting || drafts.length === 1}
                      aria-label="Remover conta"
                      onClick={() => removeDraft(draft.id)}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>

          <CardFooter className="flex-col items-stretch tablet:flex-row tablet:justify-between">
            <Button
              type="button"
              variant="secondary"
              disabled={
                isCompleted ||
                isSubmitting ||
                drafts.length >= MAX_RECEIVABLE_DRAFTS
              }
              onClick={addDraft}
            >
              <Plus className="h-4 w-4" aria-hidden />
              <span>Adicionar conta</span>
            </Button>
            <Button type="submit" disabled={isCompleted || isSubmitting}>
              {isSubmitting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <ReceiptText className="h-4 w-4" aria-hidden />
              )}
              <span>{isSubmitting ? "Enviando" : "Revisar contas"}</span>
            </Button>
          </CardFooter>
        </form>
      </Card>

      <ImplantationReviewDialog
        open={isReviewOpen}
        title="Revisar contas a receber iniciais"
        description="Confira o lote antes de iniciar os envios para a fonte oficial."
        confirmLabel="Confirmar contas"
        isSubmitting={isSubmitting}
        onOpenChange={handleReviewOpenChange}
        onConfirm={confirmSubmit}
      >
        <div className="space-y-3">
          <div className="rounded-amani border border-border bg-surface-light p-3 text-sm">
            <p className="font-medium text-text-primary">
              Total de contas: {reviewItems.length}
            </p>
            <p className="mt-1 text-text-secondary">
              Valor total:{" "}
              {formatCurrency(
                reviewItems.reduce(
                  (total, item) =>
                    Number.isFinite(item.valor) ? total + item.valor : total,
                  0
                )
              )}
            </p>
          </div>

          <ul className="space-y-2">
            {reviewItems.map((item) => (
              <li
                key={item.id}
                className="rounded-amani border border-border bg-surface-light p-3"
              >
                <p className="break-words text-sm font-medium text-text-primary">
                  {item.clienteNome}
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  Valor: {formatCurrency(item.valor)} | Vencimento:{" "}
                  {item.dataVencimento}
                </p>
                <p className="mt-1 break-words text-sm text-text-secondary">
                  {item.descricao || "Sem descricao"}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </ImplantationReviewDialog>
    </>
  );
}
