export type DashboardPeriodMode = "month" | "year" | "range";

export type DashboardMonthPeriod = {
  mode: "month";
  month: number;
  year: number;
};

export type DashboardYearPeriod = {
  mode: "year";
  year: number;
};

export type DashboardRangePeriod = {
  mode: "range";
  startDate: string;
  endDate: string;
};

export type DashboardPeriodFilter =
  | DashboardMonthPeriod
  | DashboardYearPeriod
  | DashboardRangePeriod;

export type DashboardPeriodQuery = {
  mes?: number;
  ano?: number;
  dataInicial?: string;
  dataFinal?: string;
  limiteRankings?: number;
  tiposGraficos?: string[];
  tiposAlertas?: string[];
};

export type DashboardAppliedFilter = {
  tipoFiltro: string;
  dataInicial: string;
  dataFinal: string;
  dataReferencia: string;
  mes?: number | null;
  ano?: number | null;
  precedenciaAplicada: string;
};

export type IncompleteDataNotice = {
  codigo: string;
  mensagem: string;
  entidadeTipo?: string | null;
  entidadeId?: string | null;
  impacto: string;
};

export type DashboardFinancialKpis = {
  filtrosAplicados: DashboardAppliedFilter;
  receitaTotal: number;
  lucroTotal: number;
  totalCompras: number;
  totalDespesas: number;
  saldoOperacional: number;
  contasReceberAbertas: number;
  valoresRecebidos: number;
  valorLucroNaoCalculavel: number;
  quantidadeItensSemCusto: number;
  saidasPeriodo?: number | null;
  caixaInicialPeriodo?: number | null;
  ajusteImplantacaoPeriodo?: number | null;
  caixaFinalPeriodo?: number | null;
  contasReceberVencidas?: number | null;
  contasReceberAVencer?: number | null;
  valorEstoqueAoCusto?: number | null;
  valorEstoqueAoPrecoVenda?: number | null;
  valorMercadoriasEmTransitoAoCusto?: number | null;
  motivoValorMercadoriasEmTransitoAoCustoIndisponivel?: string | null;
  valorMercadoriasEmTransitoAoPrecoVenda?: number | null;
  motivoValorMercadoriasEmTransitoAoPrecoVendaIndisponivel?: string | null;
  lucroPotencialEstoque?: number | null;
  quantidadeEstoqueSemCusto?: number | null;
  valorVendaEstoqueSemCusto?: number | null;
  valorTotalRealistaOperacao?: number | null;
  valorTotalPotencialOperacao?: number | null;
  avisos: IncompleteDataNotice[];
};

export type DashboardOperationalSummary = {
  filtrosAplicados: DashboardAppliedFilter;
  produtosCadastrados: number;
  estoqueDisponivelTotal: number;
  mercadoriasEmTransitoQuantidade: number;
  mercadoriasEmTransitoValor: number;
  mercadoriasEmTransitoValorCusto?: number | null;
  mercadoriasEmTransitoValorCustoCompleto: boolean;
  motivoMercadoriasEmTransitoValorCustoIndisponivel?: string | null;
  mercadoriasEmTransitoValorVenda?: number | null;
  motivoMercadoriasEmTransitoValorVendaIndisponivel?: string | null;
  comprasEmAberto: number;
  produtosPendentesRecebimento: number;
  perdasRegistradasQuantidade: number;
  perdasRegistradasValor: number;
  quantidadeVendas: number;
  quantidadeCompras: number;
};

export type DashboardProductRanking = {
  tipoRanking: string;
  posicao: number;
  produtoId: string;
  produtoNome: string;
  quantidade: number;
  valorFinanceiro?: number | null;
  criterioOrdenacao: string;
  aviso?: IncompleteDataNotice | null;
};

export type DashboardCustomerRanking = {
  tipoRanking: string;
  posicao: number;
  clienteId: string;
  clienteNome: string;
  quantidade: number;
  valorFinanceiro?: number | null;
  criterioOrdenacao: string;
  aviso?: IncompleteDataNotice | null;
};

export type DashboardRanking =
  | DashboardProductRanking
  | DashboardCustomerRanking;

export type DashboardRankings = {
  filtrosAplicados: DashboardAppliedFilter;
  rankings: DashboardRanking[];
  avisos: IncompleteDataNotice[];
};

export type DashboardAlert = {
  tipoAlerta: string;
  severidade: string;
  entidadeTipo: string;
  entidadeId: string;
  entidadeNome: string;
  motivo: string;
  valorAtual: number;
  limiteAplicado: number;
  dataReferencia: string;
};

export type DashboardAlerts = {
  filtrosAplicados: DashboardAppliedFilter;
  alertas: DashboardAlert[];
  resumo?: DashboardAlertsSummary | null;
};

export type DashboardGroupedCount = {
  chave: string;
  quantidade: number;
};

export type DashboardAlertsSummary = {
  total: number;
  porSeveridade: DashboardGroupedCount[];
  porTipo: DashboardGroupedCount[];
};

export type DashboardChartPoint = {
  periodo: string;
  rotulo: string;
  valor: number;
  quantidade?: number | null;
  categoria?: string | null;
};

export type DashboardChartSeries = {
  tipoGrafico: string;
  nomeSerie: string;
  granularidade: string;
  unidade: string;
  pontos: DashboardChartPoint[];
  totalConsolidado: number;
};

export type DashboardCharts = {
  filtrosAplicados: DashboardAppliedFilter;
  graficos: DashboardChartSeries[];
  avisos: IncompleteDataNotice[];
};

export type DashboardFinancialSnapshot = {
  totalRecebido: number;
  totalAReceber: number;
  totalCompras: number;
  totalDespesas: number;
  caixaAtual: number;
  lucroReal: number;
};

export type DashboardManagementSummary = {
  filtrosAplicados: DashboardAppliedFilter;
  financeiro?: DashboardFinancialKpis | null;
  operacional?: DashboardOperationalSummary | null;
  rankings: DashboardRanking[];
  alertas: DashboardAlert[];
  graficos: DashboardChartSeries[];
  avisos: IncompleteDataNotice[];
};
