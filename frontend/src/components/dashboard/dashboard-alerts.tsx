"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";

import {
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
import type { DashboardAlertsSummary } from "@/types/dashboard";

type DashboardAlertsProps = {
  resumo?: DashboardAlertsSummary | null;
  isLoading?: boolean;
  isError?: boolean;
  isStaleForPeriod?: boolean;
  onRetry?: () => void;
};

function GroupList({
  title,
  items,
  formatLabel
}: {
  title: string;
  items: DashboardAlertsSummary["porSeveridade"];
  formatLabel?: (value: string) => string;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-w-0">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
        {title}
      </h3>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li
            key={item.chave}
            className="flex items-center justify-between gap-3 rounded-amani border border-border bg-surface-light px-3 py-2"
          >
            <span className="min-w-0 break-words text-sm text-text-primary">
              {formatLabel ? formatLabel(item.chave) : formatDashboardLabel(item.chave)}
            </span>
            <Badge variant="neutral">
              {formatDashboardQuantity(item.quantidade)}
            </Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DashboardAlerts({
  resumo,
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
        description="Aguardando resumo de alertas para o periodo selecionado."
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

  if (!resumo || resumo.total === 0) {
    return (
      <DashboardSectionState
        state="empty"
        title="Nenhum alerta ativo"
        description="Nenhum alerta financeiro ou operacional foi contabilizado para o filtro aplicado."
        icon={<CheckCircle2 className="h-5 w-5" aria-hidden />}
      />
    );
  }

  return (
    <Card className="min-w-0">
      <CardHeader className="flex flex-col gap-4 space-y-0 tablet:flex-row tablet:items-start tablet:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-amani border border-border bg-surface-light text-warning">
              <AlertTriangle className="h-4 w-4" aria-hidden />
            </div>
            <CardTitle>Resumo de alertas</CardTitle>
          </div>
          <CardDescription className="mt-2">
            Total e agrupamentos por severidade e tipo para leitura gerencial rapida.
          </CardDescription>
        </div>
        <Badge variant="warning" className="self-start">
          {formatDashboardQuantity(resumo.total)} alertas
        </Badge>
      </CardHeader>
      <CardContent className="grid min-w-0 gap-6 tablet:grid-cols-2">
        <GroupList
          title="Por severidade"
          items={resumo.porSeveridade}
          formatLabel={formatDashboardSeverity}
        />
        <GroupList title="Por tipo" items={resumo.porTipo} />
      </CardContent>
    </Card>
  );
}
