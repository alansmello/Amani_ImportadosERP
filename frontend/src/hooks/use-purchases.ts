"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client";
import { purchasesService } from "@/services/purchases";
import type {
  CreatePurchasePayload,
  PurchaseFilters,
  RegisterPurchaseLossPayload,
  RegisterPurchaseReceiptPayload
} from "@/types/purchase";

export const purchaseQueryKeys = {
  all: queryKeys.compras,
  list: (filters: PurchaseFilters = {}) =>
    [...queryKeys.compras, "list", filters] as const,
  inTransit: [...queryKeys.compras, "in-transit"] as const,
  pendingProducts: [...queryKeys.compras, "pending-products"] as const,
  detail: (id: string) => [...queryKeys.compras, "detail", id] as const,
  receipts: (compraId: string) =>
    [...queryKeys.compras, "receipts", compraId] as const,
  losses: (compraId: string) =>
    [...queryKeys.compras, "losses", compraId] as const
};

export function usePurchases(filters: PurchaseFilters = {}) {
  return useQuery({
    queryKey: purchaseQueryKeys.list(filters),
    queryFn: () => purchasesService.list(filters)
  });
}

export function usePurchasesInTransit() {
  return useQuery({
    queryKey: purchaseQueryKeys.inTransit,
    queryFn: purchasesService.listInTransit
  });
}

export function usePendingPurchaseProducts() {
  return useQuery({
    queryKey: purchaseQueryKeys.pendingProducts,
    queryFn: purchasesService.listPendingProducts
  });
}

export function usePurchase(id: string | undefined) {
  return useQuery({
    queryKey: purchaseQueryKeys.detail(id ?? ""),
    queryFn: () => purchasesService.getById(id ?? ""),
    enabled: Boolean(id)
  });
}

export function usePurchaseReceipts(compraId: string | undefined) {
  return useQuery({
    queryKey: purchaseQueryKeys.receipts(compraId ?? ""),
    queryFn: () => purchasesService.listReceipts(compraId ?? ""),
    enabled: Boolean(compraId)
  });
}

export function usePurchaseLosses(compraId: string | undefined) {
  return useQuery({
    queryKey: purchaseQueryKeys.losses(compraId ?? ""),
    queryFn: () => purchasesService.listLosses(compraId ?? ""),
    enabled: Boolean(compraId)
  });
}

export function useCreatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePurchasePayload) =>
      purchasesService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: purchaseQueryKeys.all });
    }
  });
}

export function useRegisterPurchaseReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      compraId,
      itemId,
      payload
    }: {
      compraId: string;
      itemId: string;
      payload: RegisterPurchaseReceiptPayload;
    }) => purchasesService.registerReceipt(compraId, itemId, payload),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: purchaseQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: purchaseQueryKeys.detail(variables.compraId)
        }),
        queryClient.invalidateQueries({
          queryKey: purchaseQueryKeys.receipts(variables.compraId)
        }),
        queryClient.invalidateQueries({ queryKey: queryKeys.estoque })
      ]);
    }
  });
}

export function useRegisterPurchaseLoss() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      compraId,
      itemId,
      payload
    }: {
      compraId: string;
      itemId: string;
      payload: RegisterPurchaseLossPayload;
    }) => purchasesService.registerLoss(compraId, itemId, payload),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: purchaseQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: purchaseQueryKeys.detail(variables.compraId)
        }),
        queryClient.invalidateQueries({
          queryKey: purchaseQueryKeys.losses(variables.compraId)
        })
      ]);
    }
  });
}
