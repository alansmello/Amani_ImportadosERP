"use client";

import { LoaderCircle, Undo2 } from "lucide-react";
import { useEffect, useState } from "react";

import {
  buildReturnPayload,
  getPurchaseValidationMessage,
  validateReturnDraft
} from "@/components/compras/purchase-validation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRegisterPurchaseReturn } from "@/hooks/use-purchases";
import { toApiError } from "@/services/errors";
import {
  purchaseReturnMotives,
  type PurchaseItem,
  type PurchaseReturnDraft,
  type PurchaseValidationError
} from "@/types/purchase";

type ReturnDialogProps = {
  compraId: string;
  item: PurchaseItem;
  productName: string;
};

const fieldLabelClassName = "text-sm font-medium text-text-primary";
const fieldHelpClassName = "text-xs leading-5 text-text-secondary";
const fieldErrorClassName = "text-xs font-medium leading-5 text-danger";
const selectClassName =
  "h-11 w-full rounded-amani border border-border bg-surface px-3 text-sm text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger";

function createOperationId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `return-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

function buildInitialDraft(): PurchaseReturnDraft {
  return {
    momento: "AntesDoRecebimento",
    compraItemRecebimentoId: "",
    quantidade: "",
    motivo: "",
    data: new Date().toISOString().slice(0, 10),
    observacao: ""
  };
}

function getMotiveLabel(value: string) {
  const labels: Record<string, string> = {
    ProdutoFalsificado: "Produto falsificado",
    Avaria: "Avaria",
    ProdutoIncorreto: "Produto incorreto",
    DesistenciaRecusa: "Desistencia/recusa",
    Outro: "Outro"
  };

  return labels[value] ?? value;
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className={fieldErrorClassName}>{message}</p>;
}

export function ReturnDialog({ compraId, item, productName }: ReturnDialogProps) {
  const registerReturn = useRegisterPurchaseReturn();
  const [open, setOpen] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [operationId, setOperationId] = useState(() => createOperationId());
  const [draft, setDraft] = useState<PurchaseReturnDraft>(() =>
    buildInitialDraft()
  );
  const [errors, setErrors] = useState<PurchaseValidationError[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const quantidadeElegivel =
    draft.momento === "DepoisDoRecebimento"
      ? item.recebimentosElegiveisDevolucao?.find(
          (recebimento) => recebimento.recebimentoId === draft.compraItemRecebimentoId
        )?.quantidadeElegivel ?? 0
      : item.quantidadeElegivelDevolucaoAntes ?? item.quantidadePendente;
  const hasEligibleAfterReceipt =
    (item.recebimentosElegiveisDevolucao ?? []).length > 0;
  const hasPending = quantidadeElegivel > 0 || hasEligibleAfterReceipt;
  const quantityError = getPurchaseValidationMessage(errors, "quantidade");
  const motiveError = getPurchaseValidationMessage(errors, "motivo");
  const receiptError = getPurchaseValidationMessage(
    errors,
    "compraItemRecebimentoId"
  );
  const noteError = getPurchaseValidationMessage(errors, "observacao");
  const isSubmitting = registerReturn.isPending;

  useEffect(() => {
    if (!open) {
      setIsReviewing(false);
      setOperationId(createOperationId());
      setDraft(buildInitialDraft());
      setErrors([]);
      setSubmitError(null);
    }
  }, [open]);

  function updateField(field: keyof PurchaseReturnDraft, value: string) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value
    }));
    setErrors((currentErrors) =>
      currentErrors.filter((error) => error.field !== field)
    );
    setSubmitError(null);
  }

  function moveToReview() {
    const validationErrors = validateReturnDraft(draft, quantidadeElegivel);
    setErrors(validationErrors);
    setSubmitError(null);

    if (validationErrors.length === 0) {
      setIsReviewing(true);
    }
  }

  async function confirmReturn() {
    setSubmitError(null);

    try {
      await registerReturn.mutateAsync({
        compraId,
        itemId: item.id,
        payload: buildReturnPayload(draft, operationId)
      });
      setOpen(false);
    } catch (error) {
      const apiError = toApiError(error);
      setSubmitError(apiError.message);
      setIsReviewing(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="secondary" size="sm" disabled={!hasPending}>
          <Undo2 className="h-4 w-4" aria-hidden />
          <span>Devolver</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Devolver antes do recebimento</DialogTitle>
          <DialogDescription>
            Use para recusar quantidade em transito ou retirar produto ja
            recebido. A devolucao posterior cria saida de estoque pelo custo do
            recebimento selecionado, sem registrar reembolso automaticamente.
          </DialogDescription>
        </DialogHeader>

        {submitError ? (
          <div className="rounded-amani border border-danger bg-surface-light px-4 py-3 text-sm leading-6 text-danger">
            {submitError}
          </div>
        ) : null}

        <div className="rounded-amani border border-border bg-surface-light p-4">
          <p className="break-words text-sm font-semibold text-text-primary">
            {productName}
          </p>
          <p className="mt-1 text-xs leading-5 text-text-secondary">
            Elegivel na selecao atual: {quantidadeElegivel} unidade(s)
          </p>
        </div>

        {isReviewing ? (
          <div className="grid gap-3 rounded-amani border border-warning bg-surface-light p-4">
            <p className="text-sm font-semibold text-text-primary">
              Revisao da devolucao
            </p>
            <p className="text-sm leading-6 text-text-secondary">
              Tipo:{" "}
              {draft.momento === "DepoisDoRecebimento"
                ? "Depois do recebimento"
                : "Antes do recebimento"}
            </p>
            <p className="text-sm leading-6 text-text-secondary">
              Quantidade: {draft.quantidade}
            </p>
            <p className="text-sm leading-6 text-text-secondary">
              Motivo: {getMotiveLabel(draft.motivo)}
            </p>
            <p className="text-sm leading-6 text-text-secondary">
              Data: {draft.data || "Data atual da fonte oficial"}
            </p>
            {draft.observacao.trim() ? (
              <p className="text-sm leading-6 text-text-secondary">
                Observacao: {draft.observacao.trim()}
              </p>
            ) : null}
            <p className="text-xs leading-5 text-text-secondary">
              A pendencia sera reduzida. Estoque e financeiro permanecem
              inalterados na devolucao anterior; na posterior, apenas o estoque
              recebe uma saida pelo custo do recebimento.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className={fieldLabelClassName} htmlFor="return-moment">
                Tipo de devolucao
              </label>
              <select
                id="return-moment"
                className={selectClassName}
                value={draft.momento}
                onChange={(event) =>
                  updateField(
                    "momento",
                    event.target.value as PurchaseReturnDraft["momento"]
                  )
                }
                disabled={isSubmitting}
              >
                <option value="AntesDoRecebimento">
                  Antes do recebimento
                </option>
                <option value="DepoisDoRecebimento">
                  Depois do recebimento
                </option>
              </select>
            </div>

            {draft.momento === "DepoisDoRecebimento" ? (
              <div className="grid gap-2">
                <label className={fieldLabelClassName} htmlFor="return-receipt">
                  Recebimento
                </label>
                <select
                  id="return-receipt"
                  className={selectClassName}
                  value={draft.compraItemRecebimentoId}
                  onChange={(event) =>
                    updateField("compraItemRecebimentoId", event.target.value)
                  }
                  disabled={isSubmitting}
                  aria-invalid={Boolean(receiptError)}
                >
                  <option value="">Selecione</option>
                  {(item.recebimentosElegiveisDevolucao ?? []).map(
                    (recebimento) => (
                      <option
                        key={recebimento.recebimentoId}
                        value={recebimento.recebimentoId}
                      >
                        {new Intl.DateTimeFormat("pt-BR", {
                          dateStyle: "short"
                        }).format(new Date(recebimento.dataRecebimento))}{" "}
                        - {recebimento.quantidadeElegivel} un. a{" "}
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL"
                        }).format(recebimento.valorUnitario)}
                      </option>
                    )
                  )}
                </select>
                <p className={fieldHelpClassName}>
                  A saida de estoque usa o valor unitario do recebimento
                  selecionado.
                </p>
                <FieldError message={receiptError} />
              </div>
            ) : null}

            <div className="grid gap-2">
              <label className={fieldLabelClassName} htmlFor="return-quantity">
                Quantidade devolvida
              </label>
              <Input
                id="return-quantity"
                type="number"
                min="1"
                max={quantidadeElegivel}
                step="1"
                inputMode="numeric"
                value={draft.quantidade}
                onChange={(event) =>
                  updateField("quantidade", event.target.value)
                }
                disabled={isSubmitting}
                aria-invalid={Boolean(quantityError)}
                aria-describedby={
                  quantityError ? "return-quantity-error" : "return-quantity-help"
                }
              />
              <p id="return-quantity-help" className={fieldHelpClassName}>
                Nao pode exceder a quantidade elegivel exibida.
              </p>
              <div id="return-quantity-error">
                <FieldError message={quantityError} />
              </div>
            </div>

            <div className="grid gap-2">
              <label className={fieldLabelClassName} htmlFor="return-motive">
                Motivo
              </label>
              <select
                id="return-motive"
                className={selectClassName}
                value={draft.motivo}
                onChange={(event) => updateField("motivo", event.target.value)}
                disabled={isSubmitting}
                aria-invalid={Boolean(motiveError)}
              >
                <option value="">Selecione</option>
                {purchaseReturnMotives.map((motive) => (
                  <option key={motive} value={motive}>
                    {getMotiveLabel(motive)}
                  </option>
                ))}
              </select>
              <FieldError message={motiveError} />
            </div>

            <div className="grid gap-2">
              <label className={fieldLabelClassName} htmlFor="return-date">
                Data da devolucao
              </label>
              <Input
                id="return-date"
                type="date"
                value={draft.data}
                onChange={(event) => updateField("data", event.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <label className={fieldLabelClassName} htmlFor="return-note">
                Observacao
              </label>
              <textarea
                id="return-note"
                className="min-h-24 w-full rounded-amani border border-border bg-surface px-3 py-2 text-sm text-text-primary transition-colors placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                value={draft.observacao}
                onChange={(event) =>
                  updateField("observacao", event.target.value)
                }
                disabled={isSubmitting}
              />
              <FieldError message={noteError} />
            </div>
          </div>
        )}

        <DialogFooter>
          {isReviewing ? (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsReviewing(false)}
                disabled={isSubmitting}
              >
                Voltar
              </Button>
              <Button
                type="button"
                onClick={confirmReturn}
                disabled={isSubmitting}
                className="w-full tablet:w-auto"
              >
                {isSubmitting ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Undo2 className="h-4 w-4" aria-hidden />
                )}
                <span>
                  {isSubmitting ? "Registrando" : "Confirmar devolucao"}
                </span>
              </Button>
            </>
          ) : (
            <Button
              type="button"
              onClick={moveToReview}
              disabled={isSubmitting || !hasPending}
              className="w-full tablet:w-auto"
            >
              <Undo2 className="h-4 w-4" aria-hidden />
              <span>Revisar devolucao</span>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
