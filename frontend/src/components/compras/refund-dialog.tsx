"use client";

import { LoaderCircle, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  buildRefundPayload,
  getPurchaseValidationMessage,
  validateRefundDraft
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
import { useRegisterPurchaseRefund } from "@/hooks/use-purchases";
import { toApiError } from "@/services/errors";
import type {
  Purchase,
  PurchaseRefundDraft,
  PurchaseValidationError
} from "@/types/purchase";

type RefundDialogProps = {
  purchase: Purchase;
};

const fieldLabelClassName = "text-sm font-medium text-text-primary";
const fieldHelpClassName = "text-xs leading-5 text-text-secondary";
const fieldErrorClassName = "text-xs font-medium leading-5 text-danger";

function createOperationId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `refund-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

function buildInitialDraft(): PurchaseRefundDraft {
  return {
    valor: "",
    data: new Date().toISOString().slice(0, 10),
    referenciaExterna: "",
    observacao: ""
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className={fieldErrorClassName}>{message}</p>;
}

export function RefundDialog({ purchase }: RefundDialogProps) {
  const registerRefund = useRegisterPurchaseRefund();
  const [open, setOpen] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [operationId, setOperationId] = useState(() => createOperationId());
  const [draft, setDraft] = useState<PurchaseRefundDraft>(() =>
    buildInitialDraft()
  );
  const [errors, setErrors] = useState<PurchaseValidationError[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const saldoReembolsavel = purchase.saldoReembolsavel ?? purchase.total;
  const hasRefundableBalance = saldoReembolsavel > 0;
  const valueError = getPurchaseValidationMessage(errors, "valor");
  const isSubmitting = registerRefund.isPending;

  const formattedBalance = useMemo(
    () => formatCurrency(Math.max(saldoReembolsavel, 0)),
    [saldoReembolsavel]
  );

  useEffect(() => {
    if (!open) {
      setIsReviewing(false);
      setOperationId(createOperationId());
      setDraft(buildInitialDraft());
      setErrors([]);
      setSubmitError(null);
    }
  }, [open]);

  function updateField(field: keyof PurchaseRefundDraft, value: string) {
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
    const validationErrors = validateRefundDraft(draft, saldoReembolsavel);
    setErrors(validationErrors);
    setSubmitError(null);

    if (validationErrors.length === 0) {
      setIsReviewing(true);
    }
  }

  async function confirmRefund() {
    setSubmitError(null);

    try {
      await registerRefund.mutateAsync({
        compraId: purchase.id,
        payload: buildRefundPayload(draft, operationId)
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
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={!hasRefundableBalance}
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          <span>Reembolso</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar reembolso</DialogTitle>
          <DialogDescription>
            Registre o credito recebido do fornecedor. O valor entra no caixa,
            mas nao altera o total bruto da compra.
          </DialogDescription>
        </DialogHeader>

        {submitError ? (
          <div className="rounded-amani border border-danger bg-surface-light px-4 py-3 text-sm leading-6 text-danger">
            {submitError}
          </div>
        ) : null}

        <div className="rounded-amani border border-border bg-surface-light p-4">
          <p className="text-xs uppercase text-text-secondary">
            Saldo reembolsavel
          </p>
          <p className="mt-2 text-lg font-semibold text-text-primary">
            {formattedBalance}
          </p>
          <p className="mt-1 text-xs leading-5 text-text-secondary">
            Reembolsado liquido:{" "}
            {formatCurrency(purchase.totalReembolsadoLiquido ?? 0)}
          </p>
        </div>

        {isReviewing ? (
          <div className="grid gap-3 rounded-amani border border-info bg-surface-light p-4">
            <p className="text-sm font-semibold text-text-primary">
              Revisao do reembolso
            </p>
            <p className="text-sm leading-6 text-text-secondary">
              Valor: {formatCurrency(Number(draft.valor.replace(",", ".")))}
            </p>
            <p className="text-sm leading-6 text-text-secondary">
              Data: {draft.data || "Data atual da fonte oficial"}
            </p>
            {draft.referenciaExterna.trim() ? (
              <p className="text-sm leading-6 text-text-secondary">
                Referencia: {draft.referenciaExterna.trim()}
              </p>
            ) : null}
            {draft.observacao.trim() ? (
              <p className="text-sm leading-6 text-text-secondary">
                Observacao: {draft.observacao.trim()}
              </p>
            ) : null}
            <p className="text-xs leading-5 text-text-secondary">
              Operacao idempotente: se a mesma confirmacao for reenviada, o
              sistema deve reconhecer a operacao.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className={fieldLabelClassName} htmlFor="refund-value">
                Valor reembolsado
              </label>
              <Input
                id="refund-value"
                type="number"
                min="0.01"
                max={Math.max(saldoReembolsavel, 0)}
                step="0.01"
                inputMode="decimal"
                value={draft.valor}
                onChange={(event) => updateField("valor", event.target.value)}
                disabled={isSubmitting}
                aria-invalid={Boolean(valueError)}
                aria-describedby={
                  valueError ? "refund-value-error" : "refund-value-help"
                }
              />
              <p id="refund-value-help" className={fieldHelpClassName}>
                Nao pode exceder o saldo reembolsavel exibido.
              </p>
              <div id="refund-value-error">
                <FieldError message={valueError} />
              </div>
            </div>

            <div className="grid gap-2">
              <label className={fieldLabelClassName} htmlFor="refund-date">
                Data do reembolso
              </label>
              <Input
                id="refund-date"
                type="date"
                value={draft.data}
                onChange={(event) => updateField("data", event.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <label
                className={fieldLabelClassName}
                htmlFor="refund-reference"
              >
                Referencia externa
              </label>
              <Input
                id="refund-reference"
                value={draft.referenciaExterna}
                onChange={(event) =>
                  updateField("referenciaExterna", event.target.value)
                }
                disabled={isSubmitting}
                placeholder="Ex.: pedido Shopee, comprovante, protocolo"
              />
            </div>

            <div className="grid gap-2">
              <label className={fieldLabelClassName} htmlFor="refund-note">
                Observacao
              </label>
              <textarea
                id="refund-note"
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
                onClick={confirmRefund}
                disabled={isSubmitting}
                className="w-full tablet:w-auto"
              >
                {isSubmitting ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <RotateCcw className="h-4 w-4" aria-hidden />
                )}
                <span>
                  {isSubmitting ? "Registrando" : "Confirmar reembolso"}
                </span>
              </Button>
            </>
          ) : (
            <Button
              type="button"
              onClick={moveToReview}
              disabled={isSubmitting || !hasRefundableBalance}
              className="w-full tablet:w-auto"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              <span>Revisar reembolso</span>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
