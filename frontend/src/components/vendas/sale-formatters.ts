const quantityFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 0
});

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short"
});

export function formatSaleQuantity(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? `${quantityFormatter.format(value)} un.`
    : "-";
}

export function formatSaleCurrency(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? currencyFormatter.format(value)
    : "-";
}

export function formatSaleDate(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  // Extract YYYY-MM-DD portion before constructing the Date to avoid UTC midnight
  // shifting the displayed day when the browser converts to local time (e.g. UTC-3).
  const datePart = value.slice(0, 10);
  const [year, month, day] = datePart.split("-").map(Number);

  if (!year || !month || !day) {
    return "-";
  }

  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return dateFormatter.format(date);
}

export function formatSaleProfit(value: number | null | undefined) {
  return formatSaleCurrency(value);
}

export function formatSaleTotal(value: number | null | undefined) {
  return formatSaleCurrency(value);
}
