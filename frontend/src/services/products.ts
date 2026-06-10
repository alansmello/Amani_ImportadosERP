import { apiClient } from "@/services/api-client";
import type { Product, ProductPayload } from "@/types/product";

const PRODUCTS_PATH = "/api/produtos";

export const productsService = {
  list() {
    return apiClient<Product[]>(PRODUCTS_PATH);
  },

  getById(id: string) {
    return apiClient<Product>(`${PRODUCTS_PATH}/${id}`);
  },

  create(payload: ProductPayload) {
    return apiClient<Product>(PRODUCTS_PATH, {
      method: "POST",
      body: { ...payload }
    });
  },

  update(id: string, payload: ProductPayload) {
    return apiClient<void>(`${PRODUCTS_PATH}/${id}`, {
      method: "PUT",
      body: { ...payload }
    });
  }
};
