namespace Amani.ImportadosERP.Application.DTOs.Dashboards;

public sealed class AlertaGerencialDto
{
    public string TipoAlerta { get; set; } = string.Empty;
    public string Severidade { get; set; } = string.Empty;
    public string EntidadeTipo { get; set; } = string.Empty;
    public Guid EntidadeId { get; set; }
    public string EntidadeNome { get; set; } = string.Empty;
    public string Motivo { get; set; } = string.Empty;
    public decimal ValorAtual { get; set; }
    public decimal LimiteAplicado { get; set; }
    public DateTime DataReferencia { get; set; }
}

public sealed class DashboardAlertasDto
{
    public DashboardFiltroAplicadoDto FiltrosAplicados { get; set; } = new();
    public IReadOnlyCollection<AlertaGerencialDto> Alertas { get; set; } = Array.Empty<AlertaGerencialDto>();
}
