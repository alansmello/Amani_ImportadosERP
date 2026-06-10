import { apiClient } from "@/services/api-client";
import type { Supplier } from "@/types/supplier";

export const suppliersService = {
  list() {
    return apiClient<Supplier[]>("/api/fornecedores");
  }
};
