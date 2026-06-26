import { apiClient } from "@/services/api-client";
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload
} from "@/types/category";

const BASE_PATH = "/api/categorias";

export const categoriesService = {
  list() {
    return apiClient<Category[]>(BASE_PATH);
  },

  create(payload: CreateCategoryPayload) {
    return apiClient<Category>(BASE_PATH, {
      method: "POST",
      body: payload
    });
  },

  async update(id: string, payload: UpdateCategoryPayload) {
    await apiClient<void>(`${BASE_PATH}/${id}`, {
      method: "PUT",
      body: payload
    });
  },

  async remove(id: string) {
    await apiClient<void>(`${BASE_PATH}/${id}`, {
      method: "DELETE"
    });
  }
};
