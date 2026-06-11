import { apiClient } from "@/services/api-client";
import type {
  Customer,
  CustomerPayload,
  CustomerStatusFilter
} from "@/types/customer";

const CUSTOMERS_PATH = "/api/clientes";

function buildCustomersPath(filter: CustomerStatusFilter = "active") {
  if (filter === "all") {
    return CUSTOMERS_PATH;
  }

  const ativo = filter === "active";
  return `${CUSTOMERS_PATH}?ativo=${String(ativo)}`;
}

export const customersService = {
  list(filter: CustomerStatusFilter = "active") {
    return apiClient<Customer[]>(buildCustomersPath(filter));
  },

  getById(id: string) {
    return apiClient<Customer>(`${CUSTOMERS_PATH}/${id}`);
  },

  create(payload: CustomerPayload) {
    return apiClient<Customer>(CUSTOMERS_PATH, {
      method: "POST",
      body: { ...payload }
    });
  },

  update(id: string, payload: CustomerPayload) {
    return apiClient<void>(`${CUSTOMERS_PATH}/${id}`, {
      method: "PUT",
      body: { ...payload }
    });
  },

  inactivate(id: string) {
    return apiClient<void>(`${CUSTOMERS_PATH}/${id}/inativar`, {
      method: "POST"
    });
  }
};
