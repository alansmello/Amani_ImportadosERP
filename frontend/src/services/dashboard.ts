import { apiClient } from "@/services/api-client";
import type {
  DashboardAlerts,
  DashboardCharts,
  DashboardFinancialKpis,
  DashboardFinancialSnapshot,
  DashboardManagementSummary,
  DashboardOperationalSummary,
  DashboardPeriodFilter,
  DashboardPeriodQuery,
  DashboardRankings
} from "@/types/dashboard";

const DASHBOARD_MANAGEMENT_PATH = "/api/dashboard-gerencial";
const DASHBOARD_FINANCIAL_PATH = "/api/dashboard-financeiro";

export function isValidDashboardPeriod(period: DashboardPeriodFilter) {
  if (period.mode === "month") {
    return (
      Number.isInteger(period.month) &&
      period.month >= 1 &&
      period.month <= 12 &&
      Number.isInteger(period.year)
    );
  }

  if (period.mode === "year") {
    return Number.isInteger(period.year);
  }

  return Boolean(
    period.startDate &&
      period.endDate &&
      Date.parse(period.startDate) <= Date.parse(period.endDate)
  );
}

export function normalizeDashboardPeriod(period: DashboardPeriodFilter) {
  if (period.mode === "month") {
    return {
      mode: period.mode,
      month: period.month,
      year: period.year
    } as const;
  }

  if (period.mode === "year") {
    return {
      mode: period.mode,
      year: period.year
    } as const;
  }

  return {
    mode: period.mode,
    startDate: period.startDate,
    endDate: period.endDate
  } as const;
}

export function toDashboardPeriodQuery(
  period: DashboardPeriodFilter
): DashboardPeriodQuery {
  if (period.mode === "month") {
    return {
      mes: period.month,
      ano: period.year
    };
  }

  if (period.mode === "year") {
    return {
      ano: period.year
    };
  }

  return {
    dataInicial: period.startDate,
    dataFinal: period.endDate
  };
}

export function buildDashboardQueryString(query: DashboardPeriodQuery = {}) {
  const params = new URLSearchParams();

  if (query.mes !== undefined) {
    params.set("mes", String(query.mes));
  }

  if (query.ano !== undefined) {
    params.set("ano", String(query.ano));
  }

  if (query.dataInicial) {
    params.set("dataInicial", query.dataInicial);
  }

  if (query.dataFinal) {
    params.set("dataFinal", query.dataFinal);
  }

  if (query.limiteRankings !== undefined) {
    params.set("limiteRankings", String(query.limiteRankings));
  }

  query.tiposGraficos?.forEach((tipo) => {
    params.append("tiposGraficos", tipo);
  });

  query.tiposAlertas?.forEach((tipo) => {
    params.append("tiposAlertas", tipo);
  });

  return params.toString();
}

function withQuery(path: string, query: DashboardPeriodQuery = {}) {
  const queryString = buildDashboardQueryString(query);
  return queryString ? `${path}?${queryString}` : path;
}

export const dashboardService = {
  getManagementSummary(query: DashboardPeriodQuery = {}) {
    return apiClient<DashboardManagementSummary>(
      withQuery(DASHBOARD_MANAGEMENT_PATH, query)
    );
  },

  getFinancialKpis(query: DashboardPeriodQuery = {}) {
    return apiClient<DashboardFinancialKpis>(
      withQuery(`${DASHBOARD_MANAGEMENT_PATH}/financeiro`, query)
    );
  },

  getOperationalSummary(query: DashboardPeriodQuery = {}) {
    return apiClient<DashboardOperationalSummary>(
      withQuery(`${DASHBOARD_MANAGEMENT_PATH}/operacional`, query)
    );
  },

  getRankings(query: DashboardPeriodQuery = {}) {
    return apiClient<DashboardRankings>(
      withQuery(`${DASHBOARD_MANAGEMENT_PATH}/rankings`, query)
    );
  },

  getAlerts(query: DashboardPeriodQuery = {}) {
    return apiClient<DashboardAlerts>(
      withQuery(`${DASHBOARD_MANAGEMENT_PATH}/alertas`, query)
    );
  },

  getCharts(query: DashboardPeriodQuery = {}) {
    return apiClient<DashboardCharts>(
      withQuery(`${DASHBOARD_MANAGEMENT_PATH}/graficos`, query)
    );
  },

  getFinancialSnapshot() {
    return apiClient<DashboardFinancialSnapshot>(DASHBOARD_FINANCIAL_PATH);
  }
};
