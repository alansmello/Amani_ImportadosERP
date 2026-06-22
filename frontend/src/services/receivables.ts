import { apiClient } from "@/services/api-client";
import type {
  CreateReceivablePayload,
  CreateReceivableResponse,
  ReceivableClientDetail,
  ReceivableListItem,
  ReceivablesByClient,
  RegisterPaymentPayload,
  UpdateReceivablePayload
} from "@/types/receivable";

const BASE_PATH = "/api/contas-receber";

export const receivablesService = {
  list() {
    return apiClient<ReceivableListItem[]>(BASE_PATH);
  },

  listByClient() {
    return apiClient<ReceivablesByClient[]>(`${BASE_PATH}/por-cliente`);
  },

  getClientDetail(clienteId: string) {
    return apiClient<ReceivableClientDetail[]>(
      `${BASE_PATH}/cliente/${clienteId}`
    );
  },

  create(payload: CreateReceivablePayload) {
    return apiClient<CreateReceivableResponse>(BASE_PATH, {
      method: "POST",
      body: {
        clienteId: payload.clienteId,
        valor: payload.valor,
        dataVencimento: payload.dataVencimento
      }
    });
  },

  async registerPayment(id: string, payload: RegisterPaymentPayload) {
    await apiClient<void>(`${BASE_PATH}/${id}/pagamentos`, {
      method: "POST",
      body: payload
    });
  },

  async update(id: string, payload: UpdateReceivablePayload) {
    await apiClient<void>(`${BASE_PATH}/${id}`, {
      method: "PUT",
      body: payload
    });
  },

  async delete(id: string) {
    await apiClient<void>(`${BASE_PATH}/${id}`, {
      method: "DELETE"
    });
  }
};
