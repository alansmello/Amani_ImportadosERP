export type SaleFilters = {
  dataInicio?: string;
  dataFim?: string;
  clienteId?: string;
};

export type SaleListItem = {
  id: string;
  clienteId: string;
  dataVenda: string;
  totalVenda: number;
  lucro: number;
};

export type SaleItem = {
  id: string;
  produtoId: string;
  quantidade: number;
  precoUnitario: number;
  desconto: number;
  acrescimo: number;
  valorTotal: number;
};

export type Sale = {
  id: string;
  clienteId: string;
  dataVenda: string;
  desconto: number;
  acrescimo: number;
  total: number;
  lucro: number;
  items: SaleItem[];
};

export type CreateSaleItemPayload = {
  produtoId: string;
  quantidade: number;
  precoUnitario: number;
  desconto: number;
  acrescimo: number;
};

export type CreateSalePayload = {
  clienteId: string;
  dataVenda?: string | null;
  desconto: number;
  acrescimo: number;
  items: CreateSaleItemPayload[];
};

export type CreateSaleResponse = {
  id: string;
  lucro: number;
};

export type SaleItemDraft = {
  id: string;
  produtoId: string;
  quantidade: string;
  precoUnitario: string;
  desconto: string;
  acrescimo: string;
};

export type SaleDraft = {
  clienteId: string;
  dataVenda: string;
  desconto: string;
  acrescimo: string;
  items: SaleItemDraft[];
};

export type SaleValidationError = {
  field: string;
  itemId?: string;
  message: string;
};
