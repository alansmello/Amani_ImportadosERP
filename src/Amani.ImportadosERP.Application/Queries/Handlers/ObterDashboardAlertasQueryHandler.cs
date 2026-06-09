using Amani.ImportadosERP.Application.DTOs.Dashboards;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Application.Services;
using MediatR;

namespace Amani.ImportadosERP.Application.Queries.Handlers;

public sealed class ObterDashboardAlertasQueryHandler
    : IRequestHandler<ObterDashboardAlertasQuery, DashboardAlertasDto>
{
    private const int LimiteEstoqueBaixo = 5;
    private const int DiasSemMovimentacao = 90;
    private const int DiasTransitoAntigo = 30;
    private const int LimitePerdasRecorrentes = 2;

    private readonly IDashboardAlertaRepository _repository;
    private readonly DashboardFiltroService _filtroService;

    public ObterDashboardAlertasQueryHandler(
        IDashboardAlertaRepository repository,
        DashboardFiltroService filtroService)
    {
        _repository = repository;
        _filtroService = filtroService;
    }

    public async Task<DashboardAlertasDto> Handle(
        ObterDashboardAlertasQuery request,
        CancellationToken cancellationToken)
    {
        var filtros = _filtroService.Normalizar(request.ToFiltro());

        var estoqueBaixo = await _repository.ObterAlertasEstoqueBaixoAsync(
            filtros.DataReferencia,
            LimiteEstoqueBaixo);

        var semMovimentacao = await _repository.ObterAlertasProdutosSemMovimentacaoAsync(
            filtros.DataReferencia,
            DiasSemMovimentacao);

        var transitoAntigo = await _repository.ObterAlertasComprasEmTransitoAntigoAsync(
            filtros.DataReferencia,
            DiasTransitoAntigo);

        var perdasRecorrentes = await _repository.ObterAlertasPerdasRecorrentesAsync(
            filtros.DataInicial,
            filtros.DataFinal,
            LimitePerdasRecorrentes);

        return new DashboardAlertasDto
        {
            FiltrosAplicados = filtros,
            Alertas = FiltrarTipos(
                    estoqueBaixo
                        .Concat(semMovimentacao)
                        .Concat(transitoAntigo)
                        .Concat(perdasRecorrentes),
                    request.TiposAlertas)
                .OrderBy(a => a.TipoAlerta)
                .ThenBy(a => a.EntidadeNome)
                .ThenBy(a => a.EntidadeId)
                .ToList()
        };
    }

    private static IEnumerable<AlertaGerencialDto> FiltrarTipos(
        IEnumerable<AlertaGerencialDto> alertas,
        IReadOnlyCollection<string>? tiposAlertas)
    {
        var tipos = (tiposAlertas ?? Array.Empty<string>())
            .Where(t => !string.IsNullOrWhiteSpace(t))
            .Select(t => t.Trim())
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        return tipos.Count == 0
            ? alertas
            : alertas.Where(a => tipos.Contains(a.TipoAlerta));
    }
}
