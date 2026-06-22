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
  contasReceber: "/financeiro/contas-receber",
  contasReceberNova: "/financeiro/contas-receber/nova",
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

export function contaReceberEditar(id: string) {
  return `/financeiro/contas-receber/${id}/editar` as const;
}

export function contaReceberClienteDetalhe(clienteId: string) {
  return `/financeiro/contas-receber/cliente/${clienteId}` as const;
}
