"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { categoriesService } from "@/services/categories";
import type {
  CreateCategoryPayload,
  UpdateCategoryPayload
} from "@/types/category";

export const categoryQueryKeys = {
  all: ["categorias"] as const,
  list: ["categorias", "list"] as const
};

export function useCategories() {
  return useQuery({
    queryKey: categoryQueryKeys.list,
    queryFn: categoriesService.list
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) =>
      categoriesService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
    }
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryPayload }) =>
      categoriesService.update(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
    }
  });
}

export function useRemoveCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoriesService.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
    }
  });
}
