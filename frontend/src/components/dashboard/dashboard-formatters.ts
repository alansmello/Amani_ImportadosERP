const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

const quantityFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 2
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric"
});

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit"
});

const severityLabels: Record<string, string> = {
  baixa: "Baixa",
  baixo: "Baixa",
  media: "Media",
  medio: "Media",
  alta: "Alta",
  alto: "Alta",
  critica: "Critica",
  critico: "Critica"
};

export const DASHBOARD_UNAVAILABLE_LABEL = "Indisponível";

export const DASHBOARD_EMPTY_PERIOD_MESSAGE = "Sem dados no periodo";

export const DASHBOARD_EMPTY_CHART_MESSAGE =
  "Nao ha movimentacoes suficientes para gerar este grafico.";

export function isDashboardValueMissing(
  value: number | null | undefined
): value is null | undefined {
  return value === null || value === undefined;
}

export function formatDashboardNullableCurrency(value: number | null | undefined) {
  if (isDashboardValueMissing(value)) {
    return DASHBOARD_UNAVAILABLE_LABEL;
  }

  return currencyFormatter.format(value);
}

export function formatDashboardNullableQuantity(value: number | null | undefined) {
  if (isDashboardValueMissing(value)) {
    return DASHBOARD_UNAVAILABLE_LABEL;
  }

  return quantityFormatter.format(value);
}

export function formatDashboardCurrency(value: number | null | undefined) {
  return formatDashboardNullableCurrency(value);
}

export function formatDashboardQuantity(value: number | null | undefined) {
  return formatDashboardNullableQuantity(value);
}

export function formatDashboardDate(value: string | null | undefined) {
  if (!value) {
    return DASHBOARD_UNAVAILABLE_LABEL;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

export function formatDashboardDateTime(value: string | null | undefined) {
  if (!value) {
    return DASHBOARD_UNAVAILABLE_LABEL;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateTimeFormatter.format(date);
}

export function formatDashboardSeverity(value: string | null | undefined) {
  if (!value) {
    return DASHBOARD_UNAVAILABLE_LABEL;
  }

  return severityLabels[value.toLowerCase()] ?? formatDashboardLabel(value);
}

export function formatDashboardLabel(value: string | null | undefined) {
  if (!value) {
    return DASHBOARD_UNAVAILABLE_LABEL;
  }

  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^./, (firstLetter) => firstLetter.toUpperCase());
}
