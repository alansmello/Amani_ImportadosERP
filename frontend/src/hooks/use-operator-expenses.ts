"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client";
import { operatorExpensesService } from "@/services/operator-expenses";
import type { OperatorExpenseFilters } from "@/types/operator-expense";

export const operatorExpensesQueryKeys = {
  all: queryKeys.despesasOperadora,
  list: (filters: OperatorExpenseFilters = {}) =>
    [...queryKeys.despesasOperadora, "list", filters] as const
};

export function useOperatorExpenses(filters: OperatorExpenseFilters = {}) {
  return useQuery({
    queryKey: operatorExpensesQueryKeys.list(filters),
    queryFn: () => operatorExpensesService.list(filters)
  });
}
