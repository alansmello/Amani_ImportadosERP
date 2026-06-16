"use client";

import {
  CheckCircle2,
  LoaderCircle,
  PackagePlus,
  Plus,
  Trash2
} from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import {
  getValidationMessage,
  validateInitialInventoryDrafts
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
import { useRegisterInitialInventory } from "@/hooks/use-implantation";
import { toApiError } from "@/services/errors";
import type {
  ImplantationValidationError,
  ImplantationStepStatus,
  InitialInventoryItemDraft,
  InitialInventoryPayload,
  InitialInventoryResult
} from "@/types/implantation";
import { INITIAL_INVENTORY_ORIGIN } from "@/types/implantation";
import type { Product } from "@/types/product";

type InitialInventoryStepProps = {
  products: Product[];
  onStatusChange?: (
    status: ImplantationStepStatus,
    errorMessage?: string
  ) => void;
};

function createDraft(): InitialInventoryItemDraft {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : String(Date.now()),
    produtoId: "",
    quantidade: "",
    valorUnitario: ""
  };
}

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function parseNumber(value: string) {
  return Number(value.trim().replace(",", "."));
}

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "Sem valor unitario";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

function formatDateForApi(value: string) {
  return new Date(`${value}T00:00:00`).toISOString();
}

export function InitialInventoryStep({
  products,
  onStatusChange
}: InitialInventoryStepProps) {
  const registerInventory = useRegisterInitialInventory();
  const [data, setData] = useState(todayInputValue);
  const [drafts, setDrafts] = useState<InitialInventoryItemDraft[]>([
    createDraft()
  ]);
  const [errors, setErrors] = useState<ImplantationValidationError[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<InitialInventoryResult | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const isCompleted = Boolean(result);
  const isSubmitting = registerInventory.isPending;

  const productNameById = useMemo(() => {
    return new Map(products.map((product) => [product.id, product.nome]));
  }, [products]);

  const reviewItems = useMemo(() => {
    return drafts.map((draft) => {
      const valorUnitario = draft.valorUnitario.trim()
        ? parseNumber(draft.valorUnitario)
        : null;

      return {
        id: draft.id,
        produtoNome: productNameById.get(draft.produtoId) ?? "Produto selecionado",
        quantidade: parseNumber(draft.quantidade),
        valorUnitario
      };
    });
  }, [drafts, productNameById]);

  function updateDraft(
    id: string,
    field: keyof Omit<InitialInventoryItemDraft, "id">,
    value: string
  ) {
    setDrafts((currentDrafts) =>
      currentDrafts.map((draft) =>
        draft.id === id ? { ...draft, [field]: value } : draft
      )
    );
    setErrors((currentErrors) =>
      currentErrors.filter(
        (error) => error.itemId !== id && error.field !== "itens"
      )
    );
    setSubmitError(null);
  }

  function addDraft() {
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

  function buildPayload(): InitialInventoryPayload {
    return {
      data: formatDateForApi(data),
      origem: INITIAL_INVENTORY_ORIGIN,
      itens: drafts.map((draft) => ({
        produtoId: draft.produtoId,
        quantidade: parseNumber(draft.quantidade),
        valorUnitario: draft.valorUnitario.trim()
          ? parseNumber(draft.valorUnitario)
          : null
      }))
    };
  }

  function validateForReview() {
    const validationErrors = validateInitialInventoryDrafts(drafts, products);

    if (!data) {
      validationErrors.push({
        field: "data",
        message: "Informe a data do inventario inicial."
      });
    }

    setErrors(validationErrors);
    return validationErrors.length === 0;
  }

  function handleReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    if (isCompleted || !validateForReview()) {
      if (!isCompleted) {
        onStatusChange?.("error", "Corrija os dados do inventario inicial.");
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

    onStatusChange?.("submitting");

    try {
      const response = await registerInventory.mutateAsync(buildPayload());
      setResult(response);
      setIsReviewOpen(false);
      setErrors([]);
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

  return (
    <>
      <Card>
        <form onSubmit={handleReview} noValidate>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 space-y-1.5">
                <CardTitle>Inventario inicial</CardTitle>
                <CardDescription>
                  Registre o estoque real de partida por produto. A entrada final
                  sera registrada pela API como movimentacao rastreavel.
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
                title="Inventario nao registrado"
                description={submitError}
              />
            ) : null}

            {result ? (
              <ImplantationResultSummary
                status="success"
                title="Inventario inicial registrado"
                description="A etapa foi concluida nesta sessao e nao pode ser enviada novamente por esta tela."
                details={[
                  { label: "Itens", value: result.quantidadeItens },
                  { label: "Origem", value: result.origem },
                  {
                    label: "Movimentacoes",
                    value: result.movimentacoesIds.length
                  }
                ]}
              />
            ) : null}

            <div className="grid gap-4 tablet:grid-cols-[minmax(0,16rem)_1fr]">
              <label className="space-y-2">
                <span className="text-sm font-medium text-text-primary">
                  Data do inventario
                </span>
                <Input
                  type="date"
                  value={data}
                  disabled={isCompleted || isSubmitting}
                  aria-invalid={Boolean(getValidationMessage(errors, "data"))}
                  onChange={(event) => {
                    setData(event.target.value);
                    setErrors((currentErrors) =>
                      currentErrors.filter((error) => error.field !== "data")
                    );
                  }}
                />
                {getValidationMessage(errors, "data") ? (
                  <span className="block text-sm text-danger">
                    {getValidationMessage(errors, "data")}
                  </span>
                ) : null}
              </label>
            </div>

            <div className="space-y-3">
              {getValidationMessage(errors, "itens") ? (
                <div className="rounded-amani border border-danger bg-surface-light px-4 py-3 text-sm text-danger">
                  {getValidationMessage(errors, "itens")}
                </div>
              ) : null}

              {drafts.map((draft, index) => (
                <div
                  key={draft.id}
                  className="grid gap-3 rounded-amani border border-border bg-surface-light p-3 tablet:grid-cols-[minmax(0,1.5fr)_minmax(0,0.75fr)_minmax(0,0.75fr)_auto]"
                >
                  <label className="min-w-0 space-y-2">
                    <span className="text-sm font-medium text-text-primary">
                      Produto {index + 1}
                    </span>
                    <select
                      value={draft.produtoId}
                      disabled={isCompleted || isSubmitting}
                      aria-invalid={Boolean(
                        getValidationMessage(errors, "produtoId", draft.id)
                      )}
                      className="flex h-11 w-full rounded-amani border border-border bg-surface px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger"
                      onChange={(event) =>
                        updateDraft(draft.id, "produtoId", event.target.value)
                      }
                    >
                      <option value="">Selecione</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.nome}
                        </option>
                      ))}
                    </select>
                    {getValidationMessage(errors, "produtoId", draft.id) ? (
                      <span className="block text-sm text-danger">
                        {getValidationMessage(errors, "produtoId", draft.id)}
                      </span>
                    ) : null}
                  </label>

                  <label className="min-w-0 space-y-2">
                    <span className="text-sm font-medium text-text-primary">
                      Quantidade
                    </span>
                    <Input
                      inputMode="decimal"
                      value={draft.quantidade}
                      disabled={isCompleted || isSubmitting}
                      aria-invalid={Boolean(
                        getValidationMessage(errors, "quantidade", draft.id)
                      )}
                      onChange={(event) =>
                        updateDraft(draft.id, "quantidade", event.target.value)
                      }
                    />
                    {getValidationMessage(errors, "quantidade", draft.id) ? (
                      <span className="block text-sm text-danger">
                        {getValidationMessage(errors, "quantidade", draft.id)}
                      </span>
                    ) : null}
                  </label>

                  <label className="min-w-0 space-y-2">
                    <span className="text-sm font-medium text-text-primary">
                      Valor unitario
                    </span>
                    <Input
                      inputMode="decimal"
                      value={draft.valorUnitario}
                      disabled={isCompleted || isSubmitting}
                      placeholder="Opcional"
                      aria-invalid={Boolean(
                        getValidationMessage(errors, "valorUnitario", draft.id)
                      )}
                      onChange={(event) =>
                        updateDraft(draft.id, "valorUnitario", event.target.value)
                      }
                    />
                    {getValidationMessage(errors, "valorUnitario", draft.id) ? (
                      <span className="block text-sm text-danger">
                        {getValidationMessage(errors, "valorUnitario", draft.id)}
                      </span>
                    ) : null}
                  </label>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={isCompleted || isSubmitting || drafts.length === 1}
                      aria-label="Remover produto"
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
              disabled={isCompleted || isSubmitting}
              onClick={addDraft}
            >
              <Plus className="h-4 w-4" aria-hidden />
              <span>Adicionar produto</span>
            </Button>
            <Button
              type="submit"
              disabled={isCompleted || isSubmitting || products.length === 0}
            >
              {isSubmitting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <PackagePlus className="h-4 w-4" aria-hidden />
              )}
              <span>{isSubmitting ? "Enviando" : "Revisar inventario"}</span>
            </Button>
          </CardFooter>
        </form>
      </Card>

      <ImplantationReviewDialog
        open={isReviewOpen}
        title="Revisar inventario inicial"
        description="Confira os produtos e quantidades antes de registrar a entrada inicial."
        confirmLabel="Confirmar inventario"
        isSubmitting={isSubmitting}
        onOpenChange={handleReviewOpenChange}
        onConfirm={confirmSubmit}
      >
        <div className="space-y-3">
          <div className="rounded-amani border border-border bg-surface-light p-3 text-sm">
            <p className="font-medium text-text-primary">Data: {data}</p>
            <p className="mt-1 text-text-secondary">
              Total de itens: {reviewItems.length}
            </p>
          </div>
          <ul className="space-y-2">
            {reviewItems.map((item) => (
              <li
                key={item.id}
                className="rounded-amani border border-border bg-surface-light p-3"
              >
                <p className="break-words text-sm font-medium text-text-primary">
                  {item.produtoNome}
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  Quantidade: {item.quantidade} | Valor unitario:{" "}
                  {formatCurrency(item.valorUnitario)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </ImplantationReviewDialog>
    </>
  );
}
