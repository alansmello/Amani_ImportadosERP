import { apiClient } from "@/services/api-client";
import type { Supplier, SupplierPayload } from "@/types/supplier";

const SUPPLIERS_PATH = "/api/fornecedores";

export const suppliersService = {
  list() {
    return apiClient<Supplier[]>(SUPPLIERS_PATH);
  },

  getById(id: string) {
    return apiClient<Supplier>(`${SUPPLIERS_PATH}/${id}`);
  },

  create(payload: SupplierPayload) {
    return apiClient<Supplier>(SUPPLIERS_PATH, {
      method: "POST",
      body: { ...payload }
    });
  },

  update(id: string, payload: SupplierPayload) {
    return apiClient<void>(`${SUPPLIERS_PATH}/${id}`, {
      method: "PUT",
      body: { ...payload }
    });
  }
};
