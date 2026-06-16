"use client";

import { CheckCircle2, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

import {
  buildReceiptPayload,
  getPurchaseValidationMessage,
  validateReceiptDraft
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
import { useRegisterPurchaseReceipt } from "@/hooks/use-purchases";
import { toApiError } from "@/services/errors";
import type {
  PurchaseActionDraft,
  PurchaseItem,
  PurchaseValidationError
} from "@/types/purchase";

type ReceiptDialogProps = {
  compraId: string;
  item: PurchaseItem;
  productName: string;
};

const fieldLabelClassName = "text-sm font-medium text-text-primary";
const fieldHelpClassName = "text-xs leading-5 text-text-secondary";
const fieldErrorClassName = "text-xs font-medium leading-5 text-danger";

function buildInitialDraft(): PurchaseActionDraft {
  return {
    quantidade: "",
    data: new Date().toISOString().slice(0, 10),
    observacao: ""
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className={fieldErrorClassName}>{message}</p>;
}

export function ReceiptDialog({
  compraId,
  item,
  productName
}: ReceiptDialogProps) {
  const registerReceipt = useRegisterPurchaseReceipt();
  const [open, setOpen] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [draft, setDraft] = useState<PurchaseActionDraft>(() =>
    buildInitialDraft()
  );
  const [errors, setErrors] = useState<PurchaseValidationError[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setIsReviewing(false);
      setDraft(buildInitialDraft());
      setErrors([]);
      setSubmitError(null);
    }
  }, [open]);

  const quantityError = getPurchaseValidationMessage(errors, "quantidade");
  const isSubmitting = registerReceipt.isPending;
  const hasPending = item.quantidadePendente > 0;

  function updateField(field: keyof PurchaseActionDraft, value: string) {
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
    const validationErrors = validateReceiptDraft(
      draft,
      item.quantidadePendente
    );
    setErrors(validationErrors);
    setSubmitError(null);

    if (validationErrors.length === 0) {
      setIsReviewing(true);
    }
  }

  async function confirmReceipt() {
    setSubmitError(null);

    try {
      await registerReceipt.mutateAsync({
        compraId,
        itemId: item.id,
        payload: buildReceiptPayload(draft)
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
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          <span>Receber</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar recebimento</DialogTitle>
          <DialogDescription>
            Confirme somente a quantidade fisicamente recebida. Esta acao gera
            entrada rastreavel de estoque pela fonte oficial.
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
            Pendente: {item.quantidadePendente} unidade(s)
          </p>
        </div>

        {isReviewing ? (
          <div className="grid gap-3 rounded-amani border border-info bg-surface-light p-4">
            <p className="text-sm font-semibold text-text-primary">
              Revisao do recebimento
            </p>
            <p className="text-sm leading-6 text-text-secondary">
              Quantidade recebida: {draft.quantidade}
            </p>
            <p className="text-sm leading-6 text-text-secondary">
              Data: {draft.data || "Data atual da fonte oficial"}
            </p>
            {draft.observacao.trim() ? (
              <p className="text-sm leading-6 text-text-secondary">
                Observacao: {draft.observacao.trim()}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className={fieldLabelClassName} htmlFor="receipt-quantity">
                Quantidade recebida
              </label>
              <Input
                id="receipt-quantity"
                type="number"
                min="1"
                max={item.quantidadePendente}
                step="1"
                inputMode="numeric"
                value={draft.quantidade}
                onChange={(event) =>
                  updateField("quantidade", event.target.value)
                }
                disabled={isSubmitting}
                aria-invalid={Boolean(quantityError)}
                aria-describedby={
                  quantityError ? "receipt-quantity-error" : "receipt-quantity-help"
                }
              />
              <p id="receipt-quantity-help" className={fieldHelpClassName}>
                Nao pode exceder a pendencia exibida.
              </p>
              <div id="receipt-quantity-error">
                <FieldError message={quantityError} />
              </div>
            </div>

            <div className="grid gap-2">
              <label className={fieldLabelClassName} htmlFor="receipt-date">
                Data do recebimento
              </label>
              <Input
                id="receipt-date"
                type="date"
                value={draft.data}
                onChange={(event) => updateField("data", event.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <label className={fieldLabelClassName} htmlFor="receipt-note">
                Observacao
              </label>
              <textarea
                id="receipt-note"
                className="min-h-24 w-full rounded-amani border border-border bg-surface px-3 py-2 text-sm text-text-primary transition-colors placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                value={draft.observacao}
                onChange={(event) =>
                  updateField("observacao", event.target.value)
                }
                disabled={isSubmitting}
              />
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
                onClick={confirmReceipt}
                disabled={isSubmitting}
                className="w-full tablet:w-auto"
              >
                {isSubmitting ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                )}
                <span>{isSubmitting ? "Registrando" : "Confirmar"}</span>
              </Button>
            </>
          ) : (
            <Button
              type="button"
              onClick={moveToReview}
              disabled={isSubmitting}
              className="w-full tablet:w-auto"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              <span>Revisar recebimento</span>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
