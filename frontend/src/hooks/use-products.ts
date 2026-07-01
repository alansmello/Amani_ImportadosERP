"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client";
import { productsService } from "@/services/products";
import type { ProductPayload, ProductPresentationPayload } from "@/types/product";

export const productQueryKeys = {
  all: queryKeys.produtos,
  list: [...queryKeys.produtos, "list"] as const,
  detail: (id: string) => [...queryKeys.produtos, "detail", id] as const
  ,presentations: (id: string) => [...queryKeys.produtos, "presentations", id] as const
};

export function useProducts() {
  return useQuery({
    queryKey: productQueryKeys.list,
    queryFn: productsService.list
  });
}

export function useProductPresentations(productId: string | undefined) {
  return useQuery({
    queryKey: productQueryKeys.presentations(productId ?? ""),
    queryFn: () => productsService.listPresentations(productId ?? ""),
    enabled: Boolean(productId)
  });
}

export function useCreateProductPresentation(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductPresentationPayload) =>
      productsService.createPresentation(productId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productQueryKeys.presentations(productId) }),
        queryClient.invalidateQueries({ queryKey: productQueryKeys.detail(productId) }),
        queryClient.invalidateQueries({ queryKey: productQueryKeys.list })
      ]);
    }
  });
}

export function useUpdateProductPresentation(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProductPresentationPayload }) =>
      productsService.updatePresentation(productId, id, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productQueryKeys.presentations(productId) }),
        queryClient.invalidateQueries({ queryKey: productQueryKeys.detail(productId) }),
        queryClient.invalidateQueries({ queryKey: productQueryKeys.list })
      ]);
    }
  });
}

export function useDisableProductPresentation(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsService.disablePresentation(productId, id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productQueryKeys.presentations(productId) }),
        queryClient.invalidateQueries({ queryKey: productQueryKeys.detail(productId) }),
        queryClient.invalidateQueries({ queryKey: productQueryKeys.list })
      ]);
    }
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: productQueryKeys.detail(id ?? ""),
    queryFn: () => productsService.getById(id ?? ""),
    enabled: Boolean(id)
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProductPayload) => productsService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
    }
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload
    }: {
      id: string;
      payload: ProductPayload;
    }) => productsService.update(id, payload),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: productQueryKeys.detail(variables.id)
        })
      ]);
    }
  });
}
