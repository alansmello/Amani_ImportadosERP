"use client";

import { BarChart3, Bell, ListOrdered, PackageCheck } from "lucide-react";
import { useMemo, useState } from "react";

import { DashboardKpiGrid } from "@/components/dashboard/dashboard-kpi-grid";
import {
  formatDashboardDate,
  formatDashboardQuantity
} from "@/components/dashboard/dashboard-formatters";
import { DashboardPeriodFilter } from "@/components/dashboard/dashboard-period-filter";
import { DashboardSectionState } from "@/components/dashboard/dashboard-section-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import {
  useDashboardAlerts,
  useDashboardCharts,
  useDashboardFinancialKpis,
  useDashboardOperationalSummary,
  useDashboardPeriodQuery,
  useDashboardRankings
} from "@/hooks/use-dashboard";
import type {
  DashboardAppliedFilter,
  DashboardPeriodFilter as DashboardPeriodFilterType
} from "@/types/dashboard";

function getCurrentMonthPeriod(): DashboardPeriodFilterType {
  const now = new Date();

  return {
    mode: "month",
    month: now.getMonth() + 1,
    year: now.getFullYear()
  };
}

function formatPeriodSummary(period: DashboardPeriodFilterType) {
  if (period.mode === "month") {
    const date = new Date(period.year, period.month - 1, 1);

    return new Intl.DateTimeFormat("pt-BR", {
      month: "long",
      year: "numeric"
    }).format(date);
  }

  if (period.mode === "year") {
    return String(period.year);
  }

  return `${formatDashboardDate(period.startDate)} ate ${formatDashboardDate(
    period.endDate
  )}`;
}

function appliedFilterMatchesPeriod(
  applied: DashboardAppliedFilter | undefined,
  period: DashboardPeriodFilterType
) {
  if (!applied) {
    return false;
  }

  if (period.mode === "month") {
    return applied.mes === period.month && applied.ano === period.year;
  }

  if (period.mode === "year") {
    return applied.ano === period.year && applied.mes == null;
  }

  return (
    applied.dataInicial.slice(0, 10) === period.startDate &&
    applied.dataFinal.slice(0, 10) === period.endDate
  );
}

type SourceStatusCardProps = {
  title: string;
  description: string;
  icon: typeof PackageCheck;
  countLabel: string;
  count?: number;
  isLoading: boolean;
  isError: boolean;
  isStaleForPeriod: boolean;
  onRetry: () => void;
};

function SourceStatusCard({
  title,
  description,
  icon,
  countLabel,
  count,
  isLoading,
  isError,
  isStaleForPeriod,
  onRetry
}: SourceStatusCardProps) {
  const Icon = icon;

  if (isLoading || isStaleForPeriod) {
    return (
      <DashboardSectionState
        state="loading"
        title={title}
        description="Atualizando esta fonte para o periodo aplicado."
      />
    );
  }

  if (isError) {
    return (
      <DashboardSectionState
        state="error"
        title={title}
        description="Nao foi possivel carregar esta fonte do dashboard."
        onAction={onRetry}
      />
    );
  }

  return (
    <section className="rounded-amani border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-amani border border-border bg-surface-light text-primary">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <Badge variant={count && count > 0 ? "success" : "neutral"}>
          Fonte oficial
        </Badge>
      </div>
      <div className="mt-4 min-w-0">
        <h2 className="text-base font-semibold text-text-primary">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          {description}
        </p>
        <p className="mt-4 break-words text-2xl font-semibold text-text-primary">
          {count === undefined ? "Carregado" : formatDashboardQuantity(count)}
        </p>
        <p className="mt-1 text-sm text-text-secondary">{countLabel}</p>
      </div>
    </section>
  );
}

export function DashboardHome() {
  const [period, setPeriod] = useState<DashboardPeriodFilterType>(() =>
    getCurrentMonthPeriod()
  );
  const periodQuery = useDashboardPeriodQuery(period);

  const financialKpis = useDashboardFinancialKpis(period);
  const operational = useDashboardOperationalSummary(period);
  const rankings = useDashboardRankings(period, { limiteRankings: 5 });
  const alerts = useDashboardAlerts(period);
  const charts = useDashboardCharts(period);

  const activePeriodSummary = useMemo(() => formatPeriodSummary(period), [period]);

  const kpisMatch = appliedFilterMatchesPeriod(
    financialKpis.data?.filtrosAplicados,
    period
  );
  const operationalMatch = appliedFilterMatchesPeriod(
    operational.data?.filtrosAplicados,
    period
  );
  const rankingsMatch = appliedFilterMatchesPeriod(
    rankings.data?.filtrosAplicados,
    period
  );
  const alertsMatch = appliedFilterMatchesPeriod(
    alerts.data?.filtrosAplicados,
    period
  );
  const chartsMatch = appliedFilterMatchesPeriod(
    charts.data?.filtrosAplicados,
    period
  );

  return (
    <main className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Resumo gerencial e financeiro com dados oficiais do backend."
        actions={<Badge variant="accent">{activePeriodSummary}</Badge>}
      />

      <DashboardPeriodFilter value={period} onApply={setPeriod} />

      {!periodQuery.isValid ? (
        <DashboardSectionState
          state="error"
          title="Periodo invalido"
          description="Ajuste o filtro para atualizar o dashboard."
        />
      ) : null}

      <section className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-4">
        <DashboardKpiGrid
          data={kpisMatch ? financialKpis.data : undefined}
          isLoading={financialKpis.isLoading}
          isError={financialKpis.isError}
          isStaleForPeriod={Boolean(financialKpis.data && !kpisMatch)}
          onRetry={() => void financialKpis.refetch()}
        />
      </section>

      <section className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-4">
        <SourceStatusCard
          title="Operacional"
          description="Resumo operacional filtrado pela API gerencial."
          icon={PackageCheck}
          countLabel="vendas no periodo"
          count={operationalMatch ? operational.data?.quantidadeVendas : undefined}
          isLoading={operational.isLoading}
          isError={operational.isError}
          isStaleForPeriod={Boolean(operational.data && !operationalMatch)}
          onRetry={() => void operational.refetch()}
        />
        <SourceStatusCard
          title="Rankings"
          description="Consulta oficial preparada para os rankings da proxima etapa."
          icon={ListOrdered}
          countLabel="itens retornados"
          count={rankingsMatch ? rankings.data?.rankings.length : undefined}
          isLoading={rankings.isLoading}
          isError={rankings.isError}
          isStaleForPeriod={Boolean(rankings.data && !rankingsMatch)}
          onRetry={() => void rankings.refetch()}
        />
        <SourceStatusCard
          title="Alertas"
          description="Fonte de alertas carregada para o periodo aplicado."
          icon={Bell}
          countLabel="alertas retornados"
          count={alertsMatch ? alerts.data?.alertas.length : undefined}
          isLoading={alerts.isLoading}
          isError={alerts.isError}
          isStaleForPeriod={Boolean(alerts.data && !alertsMatch)}
          onRetry={() => void alerts.refetch()}
        />
        <SourceStatusCard
          title="Graficos"
          description="Series oficiais consultadas sem recalcular pontos no cliente."
          icon={BarChart3}
          countLabel="series retornadas"
          count={chartsMatch ? charts.data?.graficos.length : undefined}
          isLoading={charts.isLoading}
          isError={charts.isError}
          isStaleForPeriod={Boolean(charts.data && !chartsMatch)}
          onRetry={() => void charts.refetch()}
        />
      </section>
    </main>
  );
}
