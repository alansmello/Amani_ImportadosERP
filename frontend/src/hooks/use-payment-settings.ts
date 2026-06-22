"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client";
import { paymentSettingsService } from "@/services/payment-settings";
import type {
  PaymentMethod,
  UpdatePaymentMethodSettingsPayload
} from "@/types/payment-settings";

export const paymentSettingsQueryKeys = {
  all: queryKeys.formasPagamento,
  list: () => [...queryKeys.formasPagamento, "list"] as const
};

export function usePaymentSettings() {
  return useQuery({
    queryKey: paymentSettingsQueryKeys.list(),
    queryFn: () => paymentSettingsService.list()
  });
}

export function useUpdatePaymentSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      formaPagamento,
      payload
    }: {
      formaPagamento: PaymentMethod;
      payload: UpdatePaymentMethodSettingsPayload;
    }) => paymentSettingsService.update(formaPagamento, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: paymentSettingsQueryKeys.all
      });
    }
  });
}
