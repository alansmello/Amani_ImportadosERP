"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client";
import { customersService } from "@/services/customers";
import type { CustomerPayload, CustomerStatusFilter } from "@/types/customer";

export const customerQueryKeys = {
  all: queryKeys.clientes,
  list: (filter: CustomerStatusFilter = "active") =>
    [...queryKeys.clientes, "list", filter] as const,
  detail: (id: string) => [...queryKeys.clientes, "detail", id] as const
};

export function useCustomers(filter: CustomerStatusFilter = "active") {
  return useQuery({
    queryKey: customerQueryKeys.list(filter),
    queryFn: () => customersService.list(filter)
  });
}

export function useCustomer(id: string | undefined) {
  return useQuery({
    queryKey: customerQueryKeys.detail(id ?? ""),
    queryFn: () => customersService.getById(id ?? ""),
    enabled: Boolean(id)
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CustomerPayload) => customersService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: customerQueryKeys.all });
    }
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload
    }: {
      id: string;
      payload: CustomerPayload;
    }) => customersService.update(id, payload),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: customerQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: customerQueryKeys.detail(variables.id)
        })
      ]);
    }
  });
}

export function useInactivateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customersService.inactivate(id),
    onSuccess: async (_data, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: customerQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: customerQueryKeys.detail(id)
        })
      ]);
    }
  });
}
