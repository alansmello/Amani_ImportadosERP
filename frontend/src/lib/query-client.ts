"use client";

import { QueryClient } from "@tanstack/react-query";

// Query hooks futuros devem compor chaves a partir destes prefixos por modulo.
// Regras de negocio, agregacoes e metricas permanecem no backend.
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

// Convenção: service modules retornam dados ja contratados pela API; query hooks
// apenas orquestram cache/loading/error e nao calculam indicadores operacionais.
export const queryKeys = {
  dashboard: ["dashboard"] as const,
  clientes: ["clientes"] as const,
  fornecedores: ["fornecedores"] as const,
  produtos: ["produtos"] as const,
  compras: ["compras"] as const,
  vendas: ["vendas"] as const,
  estoque: ["estoque"] as const,
  financeiro: ["financeiro"] as const,
  despesasOperadora: ["despesas-operadora"] as const,
  formasPagamento: ["formas-pagamento"] as const,
  implantacao: ["implantacao"] as const,
  configuracoes: ["configuracoes"] as const
};
