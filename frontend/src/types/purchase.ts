export const purchaseLossMotives = ["Perda", "Extravio", "Avaria"] as const;

export type PurchaseLossMotive = (typeof purchaseLossMotives)[number];

export type PurchaseStatus = string;

export type PurchaseFilters = {
  dataInicio?: string;
  dataFim?: string;
  fornecedorId?: string;
  status?: PurchaseStatus;
};

export type PurchaseListItem = {
  id: string;
  fornecedorId: string;
  dataCompra: string;
  status: PurchaseStatus;
  totalCompra: number;
};

export type PurchaseInTransitItem = {
  itemId: string;
  produtoId: string;
  quantidadeComprada: number;
  quantidadeRecebida: number;
  quantidadePerdida: number;
  quantidadePendente: number;
};

export type PurchaseInTransit = {
  compraId: string;
  fornecedorId: string;
  dataCompra: string;
  status: PurchaseStatus;
  itens: PurchaseInTransitItem[];
};

export type PendingPurchaseProduct = {
  compraId: string;
  itemId: string;
  produtoId: string;
  fornecedorId: string;
  dataCompra: string;
  statusCompra: PurchaseStatus;
  quantidadeComprada: number;
  quantidadeRecebida: number;
  quantidadePerdida: number;
  quantidadePendente: number;
};

export type PurchaseItem = {
  id: string;
  produtoId: string;
  quantidade: number;
  quantidadeComprada: number;
  quantidadeRecebida: number;
  quantidadePerdida: number;
  quantidadePendente: number;
  custoUnitario: number;
  desconto: number;
  acrescimo: number;
  valorTotal: number;
};

export type Purchase = {
  id: string;
  fornecedorId: string;
  dataCompra: string;
  status: PurchaseStatus;
  desconto: number;
  acrescimo: number;
  total: number;
  items: PurchaseItem[];
};

export type CreatePurchaseItemPayload = {
  produtoId: string;
  quantidade: number;
  custoUnitario: number;
  desconto: number;
  acrescimo: number;
};

export type CreatePurchasePayload = {
  fornecedorId: string;
  dataCompra: string;
  desconto: number;
  acrescimo: number;
  items: CreatePurchaseItemPayload[];
};

export type CreatePurchaseResponse = {
  id: string;
};

export type RegisterPurchaseReceiptPayload = {
  quantidade: number;
  dataRecebimento?: string | null;
  observacao?: string | null;
};

export type PurchaseReceipt = {
  id: string;
  compraId: string;
  itemId: string;
  produtoId: string;
  quantidade: number;
  valorUnitario: number;
  origem: string;
  dataRecebimento: string;
  estoqueMovimentacaoId: string | null;
  observacao: string | null;
};

export type RegisterPurchaseLossPayload = {
  quantidade: number;
  motivo: PurchaseLossMotive;
  dataPerda?: string | null;
  observacao?: string | null;
};

export type PurchaseLoss = {
  id: string;
  compraId: string;
  itemId: string;
  produtoId: string;
  quantidade: number;
  motivo: PurchaseLossMotive;
  dataPerda: string;
  observacao: string | null;
};

export type PurchaseItemDraft = {
  id: string;
  produtoId: string;
  quantidade: string;
  custoUnitario: string;
  desconto: string;
  acrescimo: string;
};

export type PurchaseDraft = {
  fornecedorId: string;
  dataCompra: string;
  desconto: string;
  acrescimo: string;
  items: PurchaseItemDraft[];
};

export type PurchaseActionDraft = {
  quantidade: string;
  data: string;
  observacao: string;
};

export type PurchaseLossDraft = PurchaseActionDraft & {
  motivo: PurchaseLossMotive | "";
};

export type PurchaseValidationError = {
  field: string;
  itemId?: string;
  message: string;
};
