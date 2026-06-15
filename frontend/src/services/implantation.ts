import { apiClient } from "@/services/api-client";
import type {
  InitialCashBalancePayload,
  InitialCashBalanceResult,
  InitialInventoryPayload,
  InitialInventoryResult,
  InitialReceivablePayload,
  InitialReceivableResult
} from "@/types/implantation";

const IMPLANTATION_PATH = "/api/implantacao";

export const implantationService = {
  registerInitialInventory(payload: InitialInventoryPayload) {
    return apiClient<InitialInventoryResult>(
      `${IMPLANTATION_PATH}/inventario-inicial`,
      {
        method: "POST",
        body: { ...payload }
      }
    );
  },

  registerInitialCashBalance(payload: InitialCashBalancePayload) {
    return apiClient<InitialCashBalanceResult>(
      `${IMPLANTATION_PATH}/saldo-inicial-caixa`,
      {
        method: "POST",
        body: { ...payload }
      }
    );
  },

  registerInitialReceivable(payload: InitialReceivablePayload) {
    return apiClient<InitialReceivableResult>(
      `${IMPLANTATION_PATH}/contas-receber-iniciais`,
      {
        method: "POST",
        body: { ...payload }
      }
    );
  }
};

