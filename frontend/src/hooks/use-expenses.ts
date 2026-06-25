"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client";
import { expensesService } from "@/services/expenses";
import type { CreateExpensePayload, ExpenseFilters } from "@/types/expense";

export const expensesQueryKeys = {
  all: queryKeys.despesas,
  list: (filters: ExpenseFilters = {}) =>
    [...queryKeys.despesas, "list", filters] as const
};

export function useExpenses(filters: ExpenseFilters = {}) {
  return useQuery({
    queryKey: expensesQueryKeys.list(filters),
    queryFn: () => expensesService.list(filters)
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateExpensePayload) => expensesService.create(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: expensesQueryKeys.all
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.dashboard
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.financeiro
        })
      ]);
    }
  });
}
