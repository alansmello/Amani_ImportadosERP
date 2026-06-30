namespace Amani.ImportadosERP.Application.DTOs.Dashboards;

public sealed class DashboardGerencialDto
{
    public DashboardFiltroAplicadoDto FiltrosAplicados { get; set; } = new();
    public DashboardFinanceiroGerencialDto? Financeiro { get; set; }
    public DashboardOperacionalDto? Operacional { get; set; }
    public IReadOnlyCollection<object> Rankings { get; set; } = Array.Empty<object>();
    public IReadOnlyCollection<AlertaGerencialDto> Alertas { get; set; } = Array.Empty<AlertaGerencialDto>();
    public DashboardAlertasResumoDto? ResumoAlertas { get; set; }
    public IReadOnlyCollection<SerieGraficaDto> Graficos { get; set; } = Array.Empty<SerieGraficaDto>();
    public IReadOnlyCollection<AvisoDadoIncompletoDto> Avisos { get; set; } = Array.Empty<AvisoDadoIncompletoDto>();
}
