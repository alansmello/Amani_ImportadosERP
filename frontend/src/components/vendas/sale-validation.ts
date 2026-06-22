import type {
  CreateSalePayload,
  SaleDraft,
  SaleItemDraft,
  SaleValidationError
} from "@/types/sale";

type ExistingReference = {
  id: string;
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

function createDraftItemId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `sale-item-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

function sumNumericText(current: string, addition: string) {
  const currentValue = parseNumber(current);
  const additionValue = parseNumber(addition);

  if (!Number.isFinite(currentValue)) {
    return addition;
  }

  if (!Number.isFinite(additionValue)) {
    return current;
  }

  return String(currentValue + additionValue);
}

export function createEmptySaleItemDraft(): SaleItemDraft {
  return {
    id: createDraftItemId(),
    produtoId: "",
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
    items: [createEmptySaleItemDraft()]
  };
}

export function consolidateSaleItems(items: SaleItemDraft[]) {
  const consolidated = new Map<string, SaleItemDraft>();
  const result: SaleItemDraft[] = [];

  for (const item of items) {
    const itemCopy = { ...item };

    if (!item.produtoId) {
      result.push(itemCopy);
      continue;
    }

    const existing = consolidated.get(item.produtoId);

    if (!existing) {
      consolidated.set(item.produtoId, itemCopy);
      result.push(itemCopy);
      continue;
    }

    existing.quantidade = sumNumericText(
      existing.quantidade,
      itemCopy.quantidade
    );
  }

  return result;
}

export function validateSaleDraft(
  draft: SaleDraft,
  products: ExistingReference[] = [],
  clients: ExistingReference[] = []
) {
  const errors: SaleValidationError[] = [];
  const consolidatedItems = consolidateSaleItems(draft.items);

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

  if (consolidatedItems.length === 0) {
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

  for (const item of consolidatedItems) {
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
  }

  return errors;
}

export function buildCreateSalePayload(draft: SaleDraft): CreateSalePayload {
  return {
    clienteId: draft.clienteId,
    dataVenda: draft.dataVenda ? new Date(draft.dataVenda).toISOString() : null,
    desconto: parseOptionalNonNegative(draft.desconto),
    acrescimo: parseOptionalNonNegative(draft.acrescimo),
    items: consolidateSaleItems(draft.items).map((item) => ({
      produtoId: item.produtoId,
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
