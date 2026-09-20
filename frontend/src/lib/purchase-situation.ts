export function shouldHidePersistedTransitBadge(purchase: {
  status?: string | null;
  possuiPendenciaVigente?: boolean | null;
}): boolean {
  return purchase.possuiPendenciaVigente === false && purchase.status === "EmTransito";
}

export function matchesComprasStatusFilter(
  purchase: {
    status?: string | null;
    possuiPendenciaVigente?: boolean | null;
  },
  status?: string
): boolean {
  if (!status) {
    return true;
  }

  if (status === "EmTransito") {
    return purchase.possuiPendenciaVigente === true;
  }

  return purchase.status === status;
}

export function getReturnLogisticsStatusLabel(
  status?: string | null,
  description?: string | null
) {
  const labels: Record<string, string> = {
    SemDevolucao: "Sem devolucao",
    ParcialmenteDevolvida: "Parcialmente devolvida",
    Devolvida: "Devolvida",
    DevolvidaAntesDoRecebimento: "Devolvida antes do recebimento",
    ParcialmenteCompensada: "Parcialmente compensada",
    DevolucaoCompensada: "Devolucao compensada"
  };

  return description || (status ? labels[status] ?? status : "Sem devolucao");
}

export function getReturnLogisticsStatusVariant(status?: string | null) {
  if (
    status === "Devolvida" ||
    status === "ParcialmenteDevolvida" ||
    status === "DevolvidaAntesDoRecebimento"
  ) {
    return "warning" as const;
  }

  if (status === "ParcialmenteCompensada") {
    return "info" as const;
  }

  if (status === "DevolucaoCompensada") {
    return "success" as const;
  }

  return "neutral" as const;
}
