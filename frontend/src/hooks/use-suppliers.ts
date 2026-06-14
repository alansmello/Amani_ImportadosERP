"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client";
import { suppliersService } from "@/services/suppliers";
import type { SupplierPayload } from "@/types/supplier";

export const supplierQueryKeys = {
  all: queryKeys.fornecedores,
  list: [...queryKeys.fornecedores, "list"] as const,
  detail: (id: string) => [...queryKeys.fornecedores, "detail", id] as const
};

export function useSuppliers() {
  return useQuery({
    queryKey: supplierQueryKeys.list,
    queryFn: suppliersService.list
  });
}

export function useSupplier(id: string | undefined) {
  return useQuery({
    queryKey: supplierQueryKeys.detail(id ?? ""),
    queryFn: () => suppliersService.getById(id ?? ""),
    enabled: Boolean(id)
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SupplierPayload) => suppliersService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: supplierQueryKeys.all });
    }
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload
    }: {
      id: string;
      payload: SupplierPayload;
    }) => suppliersService.update(id, payload),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: supplierQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: supplierQueryKeys.detail(variables.id)
        })
      ]);
    }
  });
}
