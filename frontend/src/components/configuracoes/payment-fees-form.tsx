"use client";

import { AlertCircle, LoaderCircle, Save } from "lucide-react";
import { useEffect, useState } from "react";

import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  usePaymentSettings,
  useUpdatePaymentSetting
} from "@/hooks/use-payment-settings";
import { toApiError } from "@/services/errors";
import type { PaymentMethod, PaymentMethodSettings } from "@/types/payment-settings";

type DraftMap = Partial<Record<PaymentMethod, string>>;

const methodLabels: Record<PaymentMethod, string> = {
  Dinheiro: "Dinheiro",
  PIX: "PIX",
  CartaoDebito: "Cartao de debito",
  CartaoCredito: "Cartao de credito",
  Fiado: "Fiado"
};

function buildDraft(settings: PaymentMethodSettings[]): DraftMap {
  return Object.fromEntries(
    settings.map((setting) => [
      setting.formaPagamento,
      String(setting.percentualTaxa)
    ])
  ) as DraftMap;
}

export function PaymentFeesForm() {
  const settingsQuery = usePaymentSettings();
  const updateSetting = useUpdatePaymentSetting();
  const [draft, setDraft] = useState<DraftMap>({});
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (settingsQuery.data) {
      setDraft(buildDraft(settingsQuery.data));
    }
  }, [settingsQuery.data]);

  async function handleSave(setting: PaymentMethodSettings) {
    setMessage(null);
    setError(null);

    const rawValue = draft[setting.formaPagamento] ?? "";
    const percentualTaxa = Number(rawValue.replace(",", "."));

    if (!Number.isFinite(percentualTaxa) || percentualTaxa < 0) {
      setError("Informe uma taxa valida maior ou igual a zero.");
      return;
    }

    try {
      await updateSetting.mutateAsync({
        formaPagamento: setting.formaPagamento,
        payload: { percentualTaxa }
      });
      setMessage("Taxa atualizada.");
    } catch (saveError) {
      const apiError = toApiError(saveError);
      setError(apiError.message);
    }
  }

  if (settingsQuery.isLoading) {
    return (
      <LoadingState
        title="Carregando taxas"
        description="Aguarde enquanto as formas de pagamento sao carregadas."
      />
    );
  }

  if (settingsQuery.isError) {
    return (
      <ErrorState
        title="Nao foi possivel carregar taxas"
        description="Tente novamente para editar as configuracoes de pagamento."
        onRetry={() => void settingsQuery.refetch()}
      />
    );
  }

  const settings = settingsQuery.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Taxa do cartao de debito</CardTitle>
        <CardDescription>
          A taxa padrao e aplicada automaticamente em vendas no cartao de debito.
          Para cartao de credito, a taxa e registrada no momento do recebimento.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {message ? (
          <div className="rounded-amani border border-success bg-surface-light px-4 py-3 text-sm text-success">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="flex items-start gap-2 rounded-amani border border-danger bg-surface-light px-4 py-3 text-sm leading-6 text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{error}</span>
          </div>
        ) : null}

        <div className="grid gap-4">
          {settings.filter((s) => s.formaPagamento === "CartaoDebito").map((setting) => {
            const isSaving =
              updateSetting.isPending &&
              updateSetting.variables?.formaPagamento === setting.formaPagamento;

            return (
              <div
                key={setting.formaPagamento}
                className="grid gap-3 rounded-amani border border-border bg-surface-light p-4 tablet:grid-cols-[minmax(0,1fr)_160px_auto] tablet:items-end"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary">
                    {methodLabels[setting.formaPagamento]}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-text-secondary">
                    Atualizado em{" "}
                    {new Date(setting.atualizadoEm).toLocaleString("pt-BR")}
                  </p>
                </div>

                <div className="grid gap-2">
                  <label
                    className="text-xs font-medium text-text-secondary"
                    htmlFor={`fee-${setting.formaPagamento}`}
                  >
                    Taxa (%)
                  </label>
                  <Input
                    id={`fee-${setting.formaPagamento}`}
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={draft[setting.formaPagamento] ?? ""}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        [setting.formaPagamento]: event.target.value
                      }))
                    }
                    disabled={isSaving}
                  />
                </div>

                <Button
                  type="button"
                  onClick={() => void handleSave(setting)}
                  disabled={isSaving}
                  className="w-full tablet:w-auto"
                >
                  {isSaving ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Save className="h-4 w-4" aria-hidden />
                  )}
                  <span>{isSaving ? "Salvando" : "Salvar"}</span>
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
