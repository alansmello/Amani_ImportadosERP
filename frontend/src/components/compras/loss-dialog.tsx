"use client";

import { AlertTriangle, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

import {
  buildLossPayload,
  getPurchaseValidationMessage,
  validateLossDraft
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
import { useRegisterPurchaseLoss } from "@/hooks/use-purchases";
import { toApiError } from "@/services/errors";
import {
  purchaseLossMotives,
  type PurchaseItem,
  type PurchaseLossDraft,
  type PurchaseValidationError
} from "@/types/purchase";

type LossDialogProps = {
  compraId: string;
  item: PurchaseItem;
  productName: string;
};

const fieldLabelClassName = "text-sm font-medium text-text-primary";
const fieldHelpClassName = "text-xs leading-5 text-text-secondary";
const fieldErrorClassName = "text-xs font-medium leading-5 text-danger";
const selectClassName =
  "h-10 rounded-amani border border-border bg-surface px-3 text-sm text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";

function buildInitialDraft(): PurchaseLossDraft {
  return {
    quantidade: "",
    motivo: "",
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

export function LossDialog({ compraId, item, productName }: LossDialogProps) {
  const registerLoss = useRegisterPurchaseLoss();
  const [open, setOpen] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [draft, setDraft] = useState<PurchaseLossDraft>(() =>
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
  const motiveError = getPurchaseValidationMessage(errors, "motivo");
  const isSubmitting = registerLoss.isPending;
  const hasPending = item.quantidadePendente > 0;

  function updateField(field: keyof PurchaseLossDraft, value: string) {
    setDraft(
      (currentDraft) =>
        ({
          ...currentDraft,
          [field]: value
        }) as PurchaseLossDraft
    );
    setErrors((currentErrors) =>
      currentErrors.filter((error) => error.field !== field)
    );
    setSubmitError(null);
  }

  function moveToReview() {
    const validationErrors = validateLossDraft(draft, item.quantidadePendente);
    setErrors(validationErrors);
    setSubmitError(null);

    if (validationErrors.length === 0) {
      setIsReviewing(true);
    }
  }

  async function confirmLoss() {
    setSubmitError(null);

    try {
      await registerLoss.mutateAsync({
        compraId,
        itemId: item.id,
        payload: buildLossPayload(draft)
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
          <AlertTriangle className="h-4 w-4" aria-hidden />
          <span>Perda</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar perda</DialogTitle>
          <DialogDescription>
            Registre apenas quantidade perdida, extraviada ou avariada. Esta
            acao nao gera entrada de estoque.
          </DialogDescription>
        </DialogHeader>

        {submitError ? (
          <div className="rounded-amani border border-danger bg-surface-light px-4 py-3 text-sm leading-6 text-danger">
            {submitError}
          </div>
        ) : null}

        <div className="rounded-amani border border-border bg-surface-light p-4">
          <p className="text-sm font-semibold text-text-primary">{productName}</p>
          <p className="mt-1 text-xs leading-5 text-text-secondary">
            Pendente: {item.quantidadePendente} unidade(s)
          </p>
        </div>

        {isReviewing ? (
          <div className="grid gap-3 rounded-amani border border-warning bg-surface-light p-4">
            <p className="text-sm font-semibold text-text-primary">
              Revisao da perda
            </p>
            <p className="text-sm leading-6 text-text-secondary">
              Quantidade: {draft.quantidade}
            </p>
            <p className="text-sm leading-6 text-text-secondary">
              Motivo: {draft.motivo}
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
              Perdas, extravios e avarias reduzem a pendencia, mas nao geram
              entrada de estoque.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className={fieldLabelClassName} htmlFor="loss-quantity">
                Quantidade perdida
              </label>
              <Input
                id="loss-quantity"
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
                  quantityError ? "loss-quantity-error" : "loss-quantity-help"
                }
              />
              <p id="loss-quantity-help" className={fieldHelpClassName}>
                Nao pode exceder a pendencia exibida.
              </p>
              <div id="loss-quantity-error">
                <FieldError message={quantityError} />
              </div>
            </div>

            <div className="grid gap-2">
              <label className={fieldLabelClassName} htmlFor="loss-motive">
                Motivo
              </label>
              <select
                id="loss-motive"
                className={selectClassName}
                value={draft.motivo}
                onChange={(event) => updateField("motivo", event.target.value)}
                disabled={isSubmitting}
                aria-invalid={Boolean(motiveError)}
                aria-describedby={
                  motiveError ? "loss-motive-error" : "loss-motive-help"
                }
              >
                <option value="">Selecione</option>
                {purchaseLossMotives.map((motive) => (
                  <option key={motive} value={motive}>
                    {motive}
                  </option>
                ))}
              </select>
              <p id="loss-motive-help" className={fieldHelpClassName}>
                Motivos aceitos: Perda, Extravio ou Avaria.
              </p>
              <div id="loss-motive-error">
                <FieldError message={motiveError} />
              </div>
            </div>

            <div className="grid gap-2">
              <label className={fieldLabelClassName} htmlFor="loss-date">
                Data da perda
              </label>
              <Input
                id="loss-date"
                type="date"
                value={draft.data}
                onChange={(event) => updateField("data", event.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <label className={fieldLabelClassName} htmlFor="loss-note">
                Observacao
              </label>
              <textarea
                id="loss-note"
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
              <Button type="button" onClick={confirmLoss} disabled={isSubmitting}>
                {isSubmitting ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <AlertTriangle className="h-4 w-4" aria-hidden />
                )}
                <span>{isSubmitting ? "Registrando" : "Confirmar perda"}</span>
              </Button>
            </>
          ) : (
            <Button type="button" onClick={moveToReview} disabled={isSubmitting}>
              <AlertTriangle className="h-4 w-4" aria-hidden />
              <span>Revisar perda</span>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
