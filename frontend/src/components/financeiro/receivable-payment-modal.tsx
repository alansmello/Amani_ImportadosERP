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
  formaPagamento?: string | null;
};

type FormDraft = {
  valor: string;
  desconto: string;
  valorBrutoLiquidado: string;
  percentualTaxaOperadora: string;
};

type FormErrors = {
  valor?: string;
  desconto?: string;
  valorBrutoLiquidado?: string;
  percentualTaxaOperadora?: string;
};

const fieldLabelClassName = "text-sm font-medium text-text-primary";
const fieldErrorClassName = "text-xs font-medium leading-5 text-danger";

function buildInitialDraft(): FormDraft {
  return {
    valor: "",
    desconto: "",
    valorBrutoLiquidado: "",
    percentualTaxaOperadora: ""
  };
}

function parseDecimal(value: string) {
  return Number(value.replace(",", "."));
}

function validateCreditDraft(draft: FormDraft): FormErrors {
  const errors: FormErrors = {};
  const valor = parseDecimal(draft.valor);

  if (!draft.valor.trim()) {
    errors.valor = "Informe o valor liquido recebido na conta.";
  } else if (isNaN(valor) || valor <= 0) {
    errors.valor = "O valor deve ser maior que zero.";
  }

  return errors;
}

function validateDraft(draft: FormDraft): FormErrors {
  const errors: FormErrors = {};
  const valor = parseDecimal(draft.valor);
  const desconto = draft.desconto.trim() ? parseDecimal(draft.desconto) : 0;
  const valorBrutoLiquidado = draft.valorBrutoLiquidado.trim()
    ? parseDecimal(draft.valorBrutoLiquidado)
    : undefined;
  const percentualTaxaOperadora = draft.percentualTaxaOperadora.trim()
    ? parseDecimal(draft.percentualTaxaOperadora)
    : undefined;

  if (!draft.valor.trim()) {
    errors.valor = "Informe o valor do pagamento.";
  } else if (isNaN(valor) || valor <= 0) {
    errors.valor = "O valor deve ser maior que zero.";
  }

  if (!Number.isFinite(desconto) || desconto < 0) {
    errors.desconto = "O desconto deve ser maior ou igual a zero.";
  }

  if (
    valorBrutoLiquidado !== undefined &&
    (!Number.isFinite(valorBrutoLiquidado) || valorBrutoLiquidado <= 0)
  ) {
    errors.valorBrutoLiquidado = "Informe um valor bruto valido.";
  }

  if (
    percentualTaxaOperadora !== undefined &&
    (!Number.isFinite(percentualTaxaOperadora) || percentualTaxaOperadora < 0)
  ) {
    errors.percentualTaxaOperadora = "Informe uma taxa valida.";
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
    setErrors({});
    setSubmitError(null);
  }

  async function handleConfirm() {
    const validationErrors = isCartaoCredito
      ? validateCreditDraft(draft)
      : validateDraft(draft);
    setErrors(validationErrors);

    if (hasErrors(validationErrors)) {
      return;
    }

    setSubmitError(null);

    try {
      if (isCartaoCredito) {
        await registerPayment.mutateAsync({
          id: receivableId,
          payload: {
            valor: parseDecimal(draft.valor),
            desconto: 0,
            valorBrutoLiquidado: saldo
          }
        });
      } else {
        await registerPayment.mutateAsync({
          id: receivableId,
          payload: {
            valor: parseDecimal(draft.valor),
            desconto: draft.desconto.trim() ? parseDecimal(draft.desconto) : 0,
            valorBrutoLiquidado: draft.valorBrutoLiquidado.trim()
              ? parseDecimal(draft.valorBrutoLiquidado)
              : undefined,
            percentualTaxaOperadora: draft.percentualTaxaOperadora.trim()
              ? parseDecimal(draft.percentualTaxaOperadora)
              : undefined
          }
        });
      }
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

  const valorLiquidoPreview =
    isCartaoCredito && draft.valor.trim() && saldo !== undefined
      ? saldo - parseDecimal(draft.valor)
      : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar pagamento</DialogTitle>
          <DialogDescription>
            {isCartaoCredito
              ? "Informe o valor liquido que entrou na conta. A diferenca sera registrada como custo de operadora."
              : "Informe o valor recebido. O status e saldo serao atualizados pela fonte oficial apos confirmacao."}
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
                {isCartaoCredito ? "Valor bruto a receber" : "Saldo atual"}:{" "}
                R$ {saldo.toFixed(2).replace(".", ",")}
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

        {isCartaoCredito ? (
          <>
            <div className="grid gap-2">
              <label className={fieldLabelClassName} htmlFor="payment-valor">
                Valor liquido recebido na conta (R$)
              </label>
              <Input
                id="payment-valor"
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                placeholder="0,00"
                value={draft.valor}
                onChange={(e) => updateDraftField("valor", e.target.value)}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.valor)}
                aria-describedby={
                  errors.valor ? "payment-valor-error" : "payment-valor-help"
                }
                autoFocus
              />
              <p id="payment-valor-help" className="text-xs leading-5 text-text-secondary">
                Informe o valor que efetivamente caiu na conta, apos a taxa da operadora.
              </p>
              {errors.valor ? (
                <p id="payment-valor-error" className={fieldErrorClassName}>
                  {errors.valor}
                </p>
              ) : null}
            </div>

            {valorLiquidoPreview !== null && valorLiquidoPreview > 0 ? (
              <div className="rounded-amani border border-border bg-surface-light px-4 py-3 text-sm leading-6">
                <p className="text-text-secondary">
                  Custo de operadora (calculado automaticamente):{" "}
                  <span className="font-semibold text-warning">
                    R$ {valorLiquidoPreview.toFixed(2).replace(".", ",")}
                  </span>
                </p>
              </div>
            ) : null}
          </>
        ) : (
          <>
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
                onChange={(e) => updateDraftField("valor", e.target.value)}
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
                onChange={(e) => updateDraftField("desconto", e.target.value)}
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

            <div className="grid gap-4 rounded-amani border border-border bg-surface-light p-4 tablet:grid-cols-2">
              <div className="grid gap-2">
                <label className={fieldLabelClassName} htmlFor="payment-gross-settled">
                  Valor bruto liquidado (R$)
                </label>
                <Input
                  id="payment-gross-settled"
                  type="number"
                  min="0.01"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="Use em recebimento de c"
                  value={draft.valorBrutoLiquidado}
                  onChange={(e) =>
                    updateDraftField("valorBrutoLiquidado", e.target.value)
                  }
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.valorBrutoLiquidado)}
                  aria-describedby={
                    errors.valorBrutoLiquidado
                      ? "payment-gross-settled-error"
                      : "payment-gross-settled-help"
                  }
                />
                <p id="payment-gross-settled-help" className="text-xs leading-5 text-text-secondary">
                  Para credito, informe o bruto fechado quando o valor recebido for
                  liquido de taxa.
                </p>
                {errors.valorBrutoLiquidado ? (
                  <p id="payment-gross-settled-error" className={fieldErrorClassName}>
                    {errors.valorBrutoLiquidado}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <label className={fieldLabelClassName} htmlFor="payment-operator-fee">
                  Taxa operadora (%)
                </label>
                <Input
                  id="payment-operator-fee"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="Ex.: 3,49"
                  value={draft.percentualTaxaOperadora}
                  onChange={(e) =>
                    updateDraftField("percentualTaxaOperadora", e.target.value)
                  }
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.percentualTaxaOperadora)}
                  aria-describedby={
                    errors.percentualTaxaOperadora
                      ? "payment-operator-fee-error"
                      : undefined
                  }
                />
                {errors.percentualTaxaOperadora ? (
                  <p id="payment-operator-fee-error" className={fieldErrorClassName}>
                    {errors.percentualTaxaOperadora}
                  </p>
                ) : null}
              </div>
            </div>
          </>
        )}

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
