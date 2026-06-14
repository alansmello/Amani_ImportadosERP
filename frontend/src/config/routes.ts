export const routes = {
  dashboard: "/",
  clientes: "/clientes",
  fornecedores: "/fornecedores",
  produtos: "/produtos",
  compras: "/compras",
  vendas: "/vendas",
  estoque: "/estoque",
  financeiro: "/financeiro",
  configuracoes: "/configuracoes"
} as const;

export type AppRouteKey = keyof typeof routes;
export type AppRoute = (typeof routes)[AppRouteKey];
