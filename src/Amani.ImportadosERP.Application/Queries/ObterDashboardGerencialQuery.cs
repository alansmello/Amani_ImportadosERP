using MediatR;
using Amani.ImportadosERP.Application.DTOs.Dashboards;

namespace Amani.ImportadosERP.Application.Queries;

public sealed class ObterDashboardGerencialQuery : IRequest<DashboardGerencialDto>
{
    public DateTime? DataInicial { get; set; }
    public DateTime? DataFinal { get; set; }
    public int? Mes { get; set; }
    public int? Ano { get; set; }
    public int? LimiteRankings { get; set; }
    public IReadOnlyCollection<string> TiposGraficos { get; set; } = Array.Empty<string>();
    public IReadOnlyCollection<string> TiposAlertas { get; set; } = Array.Empty<string>();
}
