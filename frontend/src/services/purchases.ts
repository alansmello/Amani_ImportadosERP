import { apiClient } from "@/services/api-client";
import type {
  CreatePurchasePayload,
  CreatePurchaseResponse,
  PendingPurchaseProduct,
  Purchase,
  PurchaseFilters,
  PurchaseInTransit,
  PurchaseListItem,
  PurchaseLoss,
  PurchaseReceipt,
  RegisterPurchaseLossPayload,
  RegisterPurchaseReceiptPayload
} from "@/types/purchase";

const PURCHASES_PATH = "/api/compras";

function buildPurchaseListPath(filters: PurchaseFilters = {}) {
  const params = new URLSearchParams();

  if (filters.dataInicio) {
    params.set("dataInicio", filters.dataInicio);
  }

  if (filters.dataFim) {
    params.set("dataFim", filters.dataFim);
  }

  if (filters.fornecedorId) {
    params.set("fornecedorId", filters.fornecedorId);
  }

  const query = params.toString();
  return query ? `${PURCHASES_PATH}?${query}` : PURCHASES_PATH;
}

export const purchasesService = {
  list(filters: PurchaseFilters = {}) {
    return apiClient<PurchaseListItem[]>(buildPurchaseListPath(filters));
  },

  listInTransit() {
    return apiClient<PurchaseInTransit[]>(`${PURCHASES_PATH}/em-transito`);
  },

  listPendingProducts() {
    return apiClient<PendingPurchaseProduct[]>(
      `${PURCHASES_PATH}/produtos-pendentes`
    );
  },

  getById(id: string) {
    return apiClient<Purchase>(`${PURCHASES_PATH}/${id}`);
  },

  create(payload: CreatePurchasePayload) {
    return apiClient<CreatePurchaseResponse>(PURCHASES_PATH, {
      method: "POST",
      body: { ...payload }
    });
  },

  registerReceipt(
    compraId: string,
    itemId: string,
    payload: RegisterPurchaseReceiptPayload
  ) {
    return apiClient<PurchaseReceipt>(
      `${PURCHASES_PATH}/${compraId}/itens/${itemId}/recebimentos`,
      {
        method: "POST",
        body: { ...payload }
      }
    );
  },

  registerLoss(
    compraId: string,
    itemId: string,
    payload: RegisterPurchaseLossPayload
  ) {
    return apiClient<PurchaseLoss>(
      `${PURCHASES_PATH}/${compraId}/itens/${itemId}/perdas`,
      {
        method: "POST",
        body: { ...payload }
      }
    );
  },

  listReceipts(compraId: string) {
    return apiClient<PurchaseReceipt[]>(
      `${PURCHASES_PATH}/${compraId}/recebimentos`
    );
  },

  listLosses(compraId: string) {
    return apiClient<PurchaseLoss[]>(
      `${PURCHASES_PATH}/${compraId}/perdas`
    );
  }
};
