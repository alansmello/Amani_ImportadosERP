import { apiClient } from "@/services/api-client";
import type {
  CreateExpensePayload,
  CreateExpenseResponse,
  Expense,
  ExpenseFilters
} from "@/types/expense";

const BASE_PATH = "/api/despesas";

function buildExpensesPath(filters: ExpenseFilters = {}) {
  const params = new URLSearchParams();

  if (filters.dataInicio) {
    params.set("dataInicio", filters.dataInicio);
  }

  if (filters.dataFim) {
    params.set("dataFim", filters.dataFim);
  }

  if (filters.categoriaId) {
    params.set("categoriaId", filters.categoriaId);
  }

  const query = params.toString();
  return query ? `${BASE_PATH}?${query}` : BASE_PATH;
}

export const expensesService = {
  list(filters: ExpenseFilters = {}) {
    return apiClient<Expense[]>(buildExpensesPath(filters));
  },

  create(payload: CreateExpensePayload) {
    return apiClient<CreateExpenseResponse>(BASE_PATH, {
      method: "POST",
      body: payload
    });
  }
};
