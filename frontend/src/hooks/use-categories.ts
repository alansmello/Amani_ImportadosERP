"use client";

import { useQuery } from "@tanstack/react-query";

import { categoriesService } from "@/services/categories";

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
