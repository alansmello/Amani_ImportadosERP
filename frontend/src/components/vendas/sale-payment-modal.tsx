"use client";

import { AlertCircle, CreditCard, LoaderCircle } from "lucide-react";
import { useMemo, useState } from "react";

import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
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
import { usePaymentSettings } from "@/hooks/use-payment-settings";
import { cn } from "@/lib/cn";
import type { PaymentMethod } from "@/types/payment-settings";

export type SalePaymentSelection = {
  formaPagamento: PaymentMethod;
  percentualTaxaOverride?: number | null;
};

type SalePaymentModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (selection: SalePaymentSelection) => Promise<void>;
  isSubmitting?: boolean;
};

const paymentMethods: Array<{ value: PaymentMethod; label: string }> = [
  { value: "Dinheiro", label: "Dinheiro" },
  { value: "PIX", label: "PIX" },
  { value: "CartaoDebito", label: "Cartao de debito" },
  { value: "CartaoCredito", label: "Cartao de credito" },
  { value: "Fiado", label: "Fiado" }
];

function formatPercent(value: number) {
  return `${value.toFixed(2).replace(".", ",")}%`;
}

function isCardMethod(method: PaymentMethod) {
  return method === "CartaoDebito" || method === "CartaoCredito";
}

function methodButtonClassName(active: boolean) {
  return cn(
    "flex min-h-16 w-full flex-col items-start justify-center rounded-amani border px-3 py-2 text-left transition-colors",
    active
      ? "border-primary bg-surface-light text-text-primary"
      : "border-border bg-surface text-text-secondary hover:border-primary hover:text-text-primary"
  );
}

export function SalePaymentModal({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting = false
}: SalePaymentModalProps) {
  const settingsQuery = usePaymentSettings();
  const [formaPagamento, setFormaPagamento] =
    useState<PaymentMethod>("Dinheiro");
  const [percentualTaxaOverride, setPercentualTaxaOverride] = useState("");
  const [error, setError] = useState<string | null>(null);

  const selectedSetting = useMemo(
    () =>
      settingsQuery.data?.find(
        (setting) => setting.formaPagamento === formaPagamento
      ),
    [settingsQuery.data, formaPagamento]
  );
  const showCardFields = isCardMethod(formaPagamento);

  async function handleConfirm() {
    setError(null);

    const override = percentualTaxaOverride.trim()
      ? Number(percentualTaxaOverride.replace(",", "."))
      : null;

    if (override !== null && (!Number.isFinite(override) || override < 0)) {
      setError("Informe uma taxa valida ou deixe o campo em branco.");
      return;
    }

    await onConfirm({
      formaPagamento,
      percentualTaxaOverride: showCardFields ? override : null
    });
  }

  function handleOpenChange(nextOpen: boolean) {
    if (isSubmitting) return;
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Forma de pagamento</DialogTitle>
          <DialogDescription>
            Selecione como a venda sera roteada no financeiro antes de registrar.
          </DialogDescription>
        </DialogHeader>

        {settingsQuery.isLoading ? (
          <LoadingState
            title="Carregando taxas"
            description="Aguarde enquanto as configuracoes sao carregadas."
          />
        ) : settingsQuery.isError ? (
          <ErrorState
            title="Nao foi possivel carregar taxas"
            description="As formas de pagamento precisam ser carregadas antes de registrar a venda."
            onRetry={() => void settingsQuery.refetch()}
          />
        ) : (
          <div className="space-y-5">
            {error ? (
              <div className="flex items-start gap-2 rounded-amani border border-danger bg-surface-light px-4 py-3 text-sm leading-6 text-danger">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>{error}</span>
              </div>
            ) : null}

            <div className="grid gap-3 tablet:grid-cols-2">
              {paymentMethods.map((method) => {
                const methodSetting = settingsQuery.data?.find(
                  (setting) => setting.formaPagamento === method.value
                );

                return (
                  <button
                    key={method.value}
                    type="button"
                    className={methodButtonClassName(
                      formaPagamento === method.value
                    )}
                    onClick={() => {
                      setFormaPagamento(method.value);
                      setPercentualTaxaOverride("");
                      setError(null);
                    }}
                    disabled={isSubmitting}
                  >
                    <span className="text-sm font-semibold">
                      {method.label}
                    </span>
                    <span className="mt-1 text-xs">
                      Taxa configurada:{" "}
                      {formatPercent(methodSetting?.percentualTaxa ?? 0)}
                    </span>
                  </button>
                );
              })}
            </div>

            {showCardFields ? (
              <div className="grid gap-2">
                <label
                  className="text-sm font-medium text-text-primary"
                  htmlFor="sale-payment-fee-override"
                >
                  Taxa da transacao (%)
                </label>
                <Input
                  id="sale-payment-fee-override"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  placeholder={String(selectedSetting?.percentualTaxa ?? 0)}
                  value={percentualTaxaOverride}
                  onChange={(event) =>
                    setPercentualTaxaOverride(event.target.value)
                  }
                  disabled={isSubmitting}
                />
                <p className="text-xs leading-5 text-text-secondary">
                  Deixe em branco para usar a taxa configurada. O valor liquido
                  final sera confirmado pela API.
                </p>
              </div>
            ) : (
              <p className="rounded-amani border border-border bg-surface-light px-4 py-3 text-sm leading-6 text-text-secondary">
                Esta forma de pagamento nao possui taxa de operadora.
              </p>
            )}
          </div>
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
            disabled={isSubmitting || settingsQuery.isLoading || settingsQuery.isError}
            className="w-full tablet:w-auto"
          >
            {isSubmitting ? (
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <CreditCard className="h-4 w-4" aria-hidden />
            )}
            <span>{isSubmitting ? "Registrando" : "Confirmar venda"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
