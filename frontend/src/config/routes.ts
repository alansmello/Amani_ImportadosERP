export const routes = {
  login: "/login",
  dashboard: "/",
  clientes: "/clientes",
  clientesNovo: "/clientes/novo",
  fornecedores: "/fornecedores",
  fornecedoresNovo: "/fornecedores/novo",
  produtos: "/produtos",
  produtosNovo: "/produtos/novo",
  compras: "/compras",
  comprasNova: "/compras/nova",
  vendas: "/vendas",
  vendasNova: "/vendas/nova",
  estoque: "/estoque",
  financeiro: "/financeiro",
  contasReceber: "/financeiro/contas-receber",
  contasReceberNova: "/financeiro/contas-receber/nova",
  despesas: "/financeiro/despesas",
  despesasNova: "/financeiro/despesas/nova",
  despesasCategorias: "/financeiro/despesas/categorias",
  despesasOperadora: "/financeiro/despesas-operadora",
  configuracoes: "/configuracoes",
  configuracoesFormasPagamento: "/configuracoes/formas-pagamento",
  configuracoesImplantacao: "/configuracoes/implantacao"
} as const;

export type AppRouteKey = keyof typeof routes;
export type AppRoute = (typeof routes)[AppRouteKey];

export function compraDetalhe(id: string) {
  return `/compras/${id}` as const;
}

export function clienteDetalhe(id: string) {
  return `/clientes/${id}` as const;
}

export function clienteEditar(id: string) {
  return `/clientes/${id}/editar` as const;
}

export function fornecedorDetalhe(id: string) {
  return `/fornecedores/${id}` as const;
}

export function fornecedorEditar(id: string) {
  return `/fornecedores/${id}/editar` as const;
}

export function produtoDetalhe(id: string) {
  return `/produtos/${id}` as const;
}

export function produtoEditar(id: string) {
  return `/produtos/${id}/editar` as const;
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
