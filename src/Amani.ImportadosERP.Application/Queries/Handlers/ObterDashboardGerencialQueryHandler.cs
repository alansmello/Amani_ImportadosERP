using MediatR;
using Amani.ImportadosERP.Application.DTOs.Dashboards;
using Amani.ImportadosERP.Application.Services;

namespace Amani.ImportadosERP.Application.Queries.Handlers;

public sealed class ObterDashboardGerencialQueryHandler
    : IRequestHandler<ObterDashboardGerencialQuery, DashboardGerencialDto>
{
    private readonly IMediator _mediator;
    private readonly DashboardFiltroService _filtroService;

    public ObterDashboardGerencialQueryHandler(
        IMediator mediator,
        DashboardFiltroService filtroService)
    {
        _mediator = mediator;
        _filtroService = filtroService;
    }

    public async Task<DashboardGerencialDto> Handle(
        ObterDashboardGerencialQuery request,
        CancellationToken cancellationToken)
    {
        if (request.LimiteRankings.HasValue && request.LimiteRankings.Value <= 0)
        {
            throw new ArgumentException("LimiteRankings deve ser maior que zero", nameof(request.LimiteRankings));
        }

        var filtroBase = new DashboardFiltroDto
        {
            DataInicial = request.DataInicial,
            DataFinal = request.DataFinal,
            Mes = request.Mes,
            Ano = request.Ano
        };

        var filtrosAplicados = _filtroService.Normalizar(filtroBase);

        // EF Core DbContext é Scoped e não é thread-safe: execução sequencial obrigatória
        var financeiro = await _mediator.Send(new ObterDashboardFinanceiroGerencialQuery
        {
            DataInicial = request.DataInicial,
            DataFinal = request.DataFinal,
            Mes = request.Mes,
            Ano = request.Ano
        }, cancellationToken);

        var operacional = await _mediator.Send(new ObterDashboardOperacionalQuery
        {
            DataInicial = request.DataInicial,
            DataFinal = request.DataFinal,
            Mes = request.Mes,
            Ano = request.Ano
        }, cancellationToken);

        var rankings = await _mediator.Send(new ObterDashboardRankingsQuery
        {
            DataInicial = request.DataInicial,
            DataFinal = request.DataFinal,
            Mes = request.Mes,
            Ano = request.Ano,
            LimiteRankings = request.LimiteRankings
        }, cancellationToken);

        var alertas = await _mediator.Send(new ObterDashboardAlertasQuery
        {
            DataInicial = request.DataInicial,
            DataFinal = request.DataFinal,
            Mes = request.Mes,
            Ano = request.Ano,
            TiposAlertas = request.TiposAlertas
        }, cancellationToken);

        var graficos = await _mediator.Send(new ObterDashboardGraficosQuery
        {
            DataInicial = request.DataInicial,
            DataFinal = request.DataFinal,
            Mes = request.Mes,
            Ano = request.Ano,
            TiposGraficos = request.TiposGraficos
        }, cancellationToken);

        var avisos = financeiro.Avisos
            .Concat(rankings.Avisos)
            .Concat(graficos.Avisos)
            .ToArray();

        return new DashboardGerencialDto
        {
            FiltrosAplicados = filtrosAplicados,
            Financeiro = financeiro,
            Operacional = operacional,
            Rankings = rankings.Rankings,
            Alertas = alertas.Alertas,
            ResumoAlertas = alertas.Resumo,
            Graficos = graficos.Graficos,
            Avisos = avisos
        };
    }
}
