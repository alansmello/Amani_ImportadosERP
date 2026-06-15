export const INITIAL_INVENTORY_ORIGIN = "ImplantacaoInicial";
export const INITIAL_CASH_ORIGIN = "SaldoInicial";
export const INITIAL_RECEIVABLE_ORIGIN = "ImplantacaoInicial";

export type ImplantationStepId =
  | "initialInventory"
  | "initialCash"
  | "initialReceivables";

export type ImplantationStepStatus =
  | "pending"
  | "editing"
  | "reviewing"
  | "submitting"
  | "completed"
  | "error";

export type ImplantationValidationError = {
  field: string;
  message: string;
  itemId?: string;
};

export type ImplantationStepState<TResult = unknown> = {
  id: ImplantationStepId;
  status: ImplantationStepStatus;
  completedAt?: string;
  resultSummary?: TResult;
  errorMessage?: string;
};

export type InitialInventoryItemPayload = {
  produtoId: string;
  quantidade: number;
  valorUnitario?: number | null;
};

export type InitialInventoryPayload = {
  data: string;
  origem: typeof INITIAL_INVENTORY_ORIGIN;
  itens: InitialInventoryItemPayload[];
};

export type InitialInventoryResult = {
  data: string;
  origem: string;
  quantidadeItens: number;
  movimentacoesIds: string[];
};

export type InitialInventoryItemDraft = {
  id: string;
  produtoId: string;
  quantidade: string;
  valorUnitario: string;
};

export type InitialCashBalancePayload = {
  valor: number;
  data: string;
  origem: typeof INITIAL_CASH_ORIGIN;
  descricao?: string | null;
};

export type InitialCashBalanceResult = {
  eventoFinanceiroId: string;
  valor: number;
  data: string;
  origem: string;
};

export type InitialCashBalanceDraft = {
  valor: string;
  data: string;
  descricao: string;
};

export type InitialReceivablePayload = {
  clienteId: string;
  valor: number;
  dataVencimento: string;
  origem: typeof INITIAL_RECEIVABLE_ORIGIN;
  descricao?: string | null;
};

export type InitialReceivableResult = {
  contaReceberId: string;
  clienteId: string;
  valor: number;
  dataVencimento: string;
  origem: string;
};

export type InitialReceivableDraft = {
  id: string;
  clienteId: string;
  valor: string;
  dataVencimento: string;
  descricao: string;
};

