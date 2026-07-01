namespace Amani.ImportadosERP.Application.DTOs.Dashboards;

public sealed class DashboardOperacionalDto
{
    public DashboardFiltroAplicadoDto FiltrosAplicados { get; set; } = new();
    public int ProdutosCadastrados { get; set; }
    public decimal EstoqueDisponivelTotal { get; set; }
    public int MercadoriasEmTransitoQuantidade { get; set; }
    public decimal MercadoriasEmTransitoValor { get; set; }
    public int ComprasEmAberto { get; set; }
    public int ProdutosPendentesRecebimento { get; set; }
    public int PerdasRegistradasQuantidade { get; set; }
    public decimal PerdasRegistradasValor { get; set; }
    public int QuantidadeVendas { get; set; }
    public int QuantidadeCompras { get; set; }
}
