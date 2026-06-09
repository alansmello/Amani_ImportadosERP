using MediatR;
using Amani.ImportadosERP.Application.DTOs.Dashboards;

namespace Amani.ImportadosERP.Application.Queries;

public sealed class ObterDashboardRankingsQuery : IRequest<DashboardRankingsDto>
{
    public DateTime? DataInicial { get; set; }
    public DateTime? DataFinal { get; set; }
    public int? Mes { get; set; }
    public int? Ano { get; set; }
    public int? LimiteRankings { get; set; }

    public DashboardFiltroDto ToFiltro()
    {
        return new DashboardFiltroDto
        {
            DataInicial = DataInicial,
            DataFinal = DataFinal,
            Mes = Mes,
            Ano = Ano,
            LimiteRankings = LimiteRankings
        };
    }
}
