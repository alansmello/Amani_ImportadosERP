namespace Amani.ImportadosERP.Application.DTOs.Dashboards;

public sealed class DashboardGerencialDto
{
    public DashboardFiltroAplicadoDto FiltrosAplicados { get; set; } = new();
    public DashboardFinanceiroGerencialDto? Financeiro { get; set; }
    public DashboardOperacionalDto? Operacional { get; set; }
    public IReadOnlyCollection<RankingProdutoDto> Rankings { get; set; } = Array.Empty<RankingProdutoDto>();
    public IReadOnlyCollection<AlertaGerencialDto> Alertas { get; set; } = Array.Empty<AlertaGerencialDto>();
    public IReadOnlyCollection<SerieGraficaDto> Graficos { get; set; } = Array.Empty<SerieGraficaDto>();
    public IReadOnlyCollection<AvisoDadoIncompletoDto> Avisos { get; set; } = Array.Empty<AvisoDadoIncompletoDto>();
}
