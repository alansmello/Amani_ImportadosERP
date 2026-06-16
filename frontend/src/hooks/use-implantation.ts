"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client";
import { implantationService } from "@/services/implantation";
import type {
  InitialCashBalancePayload,
  InitialInventoryPayload,
  InitialReceivablePayload
} from "@/types/implantation";

export const implantationQueryKeys = {
  all: queryKeys.implantacao
};

export function useRegisterInitialInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InitialInventoryPayload) =>
      implantationService.registerInitialInventory(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: implantationQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.produtos }),
        queryClient.invalidateQueries({ queryKey: queryKeys.estoque })
      ]);
    }
  });
}

export function useRegisterInitialCashBalance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InitialCashBalancePayload) =>
      implantationService.registerInitialCashBalance(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: implantationQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.financeiro }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
      ]);
    }
  });
}

export function useRegisterInitialReceivable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InitialReceivablePayload) =>
      implantationService.registerInitialReceivable(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: implantationQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.clientes }),
        queryClient.invalidateQueries({ queryKey: queryKeys.financeiro })
      ]);
    }
  });
}

