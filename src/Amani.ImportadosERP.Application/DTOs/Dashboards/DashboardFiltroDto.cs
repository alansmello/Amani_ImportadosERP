namespace Amani.ImportadosERP.Application.DTOs.Dashboards;

public sealed class DashboardFiltroDto
{
    public DateTime? DataInicial { get; set; }
    public DateTime? DataFinal { get; set; }
    public int? Mes { get; set; }
    public int? Ano { get; set; }
    public int? LimiteRankings { get; set; }
    public IReadOnlyCollection<string> TiposGraficos { get; set; } = Array.Empty<string>();
    public IReadOnlyCollection<string> TiposAlertas { get; set; } = Array.Empty<string>();
}

public sealed class DashboardFiltroAplicadoDto
{
    public string TipoFiltro { get; set; } = string.Empty;
    public DateTime DataInicial { get; set; }
    public DateTime DataFinal { get; set; }
    public DateTime DataReferencia { get; set; }
    public int? Mes { get; set; }
    public int? Ano { get; set; }
    public string PrecedenciaAplicada { get; set; } = string.Empty;
}
