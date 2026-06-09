"use client";

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000
    },
    mutations: {
      retry: 0
    }
  }
});

export const queryKeys = {
  dashboard: ["dashboard"] as const,
  clientes: ["clientes"] as const,
  produtos: ["produtos"] as const,
  compras: ["compras"] as const,
  vendas: ["vendas"] as const,
  estoque: ["estoque"] as const,
  financeiro: ["financeiro"] as const,
  configuracoes: ["configuracoes"] as const
};
