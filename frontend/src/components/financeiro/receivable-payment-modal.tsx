"use client";

import { AlertCircle, CreditCard, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRegisterPayment } from "@/hooks/use-receivables";
import { toApiError } from "@/services/errors";

type ReceivablePaymentModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receivableId: string;
  clienteName?: string;
  saldo?: number;
};

type FormDraft = {
  valor: string;
};

type FormErrors = {
  valor?: string;
};

const fieldLabelClassName = "text-sm font-medium text-text-primary";
const fieldErrorClassName = "text-xs font-medium leading-5 text-danger";

function buildInitialDraft(): FormDraft {
  return { valor: "" };
}

function validateDraft(draft: FormDraft): FormErrors {
  const errors: FormErrors = {};
  const valor = Number(draft.valor);

  if (!draft.valor.trim()) {
    errors.valor = "Informe o valor do pagamento.";
  } else if (isNaN(valor) || valor <= 0) {
    errors.valor = "O valor deve ser maior que zero.";
  }

  return errors;
}

function hasErrors(errors: FormErrors): boolean {
  return Object.values(errors).some(Boolean);
}

export function ReceivablePaymentModal({
  open,
  onOpenChange,
  receivableId,
  clienteName,
  saldo
}: ReceivablePaymentModalProps) {
  const registerPayment = useRegisterPayment();

  const [draft, setDraft] = useState<FormDraft>(() => buildInitialDraft());
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isSubmitting = registerPayment.isPending;

  useEffect(() => {
    if (!open) {
      setDraft(buildInitialDraft());
      setErrors({});
      setSubmitError(null);
    }
  }, [open]);

  function updateValor(value: string) {
    setDraft({ valor: value });
    setErrors({});
    setSubmitError(null);
  }

  async function handleConfirm() {
    const validationErrors = validateDraft(draft);
    setErrors(validationErrors);

    if (hasErrors(validationErrors)) {
      return;
    }

    setSubmitError(null);

    try {
      await registerPayment.mutateAsync({
        id: receivableId,
        payload: { valor: Number(draft.valor) }
      });
      onOpenChange(false);
    } catch (error) {
      const apiError = toApiError(error);
      setSubmitError(apiError.message);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (isSubmitting) return;
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar pagamento</DialogTitle>
          <DialogDescription>
            Informe o valor recebido. O status e saldo serao atualizados pela
            fonte oficial apos confirmacao.
          </DialogDescription>
        </DialogHeader>

        {clienteName || saldo !== undefined ? (
          <div className="rounded-amani border border-border bg-surface-light p-4">
            {clienteName ? (
              <p className="break-words text-sm font-semibold text-text-primary">
                {clienteName}
              </p>
            ) : null}
            {saldo !== undefined ? (
              <p className="mt-1 text-xs leading-5 text-text-secondary">
                Saldo atual: R$ {saldo.toFixed(2).replace(".", ",")}
              </p>
            ) : null}
          </div>
        ) : null}

        {submitError ? (
          <div className="flex items-start gap-2 rounded-amani border border-danger bg-surface-light px-4 py-3 text-sm leading-6 text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{submitError}</span>
          </div>
        ) : null}

        <div className="grid gap-2">
          <label className={fieldLabelClassName} htmlFor="payment-valor">
            Valor pago (R$)
          </label>
          <Input
            id="payment-valor"
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            placeholder="0,00"
            value={draft.valor}
            onChange={(e) => updateValor(e.target.value)}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.valor)}
            aria-describedby={
              errors.valor ? "payment-valor-error" : undefined
            }
            autoFocus
          />
          {errors.valor ? (
            <p id="payment-valor-error" className={fieldErrorClassName}>
              {errors.valor}
            </p>
          ) : null}
        </div>

        <DialogFooter className="gap-2 tablet:gap-0">
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="w-full tablet:w-auto"
          >
            {isSubmitting ? (
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <CreditCard className="h-4 w-4" aria-hidden />
            )}
            <span>{isSubmitting ? "Registrando" : "Confirmar pagamento"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
