"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client";
import { receivablesService } from "@/services/receivables";
import type {
  CreateReceivablePayload,
  RegisterPaymentPayload,
  UpdateReceivablePayload
} from "@/types/receivable";

export const receivableQueryKeys = {
  all: queryKeys.financeiro,
  list: () => [...queryKeys.financeiro, "list"] as const,
  byClient: () => [...queryKeys.financeiro, "by-client"] as const,
  clientDetail: (clienteId: string) =>
    [...queryKeys.financeiro, "client-detail", clienteId] as const
};

export function useReceivables() {
  return useQuery({
    queryKey: receivableQueryKeys.list(),
    queryFn: () => receivablesService.list()
  });
}

export function useReceivablesByClient() {
  return useQuery({
    queryKey: receivableQueryKeys.byClient(),
    queryFn: () => receivablesService.listByClient()
  });
}

export function useReceivableClientDetail(clienteId: string | undefined) {
  return useQuery({
    queryKey: receivableQueryKeys.clientDetail(clienteId ?? ""),
    queryFn: () => receivablesService.getClientDetail(clienteId ?? ""),
    enabled: Boolean(clienteId)
  });
}

export function useCreateReceivable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReceivablePayload) =>
      receivablesService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: receivableQueryKeys.all
      });
    }
  });
}

export function useRegisterPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload
    }: {
      id: string;
      payload: RegisterPaymentPayload;
    }) => receivablesService.registerPayment(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: receivableQueryKeys.all
      });
    }
  });
}

export function useUpdateReceivable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload
    }: {
      id: string;
      payload: UpdateReceivablePayload;
    }) => receivablesService.update(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: receivableQueryKeys.all
      });
    }
  });
}

export function useDeleteReceivable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => receivablesService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: receivableQueryKeys.all
      });
    }
  });
}
