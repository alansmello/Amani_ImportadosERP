"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client";
import { expenseCategoriesService } from "@/services/expense-categories";
import type {
  CreateExpenseCategoryPayload,
  UpdateExpenseCategoryPayload
} from "@/types/expense-category";

export const expenseCategoriesQueryKeys = {
  all: queryKeys.categoriasDespesa,
  list: (incluirInativas = false) =>
    [...queryKeys.categoriasDespesa, "list", incluirInativas] as const,
  detail: (id: string) => [...queryKeys.categoriasDespesa, "detail", id] as const
};

export function useExpenseCategories(incluirInativas = false) {
  return useQuery({
    queryKey: expenseCategoriesQueryKeys.list(incluirInativas),
    queryFn: () => expenseCategoriesService.list(incluirInativas)
  });
}

export function useExpenseCategory(id: string | undefined) {
  return useQuery({
    queryKey: expenseCategoriesQueryKeys.detail(id ?? ""),
    queryFn: () => expenseCategoriesService.get(id ?? ""),
    enabled: Boolean(id)
  });
}

export function useCreateExpenseCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateExpenseCategoryPayload) =>
      expenseCategoriesService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: expenseCategoriesQueryKeys.all
      });
    }
  });
}

export function useUpdateExpenseCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload
    }: {
      id: string;
      payload: UpdateExpenseCategoryPayload;
    }) => expenseCategoriesService.update(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: expenseCategoriesQueryKeys.all
      });
    }
  });
}

export function useInactivateExpenseCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => expenseCategoriesService.inactivate(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: expenseCategoriesQueryKeys.all
      });
    }
  });
}
