namespace Amani.ImportadosERP.Application.DTOs.Dashboards;

public sealed class DashboardAlertasResumoDto
{
    public int Total { get; set; }
    public IReadOnlyCollection<DashboardContagemAgrupadaDto> PorSeveridade { get; set; }
        = Array.Empty<DashboardContagemAgrupadaDto>();
    public IReadOnlyCollection<DashboardContagemAgrupadaDto> PorTipo { get; set; }
        = Array.Empty<DashboardContagemAgrupadaDto>();
}

public sealed class DashboardContagemAgrupadaDto
{
    public string Chave { get; set; } = string.Empty;
    public int Quantidade { get; set; }
}
