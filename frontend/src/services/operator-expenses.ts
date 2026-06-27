import { apiClient } from "@/services/api-client";
import type {
  OperatorExpenseFilters,
  OperatorExpenseQueryResult
} from "@/types/operator-expense";

const OPERATOR_EXPENSES_PATH = "/api/despesas-operadora";

function buildOperatorExpensesPath(filters: OperatorExpenseFilters = {}) {
  const params = new URLSearchParams();

  if (filters.dataInicio) {
    params.set("dataInicio", filters.dataInicio);
  }

  if (filters.dataFim) {
    params.set("dataFim", filters.dataFim);
  }

  if (filters.formaPagamento) {
    params.set("formaPagamento", filters.formaPagamento);
  }

  const query = params.toString();
  return query ? `${OPERATOR_EXPENSES_PATH}?${query}` : OPERATOR_EXPENSES_PATH;
}

export const operatorExpensesService = {
  list(filters: OperatorExpenseFilters = {}) {
    return apiClient<OperatorExpenseQueryResult>(buildOperatorExpensesPath(filters));
  }
};
