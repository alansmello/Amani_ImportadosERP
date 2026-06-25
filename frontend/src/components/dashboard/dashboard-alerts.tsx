"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";

import {
  formatDashboardCurrency,
  formatDashboardDateTime,
  formatDashboardLabel,
  formatDashboardQuantity,
  formatDashboardSeverity
} from "@/components/dashboard/dashboard-formatters";
import { DashboardSectionState } from "@/components/dashboard/dashboard-section-state";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import type { DashboardAlert } from "@/types/dashboard";

type DashboardAlertsProps = {
  alerts?: DashboardAlert[];
  isLoading?: boolean;
  isError?: boolean;
  isStaleForPeriod?: boolean;
  onRetry?: () => void;
};

function severityVariant(severity: string) {
  const normalized = severity.toLowerCase();

  if (normalized.includes("critic") || normalized.includes("alt")) {
    return "danger";
  }

  if (normalized.includes("medi")) {
    return "warning";
  }

  return "info";
}

function formatAlertValue(alert: DashboardAlert, value: number) {
  const normalizedType = alert.tipoAlerta.toLowerCase();

  if (normalizedType.includes("estoquebaixo")) {
    return `${formatDashboardQuantity(value)} un.`;
  }

  if (
    normalizedType.includes("produtosemmovimentacao") ||
    normalizedType.includes("compraemtransitoantigo")
  ) {
    return `${formatDashboardQuantity(value)} dia(s)`;
  }

  if (normalizedType.includes("perdarecorrente")) {
    return `${formatDashboardQuantity(value)} ocorrencia(s)`;
  }

  return formatDashboardCurrency(value);
}

export function DashboardAlerts({
  alerts,
  isLoading = false,
  isError = false,
  isStaleForPeriod = false,
  onRetry
}: DashboardAlertsProps) {
  if (isLoading || isStaleForPeriod) {
    return (
      <DashboardSectionState
        state="loading"
        title="Carregando alertas"
        description="Aguardando alertas oficiais para o periodo selecionado."
      />
    );
  }

  if (isError) {
    return (
      <DashboardSectionState
        state="error"
        title="Nao foi possivel carregar alertas"
        description="A fonte oficial de alertas nao respondeu para este periodo."
        onAction={onRetry}
      />
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <DashboardSectionState
        state="empty"
        title="Nenhum alerta ativo"
        description="A API nao retornou alertas financeiros ou operacionais para o filtro aplicado."
        icon={<CheckCircle2 className="h-5 w-5" aria-hidden />}
      />
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-amani border border-border bg-surface-light text-warning">
              <AlertTriangle className="h-4 w-4" aria-hidden />
            </div>
            <CardTitle>Alertas operacionais</CardTitle>
          </div>
          <CardDescription className="mt-2">
            Severidade, motivo e valores retornados pela API.
          </CardDescription>
        </div>
        <Badge variant="warning">{alerts.length} alertas</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <article
            key={`${alert.tipoAlerta}-${alert.entidadeId}-${alert.dataReferencia}`}
            className="rounded-amani border border-border bg-surface-light p-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="break-words text-sm font-medium text-text-primary">
                  {alert.entidadeNome}
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  {formatDashboardLabel(alert.tipoAlerta)} ·{" "}
                  {formatDashboardLabel(alert.entidadeTipo)}
                </p>
              </div>
              <Badge variant={severityVariant(alert.severidade)}>
                {formatDashboardSeverity(alert.severidade)}
              </Badge>
            </div>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              {alert.motivo}
            </p>
            <div className="mt-3 grid gap-2 text-xs text-text-secondary tablet:grid-cols-3">
              <span>Atual: {formatAlertValue(alert, alert.valorAtual)}</span>
              <span>Limite: {formatAlertValue(alert, alert.limiteAplicado)}</span>
              <span>{formatDashboardDateTime(alert.dataReferencia)}</span>
            </div>
          </article>
        ))}
      </CardContent>
    </Card>
  );
}
