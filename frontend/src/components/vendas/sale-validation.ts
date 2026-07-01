import type {
  CreateSalePayload,
  SaleDraft,
  SaleItemDraft,
  SaleValidationError
} from "@/types/sale";

type ExistingReference = {
  id: string;
  apresentacoes?: Array<{ id: string; ativo: boolean; permiteVenda: boolean }>;
};

const DEFAULT_ADJUSTMENT = 0;

function parseNumber(value: string) {
  const normalized = value.trim().replace(",", ".");
  return normalized === "" ? Number.NaN : Number(normalized);
}

function parseOptionalNonNegative(value: string) {
  if (!value.trim()) {
    return DEFAULT_ADJUSTMENT;
  }

  return parseNumber(value);
}

function hasReference(id: string, references: ExistingReference[]) {
  return references.some((reference) => reference.id === id);
}

export function createDraftItemId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `sale-item-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

export function createEmptySaleItemDraft(): SaleItemDraft {
  return {
    id: createDraftItemId(),
    produtoId: "",
    produtoApresentacaoId: "",
    quantidade: "1",
    precoUnitario: "",
    desconto: "",
    acrescimo: ""
  };
}

export function createEmptySaleDraft(): SaleDraft {
  return {
    clienteId: "",
    dataVenda: "",
    desconto: "",
    acrescimo: "",
    items: []
  };
}

/**
 * Retorna os itens as-is, sem consolidar quantidades de itens com mesmo produto.
 * Conforme F022, produtos duplicados são bloqueados no compositor e não mesclados.
 */
export function consolidateSaleItems(items: SaleItemDraft[]) {
  return items;
}

export function hasDuplicateProduct(
  produtoId: string,
  existingItems: SaleItemDraft[]
) {
  return existingItems.some((existing) => existing.produtoId === produtoId);
}

export function validateSaleItemDraft(
  item: SaleItemDraft,
  products: ExistingReference[] = [],
  existingItems: SaleItemDraft[] = [],
  isEditing: boolean = false
): SaleValidationError[] {
  const errors: SaleValidationError[] = [];

  if (!item.produtoId) {
    errors.push({
      field: "produtoId",
      itemId: item.id,
      message: "Selecione um produto."
    });
  } else if (products.length > 0 && !hasReference(item.produtoId, products)) {
    errors.push({
      field: "produtoId",
      itemId: item.id,
      message: "Produto nao encontrado na lista carregada."
    });
  } else if (!isEditing && hasDuplicateProduct(item.produtoId, existingItems)) {
    errors.push({
      field: "produtoId",
      itemId: item.id,
      message: "Este produto ja foi adicionado. Edite o item na lista do resumo se desejar alterar."
    });
  }

  const product = products.find((reference) => reference.id === item.produtoId);
  const configuredPresentations = product?.apresentacoes ?? [];
  if (configuredPresentations.length > 0) {
    const selectedPresentation = configuredPresentations.find(
      (presentation) => presentation.id === item.produtoApresentacaoId
    );
    if (!item.produtoApresentacaoId) {
      errors.push({
        field: "produtoApresentacaoId",
        itemId: item.id,
        message: "Selecione uma apresentacao comercial."
      });
    } else if (!selectedPresentation?.ativo || !selectedPresentation.permiteVenda) {
      errors.push({
        field: "produtoApresentacaoId",
        itemId: item.id,
        message: "Apresentacao indisponivel para venda."
      });
    }
  }

  const quantidade = parseNumber(item.quantidade);
  if (
    !Number.isFinite(quantidade) ||
    quantidade <= 0 ||
    !Number.isInteger(quantidade)
  ) {
    errors.push({
      field: "quantidade",
      itemId: item.id,
      message: "Informe uma quantidade inteira maior que zero."
    });
  }

  const precoUnitario = parseNumber(item.precoUnitario);
  if (!Number.isFinite(precoUnitario) || precoUnitario < 0) {
    errors.push({
      field: "precoUnitario",
      itemId: item.id,
      message: "Informe um preco unitario maior ou igual a zero."
    });
  }

  const itemDesconto = parseOptionalNonNegative(item.desconto);
  if (!Number.isFinite(itemDesconto) || itemDesconto < 0) {
    errors.push({
      field: "desconto",
      itemId: item.id,
      message: "Informe um desconto valido ou deixe em branco."
    });
  }

  const itemAcrescimo = parseOptionalNonNegative(item.acrescimo);
  if (!Number.isFinite(itemAcrescimo) || itemAcrescimo < 0) {
    errors.push({
      field: "acrescimo",
      itemId: item.id,
      message: "Informe um acrescimo valido ou deixe em branco."
    });
  }

  return errors;
}

export function validateSaleDraft(
  draft: SaleDraft,
  products: ExistingReference[] = [],
  clients: ExistingReference[] = []
) {
  const errors: SaleValidationError[] = [];

  if (!draft.clienteId) {
    errors.push({
      field: "clienteId",
      message: "Selecione um cliente."
    });
  } else if (clients.length > 0 && !hasReference(draft.clienteId, clients)) {
    errors.push({
      field: "clienteId",
      message: "Cliente nao encontrado na lista carregada."
    });
  }

  if (draft.items.length === 0) {
    errors.push({
      field: "items",
      message: "Adicione ao menos um item a venda."
    });
  }

  const desconto = parseOptionalNonNegative(draft.desconto);
  if (!Number.isFinite(desconto) || desconto < 0) {
    errors.push({
      field: "desconto",
      message: "Informe um desconto valido ou deixe em branco."
    });
  }

  const acrescimo = parseOptionalNonNegative(draft.acrescimo);
  if (!Number.isFinite(acrescimo) || acrescimo < 0) {
    errors.push({
      field: "acrescimo",
      message: "Informe um acrescimo valido ou deixe em branco."
    });
  }

  // Valida cada item existente no rascunho
  for (const item of draft.items) {
    const itemErrors = validateSaleItemDraft(item, products, [], true);
    errors.push(...itemErrors);
  }

  return errors;
}

export function buildCreateSalePayload(draft: SaleDraft): CreateSalePayload {
  return {
    clienteId: draft.clienteId,
    dataVenda: draft.dataVenda ? new Date(draft.dataVenda).toISOString() : null,
    desconto: parseOptionalNonNegative(draft.desconto),
    acrescimo: parseOptionalNonNegative(draft.acrescimo),
    items: draft.items.map((item) => ({
      produtoId: item.produtoId,
      produtoApresentacaoId: item.produtoApresentacaoId || null,
      quantidade: parseNumber(item.quantidade),
      precoUnitario: parseNumber(item.precoUnitario),
      desconto: parseOptionalNonNegative(item.desconto),
      acrescimo: parseOptionalNonNegative(item.acrescimo)
    }))
  };
}

export function attachSalePaymentPayload(
  payload: CreateSalePayload,
  payment: Pick<CreateSalePayload, "formaPagamento" | "percentualTaxaOverride">
): CreateSalePayload {
  if (!payment.formaPagamento) {
    throw new Error("Forma de pagamento obrigatoria.");
  }

  return {
    ...payload,
    formaPagamento: payment.formaPagamento,
    percentualTaxaOverride: payment.percentualTaxaOverride ?? null
  };
}

export function getSaleValidationMessage(
  errors: SaleValidationError[],
  field: string,
  itemId?: string
) {
  return errors.find(
    (error) => error.field === field && (!itemId || error.itemId === itemId)
  )?.message;
}
