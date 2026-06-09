using Amani.ImportadosERP.Application.DTOs.Dashboards;
using MediatR;

namespace Amani.ImportadosERP.Application.Queries;

public sealed class ObterDashboardGraficosQuery : IRequest<DashboardGraficosDto>
{
    public DateTime? DataInicial { get; set; }
    public DateTime? DataFinal { get; set; }
    public int? Mes { get; set; }
    public int? Ano { get; set; }
    public IReadOnlyCollection<string> TiposGraficos { get; set; } = Array.Empty<string>();

    public DashboardFiltroDto ToFiltro()
    {
        return new DashboardFiltroDto
        {
            DataInicial = DataInicial,
            DataFinal = DataFinal,
            Mes = Mes,
            Ano = Ano,
            TiposGraficos = TiposGraficos
        };
    }
}
