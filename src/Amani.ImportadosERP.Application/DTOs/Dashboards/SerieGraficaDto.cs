namespace Amani.ImportadosERP.Application.DTOs.Dashboards;

public sealed class SerieGraficaDto
{
    public string TipoGrafico { get; set; } = string.Empty;
    public string NomeSerie { get; set; } = string.Empty;
    public string Granularidade { get; set; } = string.Empty;
    public string Unidade { get; set; } = string.Empty;
    public IReadOnlyCollection<PontoGraficoDto> Pontos { get; set; } = Array.Empty<PontoGraficoDto>();
    public decimal TotalConsolidado { get; set; }
}

public sealed class PontoGraficoDto
{
    public DateTime Periodo { get; set; }
    public string Rotulo { get; set; } = string.Empty;
    public decimal Valor { get; set; }
    public decimal? Quantidade { get; set; }
    public string? Categoria { get; set; }
}

public sealed class DashboardGraficosDto
{
    public DashboardFiltroAplicadoDto FiltrosAplicados { get; set; } = new();
    public IReadOnlyCollection<SerieGraficaDto> Graficos { get; set; } = Array.Empty<SerieGraficaDto>();
    public IReadOnlyCollection<AvisoDadoIncompletoDto> Avisos { get; set; } = Array.Empty<AvisoDadoIncompletoDto>();
}
