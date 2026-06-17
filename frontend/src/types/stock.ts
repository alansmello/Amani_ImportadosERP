export type StockMovementType = string;

export type StockListFilters = {
  busca?: string;
  somenteComSaldo?: boolean;
};

export type StockProduct = {
  produtoId: string;
  nome: string;
  codigo?: string | null;
  categoriaId?: string | null;
  categoriaNome?: string | null;
  saldoAtual: number;
  ultimaMovimentacaoEm?: string | null;
};

export type StockMovementFilters = {
  dataInicio?: string;
  dataFim?: string;
  tipo?: StockMovementType;
  limite?: number;
};

export type StockMovement = {
  id: string;
  produtoId: string;
  tipo: StockMovementType;
  quantidade: number;
  data: string;
  origem: string;
  referenciaId?: string | null;
  compraId?: string | null;
  compraItemId?: string | null;
  vendaId?: string | null;
  valorUnitario?: number | null;
};

export type StockMovementHistory = {
  produtoId: string;
  nomeProduto?: string;
  saldoAtual: number;
  totalMovimentacoes?: number;
  movimentacoes: StockMovement[];
};

export type StockProductResponse = {
  produtoId: string;
  nomeProduto: string;
  categoriaId: string;
  saldo: number;
};

export type StockMovementResponse = {
  id: string;
  data: string;
  tipo: StockMovementType;
  quantidade: number;
  origem: string;
  compraId?: string | null;
  compraItemId?: string | null;
  vendaId?: string | null;
  valorUnitario?: number | null;
};

export type StockMovementHistoryResponse = {
  produtoId: string;
  nomeProduto: string;
  saldoAtual: number;
  totalMovimentacoes: number;
  movimentacoes: StockMovementResponse[];
};
