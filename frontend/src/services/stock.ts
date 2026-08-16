import { apiClient } from "@/services/api-client";
import type {
  StockListFilters,
  StockMovement,
  StockMovementFilters,
  StockMovementHistory,
  StockMovementHistoryResponse,
  StockMovementResponse,
  StockProduct,
  StockProductResponse
} from "@/types/stock";

const STOCK_PATH = "/api/estoque";

function buildStockListPath(filters: StockListFilters = {}) {
  const params = new URLSearchParams();

  if (filters.somenteComSaldo) {
    params.set("apenasComSaldo", "true");
  }

  const query = params.toString();
  return query ? `${STOCK_PATH}?${query}` : STOCK_PATH;
}

function buildStockMovementsPath(
  produtoId: string,
  filters: StockMovementFilters = {}
) {
  const params = new URLSearchParams();

  if (filters.dataInicio) {
    params.set("dataInicio", filters.dataInicio);
  }

  if (filters.dataFim) {
    params.set("dataFim", filters.dataFim);
  }

  if (filters.tipo) {
    params.set("tipo", filters.tipo);
  }

  if (filters.limite) {
    params.set("limite", String(filters.limite));
  }

  const query = params.toString();
  const path = `${STOCK_PATH}/${produtoId}/movimentacoes`;
  return query ? `${path}?${query}` : path;
}

function toStockProduct(response: StockProductResponse): StockProduct {
  return {
    produtoId: response.produtoId,
    nome: response.nomeProduto,
    codigo: null,
    categoriaId: response.categoriaId,
    categoriaNome: null,
    saldoAtual: response.saldo,
    ultimaMovimentacaoEm: null
  };
}

function toStockMovement(
  produtoId: string,
  response: StockMovementResponse
): StockMovement {
  return {
    id: response.id,
    produtoId,
    tipo: response.tipo,
    quantidade: response.quantidade,
    data: response.data,
    origem: response.origem,
    referenciaId:
      response.compraItemDevolucaoId ??
      response.compraItemRecebimentoId ??
      response.compraItemId ??
      response.compraId ??
      response.vendaId ??
      null,
    compraId: response.compraId ?? null,
    compraItemId: response.compraItemId ?? null,
    compraItemDevolucaoId: response.compraItemDevolucaoId ?? null,
    compraItemRecebimentoId: response.compraItemRecebimentoId ?? null,
    vendaId: response.vendaId ?? null,
    valorUnitario: response.valorUnitario ?? null
  };
}

function toStockMovementHistory(
  response: StockMovementHistoryResponse
): StockMovementHistory {
  return {
    produtoId: response.produtoId,
    nomeProduto: response.nomeProduto,
    saldoAtual: response.saldoAtual,
    totalMovimentacoes: response.totalMovimentacoes,
    movimentacoes: response.movimentacoes.map((movement) =>
      toStockMovement(response.produtoId, movement)
    )
  };
}

export const stockService = {
  async list(filters: StockListFilters = {}) {
    const response = await apiClient<StockProductResponse[]>(
      buildStockListPath(filters)
    );

    return response.map(toStockProduct);
  },

  async getMovements(
    produtoId: string,
    filters: StockMovementFilters = {}
  ) {
    const response = await apiClient<StockMovementHistoryResponse>(
      buildStockMovementsPath(produtoId, filters)
    );

    return toStockMovementHistory(response);
  }
};
