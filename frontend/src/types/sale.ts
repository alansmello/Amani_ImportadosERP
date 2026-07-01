import type { PaymentMethod } from "./payment-settings";

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
  formaPagamento?: PaymentMethod;
  possuiApresentacaoFracionada?: boolean;
};

export type SaleItem = {
  id: string;
  produtoId: string;
  quantidade: number;
  precoUnitario: number;
  desconto: number;
  acrescimo: number;
  valorTotal: number;
  produtoApresentacaoId?: string | null;
  apresentacaoNome?: string | null;
  fatorNumeradorAplicado?: number | null;
  fatorDenominadorAplicado?: number | null;
  fatorConversaoAplicado?: number | null;
  quantidadeConvertidaEstoque?: number | null;
};

export type Sale = {
  id: string;
  clienteId: string;
  dataVenda: string;
  desconto: number;
  acrescimo: number;
  total: number;
  lucro: number;
  formaPagamento?: PaymentMethod;
  percentualTaxaAplicado?: number | null;
  items: SaleItem[];
};

export type CreateSaleItemPayload = {
  produtoId: string;
  produtoApresentacaoId?: string | null;
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
  formaPagamento?: PaymentMethod;
  percentualTaxaOverride?: number | null;
  items: CreateSaleItemPayload[];
};

export type CreateSaleResponse = {
  id: string;
  lucro: number;
  formaPagamento?: PaymentMethod;
  statusFinanceiro?: string;
  contaReceberId?: string | null;
  valorBruto?: number;
  valorLiquido?: number;
  percentualTaxaAplicado?: number | null;
  despesaOperadoraId?: string | null;
  mensagemFinanceira?: string | null;
};

export type SaleItemDraft = {
  id: string;
  produtoId: string;
  produtoApresentacaoId: string;
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
