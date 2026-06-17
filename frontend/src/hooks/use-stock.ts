"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client";
import { stockService } from "@/services/stock";
import type { StockListFilters, StockMovementFilters } from "@/types/stock";

export const stockQueryKeys = {
  all: queryKeys.estoque,
  list: (filters: StockListFilters = {}) =>
    [...queryKeys.estoque, "list", filters] as const,
  movements: (produtoId: string, filters: StockMovementFilters = {}) =>
    [...queryKeys.estoque, "movements", produtoId, filters] as const
};

export function useStockProducts(filters: StockListFilters = {}) {
  return useQuery({
    queryKey: stockQueryKeys.list(filters),
    queryFn: () => stockService.list(filters)
  });
}

export function useStockMovements(
  produtoId: string | undefined,
  filters: StockMovementFilters = {}
) {
  return useQuery({
    queryKey: stockQueryKeys.movements(produtoId ?? "", filters),
    queryFn: () => stockService.getMovements(produtoId ?? "", filters),
    enabled: Boolean(produtoId)
  });
}
