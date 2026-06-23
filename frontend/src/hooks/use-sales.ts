"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client";
import { salesService } from "@/services/sales";
import type { CreateSalePayload, SaleFilters } from "@/types/sale";

export const saleQueryKeys = {
  all: queryKeys.vendas,
  list: (filters: SaleFilters = {}) =>
    [...queryKeys.vendas, "list", filters] as const,
  detail: (id: string) => [...queryKeys.vendas, "detail", id] as const
};

export function useSales(filters: SaleFilters = {}) {
  return useQuery({
    queryKey: saleQueryKeys.list(filters),
    queryFn: () => salesService.list(filters)
  });
}

export function useSale(id: string | undefined) {
  return useQuery({
    queryKey: saleQueryKeys.detail(id ?? ""),
    queryFn: () => salesService.getById(id ?? ""),
    enabled: Boolean(id)
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSalePayload) => salesService.create(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: saleQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.estoque }),
        queryClient.invalidateQueries({ queryKey: queryKeys.financeiro }),
        queryClient.invalidateQueries({ queryKey: queryKeys.despesasOperadora })
      ]);
    }
  });
}

export function useCancelSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => salesService.cancel(id),
    onSuccess: async (_data, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: saleQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: saleQueryKeys.detail(id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.estoque })
      ]);
    }
  });
}
