import { apiClient } from "@/services/api-client";
import type {
  PaymentMethod,
  PaymentMethodSettings,
  UpdatePaymentMethodSettingsPayload
} from "@/types/payment-settings";

const PAYMENT_SETTINGS_PATH = "/api/configuracoes/formas-pagamento";

export const paymentSettingsService = {
  list() {
    return apiClient<PaymentMethodSettings[]>(PAYMENT_SETTINGS_PATH);
  },

  update(
    formaPagamento: PaymentMethod,
    payload: UpdatePaymentMethodSettingsPayload
  ) {
    return apiClient<PaymentMethodSettings>(
      `${PAYMENT_SETTINGS_PATH}/${formaPagamento}`,
      {
        method: "PUT",
        body: payload
      }
    );
  }
};
