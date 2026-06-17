import type { StockMovementType } from "@/types/stock";

export type StockBalanceVariant = "positive" | "zero" | "negative";

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

export function formatStockQuantity(value: number) {
  return `${quantityFormatter.format(value)} un.`;
}

export function formatStockCurrency(value: number | null | undefined) {
  return typeof value === "number" ? currencyFormatter.format(value) : "-";
}

export function formatStockDate(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  return dateFormatter.format(new Date(value));
}

export function formatMovementType(type: StockMovementType) {
  const normalized = type.trim();

  if (!normalized) {
    return "Movimentacao";
  }

  return normalized;
}

export function formatMovementOrigin(origin: string | null | undefined) {
  const normalized = origin?.trim();
  return normalized ? normalized : "Origem nao informada";
}

export function getStockBalanceVariant(value: number): StockBalanceVariant {
  if (value < 0) {
    return "negative";
  }

  if (value === 0) {
    return "zero";
  }

  return "positive";
}

export function getStockBalanceLabel(value: number) {
  const variant = getStockBalanceVariant(value);

  if (variant === "negative") {
    return "Inconsistencia";
  }

  if (variant === "zero") {
    return "Sem saldo";
  }

  return "Com saldo";
}
