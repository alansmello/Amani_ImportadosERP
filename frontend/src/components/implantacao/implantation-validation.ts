import type {
  ImplantationValidationError,
  InitialCashBalanceDraft,
  InitialInventoryItemDraft,
  InitialReceivableDraft
} from "@/types/implantation";

type ExistingReference = {
  id: string;
};

const MAX_RECEIVABLE_DRAFTS = 10;

function parseNumber(value: string) {
  const normalized = value.trim().replace(",", ".");
  return normalized === "" ? Number.NaN : Number(normalized);
}

function hasReference(id: string, references: ExistingReference[]) {
  return references.some((reference) => reference.id === id);
}

export function validateInitialInventoryDrafts(
  drafts: InitialInventoryItemDraft[],
  products: ExistingReference[]
): ImplantationValidationError[] {
  const errors: ImplantationValidationError[] = [];
  const selectedProducts = new Set<string>();
  const duplicatedProducts = new Set<string>();

  if (drafts.length === 0) {
    errors.push({
      field: "itens",
      message: "Adicione ao menos um produto ao inventario inicial."
    });
  }

  for (const draft of drafts) {
    if (!draft.produtoId) {
      errors.push({
        field: "produtoId",
        itemId: draft.id,
        message: "Selecione um produto."
      });
    } else if (!hasReference(draft.produtoId, products)) {
      errors.push({
        field: "produtoId",
        itemId: draft.id,
        message: "Produto nao encontrado na lista carregada."
      });
    }

    if (draft.produtoId) {
      if (selectedProducts.has(draft.produtoId)) {
        duplicatedProducts.add(draft.produtoId);
      }

      selectedProducts.add(draft.produtoId);
    }

    const quantidade = parseNumber(draft.quantidade);
    if (!Number.isFinite(quantidade) || quantidade <= 0) {
      errors.push({
        field: "quantidade",
        itemId: draft.id,
        message: "Informe uma quantidade maior que zero."
      });
    }

    const valorUnitario = draft.valorUnitario.trim()
      ? parseNumber(draft.valorUnitario)
      : null;
    if (valorUnitario !== null && (!Number.isFinite(valorUnitario) || valorUnitario < 0)) {
      errors.push({
        field: "valorUnitario",
        itemId: draft.id,
        message: "Informe um valor unitario valido ou deixe em branco."
      });
    }
  }

  if (duplicatedProducts.size > 0) {
    for (const draft of drafts) {
      if (duplicatedProducts.has(draft.produtoId)) {
        errors.push({
          field: "produtoId",
          itemId: draft.id,
          message: "Este produto ja foi adicionado ao lote."
        });
      }
    }
  }

  return errors;
}

export function validateInitialCashBalanceDraft(
  draft: InitialCashBalanceDraft
): ImplantationValidationError[] {
  const errors: ImplantationValidationError[] = [];
  const valor = parseNumber(draft.valor);

  if (!Number.isFinite(valor)) {
    errors.push({
      field: "valor",
      message: "Informe o saldo inicial de caixa."
    });
  }

  if (!draft.data) {
    errors.push({
      field: "data",
      message: "Informe a data do saldo inicial."
    });
  }

  return errors;
}

export function validateInitialReceivableDrafts(
  drafts: InitialReceivableDraft[],
  customers: ExistingReference[]
): ImplantationValidationError[] {
  const errors: ImplantationValidationError[] = [];

  if (drafts.length === 0) {
    errors.push({
      field: "recebiveis",
      message: "Adicione ao menos uma conta a receber inicial."
    });
  }

  if (drafts.length > MAX_RECEIVABLE_DRAFTS) {
    errors.push({
      field: "recebiveis",
      message: "Adicione no maximo 10 contas por lote."
    });
  }

  for (const draft of drafts) {
    if (!draft.clienteId) {
      errors.push({
        field: "clienteId",
        itemId: draft.id,
        message: "Selecione um cliente ativo."
      });
    } else if (!hasReference(draft.clienteId, customers)) {
      errors.push({
        field: "clienteId",
        itemId: draft.id,
        message: "Cliente nao encontrado na lista carregada."
      });
    }

    const valor = parseNumber(draft.valor);
    if (!Number.isFinite(valor) || valor <= 0) {
      errors.push({
        field: "valor",
        itemId: draft.id,
        message: "Informe um valor maior que zero."
      });
    }

    if (!draft.dataVencimento) {
      errors.push({
        field: "dataVencimento",
        itemId: draft.id,
        message: "Informe a data de vencimento."
      });
    }
  }

  return errors;
}

export function getValidationMessage(
  errors: ImplantationValidationError[],
  field: string,
  itemId?: string
) {
  return errors.find(
    (error) => error.field === field && (!itemId || error.itemId === itemId)
  )?.message;
}

