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
  avisos: IncompleteDataNotice[];
};

export type DashboardOperationalSummary = {
  filtrosAplicados: DashboardAppliedFilter;
  produtosCadastrados: number;
  estoqueDisponivelTotal: number;
  mercadoriasEmTransitoQuantidade: number;
  mercadoriasEmTransitoValor: number;
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
