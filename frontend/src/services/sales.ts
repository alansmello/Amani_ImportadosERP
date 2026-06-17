import { apiClient } from "@/services/api-client";
import type {
  CreateSalePayload,
  CreateSaleResponse,
  Sale,
  SaleFilters,
  SaleListItem
} from "@/types/sale";

const SALES_PATH = "/api/vendas";

function buildSalesListPath(filters: SaleFilters = {}) {
  const params = new URLSearchParams();

  if (filters.dataInicio) {
    params.set("dataInicio", filters.dataInicio);
  }

  if (filters.dataFim) {
    params.set("dataFim", filters.dataFim);
  }

  if (filters.clienteId) {
    params.set("clienteId", filters.clienteId);
  }

  const query = params.toString();
  return query ? `${SALES_PATH}?${query}` : SALES_PATH;
}

export const salesService = {
  list(filters: SaleFilters = {}) {
    return apiClient<SaleListItem[]>(buildSalesListPath(filters));
  },

  getById(id: string) {
    return apiClient<Sale>(`${SALES_PATH}/${id}`);
  },

  create(payload: CreateSalePayload) {
    return apiClient<CreateSaleResponse>(SALES_PATH, {
      method: "POST",
      body: { ...payload }
    });
  },

  async cancel(id: string) {
    await apiClient<void>(`${SALES_PATH}/${id}/cancelar`, {
      method: "POST"
    });
  }
};
