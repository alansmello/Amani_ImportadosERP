"use client";

import { useQuery } from "@tanstack/react-query";

import { suppliersService } from "@/services/suppliers";

export const supplierQueryKeys = {
  all: ["fornecedores"] as const,
  list: ["fornecedores", "list"] as const
};

export function useSuppliers() {
  return useQuery({
    queryKey: supplierQueryKeys.list,
    queryFn: suppliersService.list
  });
}
