"use client";

import { LoaderCircle, RotateCcw, Undo2 } from "lucide-react";
import { useEffect, useState } from "react";

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
import {
  useCancelPurchaseRefund,
  useCompensatePurchaseReturn
} from "@/hooks/use-purchases";
import { toApiError } from "@/services/errors";
import type { PurchaseEventCorrectionDraft } from "@/types/purchase";

type PurchaseEventCancelDialogProps = {
  compraId: string;
  eventId: string;
  kind: "return" | "refund";
  requiresPhysicalConfirmation?: boolean;
  disabled?: boolean;
};

const fieldLabelClassName = "text-sm font-medium text-text-primary";
const fieldHelpClassName = "text-xs leading-5 text-text-secondary";
const fieldErrorClassName = "text-xs font-medium leading-5 text-danger";

function createOperationId(kind: PurchaseEventCancelDialogProps["kind"]) {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${kind}-correction-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

function buildInitialDraft(): PurchaseEventCorrectionDraft {
  return {
    data: new Date().toISOString().slice(0, 10),
    motivo: "",
    presencaFisicaConfirmada: false
  };
}

export function PurchaseEventCancelDialog({
  compraId,
  eventId,
  kind,
  requiresPhysicalConfirmation = false,
  disabled = false
}: PurchaseEventCancelDialogProps) {
  const compensateReturn = useCompensatePurchaseReturn();
  const cancelRefund = useCancelPurchaseRefund();
  const [open, setOpen] = useState(false);
  const [operationId, setOperationId] = useState(() => createOperationId(kind));
  const [draft, setDraft] = useState<PurchaseEventCorrectionDraft>(() =>
    buildInitialDraft()
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const isReturn = kind === "return";
  const isSubmitting = isReturn
    ? compensateReturn.isPending
    : cancelRefund.isPending;
  const title = isReturn ? "Compensar devolucao" : "Cancelar reembolso";
  const actionLabel = isReturn ? "Compensar" : "Cancelar";
  const reasonId = `${kind}-correction-reason`;
  const reasonErrorId = `${kind}-correction-error`;
  const submitErrorId = `${kind}-correction-submit-error`;

  useEffect(() => {
    if (!open) {
      setOperationId(createOperationId(kind));
      setDraft(buildInitialDraft());
      setSubmitError(null);
      setFieldError(null);
    }
  }, [kind, open]);

  function updateField(field: keyof PurchaseEventCorrectionDraft, value: string | boolean) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value
    }));
    setSubmitError(null);
    setFieldError(null);
  }

  async function submitCorrection() {
    const motivo = draft.motivo.trim();
    if (!motivo) {
      setFieldError("Informe o motivo da correcao.");
      return;
    }

    if (requiresPhysicalConfirmation && !draft.presencaFisicaConfirmada) {
      setFieldError("Confirme a presenca fisica da mercadoria para retornar ao estoque.");
      return;
    }

    setSubmitError(null);

    try {
      if (isReturn) {
        await compensateReturn.mutateAsync({
          compraId,
          devolucaoId: eventId,
          payload: {
            operacaoId: operationId,
            dataCompensacao: draft.data || null,
            motivo,
            presencaFisicaConfirmada: requiresPhysicalConfirmation
              ? draft.presencaFisicaConfirmada
              : false
          }
        });
      } else {
        await cancelRefund.mutateAsync({
          compraId,
          reembolsoId: eventId,
          payload: {
            operacaoId: operationId,
            dataCancelamento: draft.data || null,
            motivo
          }
        });
      }

      setOpen(false);
    } catch (error) {
      const apiError = toApiError(error);
      setSubmitError(apiError.message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="secondary" size="sm" disabled={disabled}>
          {isReturn ? (
            <Undo2 className="h-4 w-4" aria-hidden />
          ) : (
            <RotateCcw className="h-4 w-4" aria-hidden />
          )}
          <span>{actionLabel}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {isReturn
              ? "Neutraliza a devolucao sem apagar o evento original. Se a devolucao retirou estoque, a entrada compensatoria exige confirmacao fisica."
              : "Registra uma compensacao financeira negativa sem apagar o reembolso original."}
          </DialogDescription>
        </DialogHeader>

        {submitError ? (
          <div
            id={submitErrorId}
            role="alert"
            className="rounded-amani border border-danger bg-surface-light px-4 py-3 text-sm leading-6 text-danger"
          >
            {submitError}
          </div>
        ) : null}

        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className={fieldLabelClassName} htmlFor={`${kind}-correction-date`}>
              Data da correcao
            </label>
            <Input
              id={`${kind}-correction-date`}
              type="date"
              value={draft.data}
              onChange={(event) => updateField("data", event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-2">
            <label className={fieldLabelClassName} htmlFor={reasonId}>
              Motivo obrigatorio
            </label>
            <textarea
              id={reasonId}
              className="min-h-24 w-full rounded-amani border border-border bg-surface px-3 py-2 text-sm text-text-primary transition-colors placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
              value={draft.motivo}
              onChange={(event) => updateField("motivo", event.target.value)}
              disabled={isSubmitting}
              placeholder="Explique por que este evento precisa ser neutralizado."
              aria-invalid={Boolean(fieldError)}
              aria-describedby={fieldError ? reasonErrorId : undefined}
            />
            {fieldError ? (
              <p id={reasonErrorId} className={fieldErrorClassName}>
                {fieldError}
              </p>
            ) : null}
          </div>

          {requiresPhysicalConfirmation ? (
            <label className="flex gap-3 rounded-amani border border-warning bg-surface-light p-4 text-sm leading-6 text-text-primary">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-border"
                checked={draft.presencaFisicaConfirmada}
                onChange={(event) =>
                  updateField("presencaFisicaConfirmada", event.target.checked)
                }
                disabled={isSubmitting}
              />
              <span>
                Confirmo que a mercadoria voltou fisicamente e pode retornar ao
                estoque pelo custo original do recebimento.
              </span>
            </label>
          ) : null}

          <p className={fieldHelpClassName}>
            Operacao idempotente: reenvio do mesmo comando deve produzir no
            maximo uma correcao valida.
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={submitCorrection}
            disabled={isSubmitting || disabled}
            aria-describedby={submitError ? submitErrorId : undefined}
            className="w-full tablet:w-auto"
          >
            {isSubmitting ? (
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
            ) : isReturn ? (
              <Undo2 className="h-4 w-4" aria-hidden />
            ) : (
              <RotateCcw className="h-4 w-4" aria-hidden />
            )}
            <span>{isSubmitting ? "Corrigindo" : `${actionLabel} evento`}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
