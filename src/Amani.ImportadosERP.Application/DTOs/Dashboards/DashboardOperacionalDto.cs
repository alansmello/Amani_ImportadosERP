namespace Amani.ImportadosERP.Application.DTOs.Dashboards;

public sealed class DashboardOperacionalDto
{
    public DashboardFiltroAplicadoDto FiltrosAplicados { get; set; } = new();
    public int ProdutosCadastrados { get; set; }
    public decimal EstoqueDisponivelTotal { get; set; }
    public int MercadoriasEmTransitoQuantidade { get; set; }
    public decimal MercadoriasEmTransitoValor { get; set; }
    public decimal? MercadoriasEmTransitoValorCusto { get; set; }
    public bool MercadoriasEmTransitoValorCustoCompleto { get; set; }
    public string? MotivoMercadoriasEmTransitoValorCustoIndisponivel { get; set; }
    public decimal? MercadoriasEmTransitoValorVenda { get; set; }
    public string? MotivoMercadoriasEmTransitoValorVendaIndisponivel { get; set; }
    public int ComprasEmAberto { get; set; }
    public int ProdutosPendentesRecebimento { get; set; }
    public int PerdasRegistradasQuantidade { get; set; }
    public decimal PerdasRegistradasValor { get; set; }
    public int DevolucoesRegistradasQuantidade { get; set; }
    public decimal DevolucoesRegistradasValor { get; set; }
    public decimal ValorBrutoOcorrencias { get; set; }
    public decimal ValorRecuperadoAssociado { get; set; }
    public decimal PrejuizoLiquidoNaoRecuperado { get; set; }
    public int QuantidadeVendas { get; set; }
    public int QuantidadeCompras { get; set; }
}

public sealed class ResumoRecuperacaoOperacionalDto
{
    public int PerdasQuantidade { get; set; }
    public decimal PerdasValor { get; set; }
    public int DevolucoesQuantidade { get; set; }
    public decimal DevolucoesValor { get; set; }
    public decimal ValorBrutoOcorrencias { get; set; }
    public decimal ValorRecuperadoAssociado { get; set; }
    public decimal PrejuizoLiquidoNaoRecuperado { get; set; }
}
