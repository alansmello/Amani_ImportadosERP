"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client";
import {
  dashboardService,
  isValidDashboardPeriod,
  normalizeDashboardPeriod,
  toDashboardPeriodQuery
} from "@/services/dashboard";
import type {
  DashboardPeriodFilter,
  DashboardPeriodQuery
} from "@/types/dashboard";

type DashboardQueryOptions = {
  enabled?: boolean;
};

type DashboardRankingsOptions = DashboardQueryOptions & {
  limiteRankings?: number;
};

type DashboardChartsOptions = DashboardQueryOptions & {
  tiposGraficos?: string[];
};

type DashboardAlertsOptions = DashboardQueryOptions & {
  tiposAlertas?: string[];
};

function stableList(values: string[] | undefined) {
  return values ? [...values].sort() : [];
}

export function useDashboardPeriodQuery(period: DashboardPeriodFilter) {
  return useMemo(() => {
    const isValid = isValidDashboardPeriod(period);
    const normalized = normalizeDashboardPeriod(period);
    const query = isValid ? toDashboardPeriodQuery(period) : {};

    return {
      isValid,
      normalized,
      query
    };
  }, [period]);
}

export const dashboardQueryKeys = {
  all: queryKeys.dashboard,
  section: (
    section: string,
    period: ReturnType<typeof normalizeDashboardPeriod>,
    extra: Record<string, unknown> = {}
  ) => [...queryKeys.dashboard, section, period, extra] as const,
  snapshot: () => [...queryKeys.dashboard, "financial-snapshot"] as const
};

function useDashboardSectionQuery(
  period: DashboardPeriodFilter,
  options: DashboardQueryOptions = {}
) {
  const periodQuery = useDashboardPeriodQuery(period);

  return {
    ...periodQuery,
    enabled: (options.enabled ?? true) && periodQuery.isValid
  };
}

export function useDashboardManagementSummary(
  period: DashboardPeriodFilter,
  options: DashboardQueryOptions = {}
) {
  const { query, normalized, enabled } = useDashboardSectionQuery(
    period,
    options
  );

  return useQuery({
    queryKey: dashboardQueryKeys.section("summary", normalized),
    queryFn: () => dashboardService.getManagementSummary(query),
    enabled
  });
}

export function useDashboardFinancialKpis(
  period: DashboardPeriodFilter,
  options: DashboardQueryOptions = {}
) {
  const { query, normalized, enabled } = useDashboardSectionQuery(
    period,
    options
  );

  return useQuery({
    queryKey: dashboardQueryKeys.section("financial-kpis", normalized),
    queryFn: () => dashboardService.getFinancialKpis(query),
    enabled
  });
}

export function useDashboardOperationalSummary(
  period: DashboardPeriodFilter,
  options: DashboardQueryOptions = {}
) {
  const { query, normalized, enabled } = useDashboardSectionQuery(
    period,
    options
  );

  return useQuery({
    queryKey: dashboardQueryKeys.section("operational", normalized),
    queryFn: () => dashboardService.getOperationalSummary(query),
    enabled
  });
}

export function useDashboardRankings(
  period: DashboardPeriodFilter,
  options: DashboardRankingsOptions = {}
) {
  const { query, normalized, enabled } = useDashboardSectionQuery(
    period,
    options
  );
  const finalQuery: DashboardPeriodQuery = {
    ...query,
    limiteRankings: options.limiteRankings
  };

  return useQuery({
    queryKey: dashboardQueryKeys.section("rankings", normalized, {
      limiteRankings: options.limiteRankings
    }),
    queryFn: () => dashboardService.getRankings(finalQuery),
    enabled
  });
}

export function useDashboardAlerts(
  period: DashboardPeriodFilter,
  options: DashboardAlertsOptions = {}
) {
  const { query, normalized, enabled } = useDashboardSectionQuery(
    period,
    options
  );
  const tiposAlertas = stableList(options.tiposAlertas);
  const finalQuery: DashboardPeriodQuery = {
    ...query,
    tiposAlertas
  };

  return useQuery({
    queryKey: dashboardQueryKeys.section("alerts", normalized, {
      tiposAlertas
    }),
    queryFn: () => dashboardService.getAlerts(finalQuery),
    enabled
  });
}

export function useDashboardCharts(
  period: DashboardPeriodFilter,
  options: DashboardChartsOptions = {}
) {
  const { query, normalized, enabled } = useDashboardSectionQuery(
    period,
    options
  );
  const tiposGraficos = stableList(options.tiposGraficos);
  const finalQuery: DashboardPeriodQuery = {
    ...query,
    tiposGraficos
  };

  return useQuery({
    queryKey: dashboardQueryKeys.section("charts", normalized, {
      tiposGraficos
    }),
    queryFn: () => dashboardService.getCharts(finalQuery),
    enabled
  });
}

export function useDashboardFinancialSnapshot(
  options: DashboardQueryOptions = {}
) {
  return useQuery({
    queryKey: dashboardQueryKeys.snapshot(),
    queryFn: () => dashboardService.getFinancialSnapshot(),
    enabled: options.enabled ?? true
  });
}
