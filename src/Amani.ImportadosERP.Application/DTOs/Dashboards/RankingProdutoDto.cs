namespace Amani.ImportadosERP.Application.DTOs.Dashboards;

public sealed class RankingProdutoDto
{
    public string TipoRanking { get; set; } = string.Empty;
    public int Posicao { get; set; }
    public Guid ProdutoId { get; set; }
    public string ProdutoNome { get; set; } = string.Empty;
    public int Quantidade { get; set; }
    public decimal? ValorFinanceiro { get; set; }
    public string CriterioOrdenacao { get; set; } = string.Empty;
    public AvisoDadoIncompletoDto? Aviso { get; set; }
}

public sealed class DashboardRankingsDto
{
    public DashboardFiltroAplicadoDto FiltrosAplicados { get; set; } = new();
    public IReadOnlyCollection<object> Rankings { get; set; } = Array.Empty<object>();
    public IReadOnlyCollection<AvisoDadoIncompletoDto> Avisos { get; set; } = Array.Empty<AvisoDadoIncompletoDto>();
}
