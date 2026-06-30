"use client";

import { PackageCheck } from "lucide-react";
import { useMemo, useState } from "react";

import { DashboardAlerts } from "@/components/dashboard/dashboard-alerts";
import { DashboardChartSection } from "@/components/dashboard/dashboard-chart-section";
import { DashboardKpiGrid } from "@/components/dashboard/dashboard-kpi-grid";
import { DashboardPatrimonialGrid } from "@/components/dashboard/dashboard-patrimonial-grid";
import {
  formatDashboardDate,
  formatDashboardQuantity
} from "@/components/dashboard/dashboard-formatters";
import { DashboardPeriodFilter } from "@/components/dashboard/dashboard-period-filter";
import { DashboardRankingList } from "@/components/dashboard/dashboard-ranking-list";
import { DashboardSectionState } from "@/components/dashboard/dashboard-section-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import {
  useDashboardAlerts,
  useDashboardCharts,
  useDashboardFinancialKpis,
  useDashboardOperationalSummary,
  useDashboardPeriodQuery,
  useDashboardRankings,
  useDashboardSectionPeriodMatch
} from "@/hooks/use-dashboard";
import type {
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

  const financialKpisQuery = useDashboardFinancialKpis(period);
  const operationalQuery = useDashboardOperationalSummary(period);
  const rankingsQuery = useDashboardRankings(period, { limiteRankings: 5 });
  const alertsQuery = useDashboardAlerts(period);
  const chartsQuery = useDashboardCharts(period);

  const financialKpis = useDashboardSectionPeriodMatch(financialKpisQuery, period);
  const operational = useDashboardSectionPeriodMatch(operationalQuery, period);
  const rankings = useDashboardSectionPeriodMatch(rankingsQuery, period);
  const alerts = useDashboardSectionPeriodMatch(alertsQuery, period);
  const charts = useDashboardSectionPeriodMatch(chartsQuery, period);

  const activePeriodSummary = useMemo(() => formatPeriodSummary(period), [period]);

  return (
    <main className="mx-auto w-full min-w-0 max-w-content space-y-6 overflow-x-hidden">
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

      <section
        aria-label="Indicadores financeiros do periodo"
        className="grid min-w-0 grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-3"
      >
        <DashboardKpiGrid
          data={financialKpis.data}
          isLoading={financialKpis.isLoading}
          isError={financialKpis.isError}
          isStaleForPeriod={financialKpis.isStaleForPeriod}
          onRetry={() => void financialKpis.refetch()}
        />
      </section>

      <section
        aria-label="Posicao patrimonial"
        className="grid min-w-0 grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-4"
      >
        <DashboardPatrimonialGrid
          data={financialKpis.data}
          isLoading={financialKpis.isLoading}
          isError={financialKpis.isError}
          isStaleForPeriod={financialKpis.isStaleForPeriod}
          onRetry={() => void financialKpis.refetch()}
        />
      </section>

      <section
        aria-label="Resumo operacional"
        className="grid min-w-0 grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-4"
      >
        <SourceStatusCard
          title="Operacional"
          description="Resumo operacional filtrado pela API gerencial."
          icon={PackageCheck}
          countLabel="vendas no periodo"
          count={operational.data?.quantidadeVendas}
          isLoading={operational.isLoading}
          isError={operational.isError}
          isStaleForPeriod={operational.isStaleForPeriod}
          onRetry={() => void operational.refetch()}
        />
      </section>

      <section aria-label="Resumo de alertas" className="min-w-0">
        <DashboardAlerts
          resumo={alerts.data?.resumo}
          isLoading={alerts.isLoading}
          isError={alerts.isError}
          isStaleForPeriod={alerts.isStaleForPeriod}
          onRetry={() => void alerts.refetch()}
        />
      </section>

      <section aria-label="Rankings gerenciais" className="min-w-0">
        <DashboardRankingList
          rankings={rankings.data?.rankings}
          notices={rankings.data?.avisos}
          isLoading={rankings.isLoading}
          isError={rankings.isError}
          isStaleForPeriod={rankings.isStaleForPeriod}
          onRetry={() => void rankings.refetch()}
        />
      </section>

      <section aria-label="Graficos gerenciais" className="min-w-0">
        <DashboardChartSection
          series={charts.data?.graficos}
          notices={charts.data?.avisos}
          isLoading={charts.isLoading}
          isError={charts.isError}
          isStaleForPeriod={charts.isStaleForPeriod}
          onRetry={() => void charts.refetch()}
        />
      </section>
    </main>
  );
}
