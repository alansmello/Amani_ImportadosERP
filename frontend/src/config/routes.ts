export const routes = {
  dashboard: "/",
  clientes: "/clientes",
  fornecedores: "/fornecedores",
  produtos: "/produtos",
  compras: "/compras",
  comprasNova: "/compras/nova",
  vendas: "/vendas",
  vendasNova: "/vendas/nova",
  estoque: "/estoque",
  financeiro: "/financeiro",
  configuracoes: "/configuracoes",
  configuracoesImplantacao: "/configuracoes/implantacao"
} as const;

export type AppRouteKey = keyof typeof routes;
export type AppRoute = (typeof routes)[AppRouteKey];

export function compraDetalhe(id: string) {
  return `/compras/${id}` as const;
}

export function vendasNova() {
  return routes.vendasNova;
}

export function vendaDetalhe(id: string) {
  return `/vendas/${id}` as const;
}

export function estoqueDetalhe(produtoId: string) {
  return `/estoque/${produtoId}` as const;
}
