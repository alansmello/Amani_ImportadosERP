const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short"
});

export function formatReceivableCurrency(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? currencyFormatter.format(value)
    : "-";
}

export function formatReceivableDate(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  // Extract YYYY-MM-DD portion before constructing the Date to avoid UTC midnight
  // shifting the displayed day when the browser converts to local time (BF003).
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

export function formatReceivableStatus(status: string | null | undefined) {
  if (!status) return "-";
  return status;
}

export function formatReceivableOrigin(origem: string | null | undefined) {
  if (!origem) return "-";

  const labels: Record<string, string> = {
    Venda: "Venda",
    Manual: "Manual",
    SaldoInicial: "Saldo Inicial",
    ImplantacaoInicial: "Implantacao Inicial"
  };

  return labels[origem] ?? origem;
}
