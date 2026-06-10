import { apiClient } from "@/services/api-client";
import type { Category } from "@/types/category";

export const categoriesService = {
  list() {
    return apiClient<Category[]>("/api/categorias");
  }
};
