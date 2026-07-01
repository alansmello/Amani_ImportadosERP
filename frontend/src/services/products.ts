import { apiClient } from "@/services/api-client";
import type {
  Product,
  ProductPayload,
  ProductPresentation,
  ProductPresentationPayload
} from "@/types/product";

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
  },

  listPresentations(productId: string) {
    return apiClient<ProductPresentation[]>(
      `${PRODUCTS_PATH}/${productId}/apresentacoes`
    );
  },

  createPresentation(productId: string, payload: ProductPresentationPayload) {
    return apiClient<ProductPresentation>(
      `${PRODUCTS_PATH}/${productId}/apresentacoes`,
      { method: "POST", body: { ...payload } }
    );
  },

  updatePresentation(
    productId: string,
    presentationId: string,
    payload: ProductPresentationPayload
  ) {
    return apiClient<void>(
      `${PRODUCTS_PATH}/${productId}/apresentacoes/${presentationId}`,
      { method: "PUT", body: { ...payload } }
    );
  },

  disablePresentation(productId: string, presentationId: string) {
    return apiClient<void>(
      `${PRODUCTS_PATH}/${productId}/apresentacoes/${presentationId}/desativar`,
      { method: "POST" }
    );
  }
};
