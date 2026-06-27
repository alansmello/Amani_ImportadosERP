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
import type { PaymentMethod } from "@/types/payment-settings";

type ReceivablePaymentModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receivableId: string;
  clienteName?: string;
  saldo?: number;
  formaPagamento?: PaymentMethod | null;
};

type FormDraft = {
  valor: string;
  desconto: string;
};

type FormErrors = Partial<Record<keyof FormDraft, string>>;

const fieldLabelClassName = "text-sm font-medium text-text-primary";
const fieldErrorClassName = "text-xs font-medium leading-5 text-danger";

function buildInitialDraft(): FormDraft {
  return { valor: "", desconto: "" };
}

function parseDecimal(value: string) {
  return Number(value.replace(",", "."));
}

function formatCurrency(value: number) {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

function validateDraft(
  draft: FormDraft,
  isCartaoCredito: boolean,
  saldo?: number
): FormErrors {
  const errors: FormErrors = {};
  const valor = parseDecimal(draft.valor);

  if (!draft.valor.trim()) {
    errors.valor = isCartaoCredito
      ? "Informe o valor liquido recebido na conta."
      : "Informe o valor do pagamento.";
  } else if (!Number.isFinite(valor) || valor <= 0) {
    errors.valor = "O valor deve ser maior que zero.";
  } else if (saldo !== undefined && valor > saldo) {
    errors.valor = isCartaoCredito
      ? "O valor liquido nao pode exceder o saldo bruto."
      : "O pagamento nao pode exceder o saldo atual.";
  }

  if (!isCartaoCredito) {
    const desconto = draft.desconto.trim() ? parseDecimal(draft.desconto) : 0;
    if (!Number.isFinite(desconto) || desconto < 0) {
      errors.desconto = "O desconto deve ser maior ou igual a zero.";
    } else if (
      saldo !== undefined &&
      Number.isFinite(valor) &&
      valor + desconto > saldo
    ) {
      errors.desconto = "Pagamento e desconto nao podem exceder o saldo.";
    }
  }

  return errors;
}

export function ReceivablePaymentModal({
  open,
  onOpenChange,
  receivableId,
  clienteName,
  saldo,
  formaPagamento
}: ReceivablePaymentModalProps) {
  const registerPayment = useRegisterPayment();
  const isCartaoCredito = formaPagamento === "CartaoCredito";
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

  function updateDraftField(field: keyof FormDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError(null);
  }

  async function handleConfirm() {
    const validationErrors = validateDraft(draft, isCartaoCredito, saldo);
    if (isCartaoCredito && saldo === undefined) {
      validationErrors.valor = "Nao foi possivel identificar o saldo bruto.";
    }
    setErrors(validationErrors);

    if (Object.values(validationErrors).some(Boolean)) {
      return;
    }

    setSubmitError(null);

    try {
      await registerPayment.mutateAsync({
        id: receivableId,
        payload: isCartaoCredito
          ? {
              valor: parseDecimal(draft.valor),
              desconto: 0,
              valorBrutoLiquidado: saldo
            }
          : {
              valor: parseDecimal(draft.valor),
              desconto: draft.desconto.trim()
                ? parseDecimal(draft.desconto)
                : 0
            }
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

  const parsedNetValue = draft.valor.trim()
    ? parseDecimal(draft.valor)
    : Number.NaN;
  const operatorFeePreview =
    isCartaoCredito &&
    saldo !== undefined &&
    Number.isFinite(parsedNetValue) &&
    parsedNetValue > 0 &&
    parsedNetValue <= saldo
      ? saldo - parsedNetValue
      : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar pagamento</DialogTitle>
          <DialogDescription>
            {isCartaoCredito
              ? "Informe o valor liquido creditado pela operadora. O saldo bruto sera liquidado integralmente."
              : "Informe o valor recebido. O saldo sera atualizado apos a confirmacao."}
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
                {isCartaoCredito ? "Valor bruto integral" : "Saldo atual"}: {" "}
                {formatCurrency(saldo)}
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
            {isCartaoCredito
              ? "Valor liquido recebido na conta (R$)"
              : "Valor pago (R$)"}
          </label>
          <Input
            id="payment-valor"
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            placeholder="0,00"
            value={draft.valor}
            onChange={(event) => updateDraftField("valor", event.target.value)}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.valor)}
            aria-describedby={
              errors.valor
                ? "payment-valor-error"
                : isCartaoCredito
                  ? "payment-valor-help"
                  : undefined
            }
            autoFocus
          />
          {isCartaoCredito ? (
            <p id="payment-valor-help" className="text-xs leading-5 text-text-secondary">
              A diferenca entre o bruto e o liquido sera registrada como despesa
              de operadora.
            </p>
          ) : null}
          {errors.valor ? (
            <p id="payment-valor-error" className={fieldErrorClassName}>
              {errors.valor}
            </p>
          ) : null}
        </div>

        {!isCartaoCredito ? (
          <div className="grid gap-2">
            <label className={fieldLabelClassName} htmlFor="payment-discount">
              Desconto (R$)
            </label>
            <Input
              id="payment-discount"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="0,00"
              value={draft.desconto}
              onChange={(event) =>
                updateDraftField("desconto", event.target.value)
              }
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.desconto)}
              aria-describedby={
                errors.desconto ? "payment-discount-error" : undefined
              }
            />
            {errors.desconto ? (
              <p id="payment-discount-error" className={fieldErrorClassName}>
                {errors.desconto}
              </p>
            ) : null}
          </div>
        ) : null}

        {operatorFeePreview !== null ? (
          <div className="rounded-amani border border-border bg-surface-light px-4 py-3 text-sm leading-6">
            <p className="text-text-secondary">
              Despesa de operadora: {" "}
              <span className="font-semibold text-warning">
                {formatCurrency(operatorFeePreview)}
              </span>
            </p>
          </div>
        ) : null}

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
