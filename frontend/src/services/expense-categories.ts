import { apiClient } from "@/services/api-client";
import type {
  CreateExpenseCategoryPayload,
  ExpenseCategory,
  UpdateExpenseCategoryPayload
} from "@/types/expense-category";

const BASE_PATH = "/api/categorias-despesa";

function buildCategoriesPath(incluirInativas?: boolean) {
  if (incluirInativas === undefined) return BASE_PATH;
  return `${BASE_PATH}?incluirInativas=${String(incluirInativas)}`;
}

export const expenseCategoriesService = {
  list(incluirInativas = false) {
    return apiClient<ExpenseCategory[]>(buildCategoriesPath(incluirInativas));
  },

  get(id: string) {
    return apiClient<ExpenseCategory>(`${BASE_PATH}/${id}`);
  },

  create(payload: CreateExpenseCategoryPayload) {
    return apiClient<{ id: string }>(BASE_PATH, {
      method: "POST",
      body: payload
    });
  },

  async update(id: string, payload: UpdateExpenseCategoryPayload) {
    await apiClient<void>(`${BASE_PATH}/${id}`, {
      method: "PUT",
      body: payload
    });
  },

  async inactivate(id: string) {
    await apiClient<void>(`${BASE_PATH}/${id}/inativar`, {
      method: "POST"
    });
  },

  async reactivate(id: string) {
    await apiClient<void>(`${BASE_PATH}/${id}/reativar`, {
      method: "POST"
    });
  }
};
