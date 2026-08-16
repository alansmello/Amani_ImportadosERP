import {
  purchaseLossMotives,
  purchaseReturnMotives,
  type CreatePurchasePayload,
  type PurchaseActionDraft,
  type PurchaseDraft,
  type PurchaseLossDraft,
  type PurchaseLossMotive,
  type PurchaseRefundDraft,
  type PurchaseReturnDraft,
  type PurchaseReturnMotive,
  type PurchaseValidationError,
  type RegisterPurchaseLossPayload,
  type RegisterPurchaseReceiptPayload,
  type RegisterPurchaseRefundPayload,
  type RegisterPurchaseReturnPayload
} from "@/types/purchase";

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

export function createPurchaseDraftItemId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `purchase-item-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

export function createPurchaseDraftItem() {
  return {
    id: createPurchaseDraftItemId(),
    produtoId: "",
    quantidade: "",
    custoUnitario: "",
    desconto: "",
    acrescimo: ""
  };
}

export function createEmptyPurchaseDraft(): PurchaseDraft {
  return {
    fornecedorId: "",
    dataCompra: "",
    desconto: "",
    acrescimo: "",
    items: []
  };
}

export function hasPurchaseItemContent(item: PurchaseDraft["items"][number]) {
  return (
    item.produtoId.trim() !== "" ||
    item.quantidade.trim() !== "" ||
    item.custoUnitario.trim() !== "" ||
    item.desconto.trim() !== "" ||
    item.acrescimo.trim() !== ""
  );
}

function isValidLossMotive(value: string): value is PurchaseLossMotive {
  return purchaseLossMotives.some((motive) => motive === value);
}

function isValidReturnMotive(value: string): value is PurchaseReturnMotive {
  return purchaseReturnMotives.some((motive) => motive === value);
}

export function validatePurchaseDraft(
  draft: PurchaseDraft,
  products: ExistingReference[] = [],
  suppliers: ExistingReference[] = []
) {
  const errors: PurchaseValidationError[] = [];

  if (!draft.fornecedorId) {
    errors.push({
      field: "fornecedorId",
      message: "Selecione um fornecedor."
    });
  } else if (
    suppliers.length > 0 &&
    !hasReference(draft.fornecedorId, suppliers)
  ) {
    errors.push({
      field: "fornecedorId",
      message: "Fornecedor nao encontrado na lista carregada."
    });
  }

  if (!draft.dataCompra) {
    errors.push({
      field: "dataCompra",
      message: "Informe a data da compra."
    });
  }

  if (draft.items.length === 0) {
    errors.push({
      field: "items",
      message: "Adicione ao menos um item a compra."
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

  for (const item of draft.items) {
    errors.push(
      ...validatePurchaseItemDraft(item, products, draft.items, item.id)
    );
  }

  return errors;
}

export function validatePurchaseItemDraft(
  item: PurchaseDraft["items"][number],
  products: ExistingReference[] = [],
  existingItems: PurchaseDraft["items"] = [],
  editingItemId?: string | null
) {
  const errors: PurchaseValidationError[] = [];

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
  } else {
    const hasDuplicate = existingItems.some(
      (existingItem) =>
        existingItem.produtoId === item.produtoId &&
        existingItem.id !== editingItemId
    );

    if (hasDuplicate) {
      errors.push({
        field: "produtoId",
        itemId: item.id,
        message:
          "Este produto ja foi adicionado. Edite o item existente para alterar a compra."
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

  const custoUnitario = parseNumber(item.custoUnitario);
  if (!Number.isFinite(custoUnitario) || custoUnitario < 0) {
    errors.push({
      field: "custoUnitario",
      itemId: item.id,
      message: "Informe um custo unitario maior ou igual a zero."
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

export function buildCreatePurchasePayload(
  draft: PurchaseDraft
): CreatePurchasePayload {
  return {
    fornecedorId: draft.fornecedorId,
    dataCompra: new Date(draft.dataCompra).toISOString(),
    desconto: parseOptionalNonNegative(draft.desconto),
    acrescimo: parseOptionalNonNegative(draft.acrescimo),
    items: draft.items.map((item) => ({
      produtoId: item.produtoId,
      quantidade: parseNumber(item.quantidade),
      custoUnitario: parseNumber(item.custoUnitario),
      desconto: parseOptionalNonNegative(item.desconto),
      acrescimo: parseOptionalNonNegative(item.acrescimo)
    }))
  };
}

export function validateReceiptDraft(
  draft: PurchaseActionDraft,
  quantidadePendente?: number
) {
  const errors: PurchaseValidationError[] = [];
  const quantidade = parseNumber(draft.quantidade);

  if (
    !Number.isFinite(quantidade) ||
    quantidade <= 0 ||
    !Number.isInteger(quantidade)
  ) {
    errors.push({
      field: "quantidade",
      message: "Informe uma quantidade inteira maior que zero."
    });
  } else if (
    typeof quantidadePendente === "number" &&
    quantidade > quantidadePendente
  ) {
    errors.push({
      field: "quantidade",
      message: "A quantidade nao pode exceder a pendencia exibida."
    });
  }

  return errors;
}

export function buildReceiptPayload(
  draft: PurchaseActionDraft
): RegisterPurchaseReceiptPayload {
  return {
    quantidade: parseNumber(draft.quantidade),
    dataRecebimento: draft.data ? new Date(draft.data).toISOString() : null,
    observacao: draft.observacao.trim() || null
  };
}

export function validateLossDraft(
  draft: PurchaseLossDraft,
  quantidadePendente?: number
) {
  const errors: PurchaseValidationError[] = validateReceiptDraft(
    draft,
    quantidadePendente
  );

  if (!draft.motivo || !isValidLossMotive(draft.motivo)) {
    errors.push({
      field: "motivo",
      message: "Selecione Perda, Extravio ou Avaria."
    });
  }

  return errors;
}

export function buildLossPayload(
  draft: PurchaseLossDraft
): RegisterPurchaseLossPayload {
  if (!isValidLossMotive(draft.motivo)) {
    throw new Error("Motivo de perda invalido.");
  }

  return {
    quantidade: parseNumber(draft.quantidade),
    motivo: draft.motivo,
    dataPerda: draft.data ? new Date(draft.data).toISOString() : null,
    observacao: draft.observacao.trim() || null
  };
}

export function validateRefundDraft(
  draft: PurchaseRefundDraft,
  saldoReembolsavel?: number | null
) {
  const errors: PurchaseValidationError[] = [];
  const valor = parseNumber(draft.valor);

  if (!Number.isFinite(valor) || valor <= 0) {
    errors.push({
      field: "valor",
      message: "Informe um valor de reembolso maior que zero."
    });
  } else if (
    typeof saldoReembolsavel === "number" &&
    saldoReembolsavel >= 0 &&
    valor > saldoReembolsavel
  ) {
    errors.push({
      field: "valor",
      message: "O valor nao pode exceder o saldo reembolsavel exibido."
    });
  }

  return errors;
}

export function buildRefundPayload(
  draft: PurchaseRefundDraft,
  operacaoId: string
): RegisterPurchaseRefundPayload {
  return {
    valor: parseNumber(draft.valor),
    dataReembolso: draft.data ? new Date(draft.data).toISOString() : null,
    referenciaExterna: draft.referenciaExterna.trim() || null,
    observacao: draft.observacao.trim() || null,
    operacaoId
  };
}

export function validateReturnDraft(
  draft: PurchaseReturnDraft,
  quantidadePendente?: number
) {
  const errors: PurchaseValidationError[] = validateReceiptDraft(
    draft,
    quantidadePendente
  );

  if (!draft.motivo || !isValidReturnMotive(draft.motivo)) {
    errors.push({
      field: "motivo",
      message: "Selecione um motivo de devolucao."
    });
  }

  if (draft.motivo === "Outro" && !draft.observacao.trim()) {
    errors.push({
      field: "observacao",
      message: "Informe a justificativa quando o motivo for Outro."
    });
  }

  if (
    draft.momento === "DepoisDoRecebimento" &&
    !draft.compraItemRecebimentoId
  ) {
    errors.push({
      field: "compraItemRecebimentoId",
      message: "Selecione o recebimento que sera devolvido."
    });
  }

  return errors;
}

export function buildReturnPayload(
  draft: PurchaseReturnDraft,
  operacaoId: string
): RegisterPurchaseReturnPayload {
  if (!isValidReturnMotive(draft.motivo)) {
    throw new Error("Motivo de devolucao invalido.");
  }

  return {
    operacaoId,
    momento: draft.momento,
    compraItemRecebimentoId:
      draft.momento === "DepoisDoRecebimento"
        ? draft.compraItemRecebimentoId
        : null,
    quantidade: parseNumber(draft.quantidade),
    motivo: draft.motivo,
    dataDevolucao: draft.data ? new Date(draft.data).toISOString() : null,
    observacao: draft.observacao.trim() || null
  };
}

export function getPurchaseValidationMessage(
  errors: PurchaseValidationError[],
  field: string,
  itemId?: string
) {
  return errors.find(
    (error) => error.field === field && (!itemId || error.itemId === itemId)
  )?.message;
}
