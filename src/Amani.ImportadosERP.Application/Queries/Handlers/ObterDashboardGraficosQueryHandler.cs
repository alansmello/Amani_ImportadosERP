using Amani.ImportadosERP.Application.DTOs.Dashboards;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Application.Services;
using MediatR;

namespace Amani.ImportadosERP.Application.Queries.Handlers;

public sealed class ObterDashboardGraficosQueryHandler
    : IRequestHandler<ObterDashboardGraficosQuery, DashboardGraficosDto>
{
    private static readonly string[] TiposPadrao =
    {
        "ReceitaPorPeriodo",
        "LucroPorPeriodo",
        "ComprasPorPeriodo",
        "DespesasPorCategoria",
        "EvolucaoEstoque"
    };

    private readonly IDashboardGraficoRepository _repository;
    private readonly DashboardFiltroService _filtroService;

    public ObterDashboardGraficosQueryHandler(
        IDashboardGraficoRepository repository,
        DashboardFiltroService filtroService)
    {
        _repository = repository;
        _filtroService = filtroService;
    }

    public async Task<DashboardGraficosDto> Handle(
        ObterDashboardGraficosQuery request,
        CancellationToken cancellationToken)
    {
        var filtros = _filtroService.Normalizar(request.ToFiltro());
        var tipos = NormalizarTipos(request.TiposGraficos);
        var graficos = new List<SerieGraficaDto>();
        var avisos = new List<AvisoDadoIncompletoDto>();

        if (tipos.Contains("ReceitaPorPeriodo"))
        {
            graficos.Add(await _repository.ObterReceitaPorPeriodoAsync(filtros.DataInicial, filtros.DataFinal));
        }

        if (tipos.Contains("LucroPorPeriodo"))
        {
            var lucro = await _repository.ObterLucroPorPeriodoAsync(filtros.DataInicial, filtros.DataFinal);
            graficos.Add(lucro.Serie);
            avisos.AddRange(lucro.Avisos);
        }

        if (tipos.Contains("ComprasPorPeriodo"))
        {
            graficos.Add(await _repository.ObterComprasPorPeriodoAsync(filtros.DataInicial, filtros.DataFinal));
        }

        if (tipos.Contains("DespesasPorCategoria"))
        {
            graficos.Add(await _repository.ObterDespesasPorCategoriaAsync(filtros.DataInicial, filtros.DataFinal));
        }

        if (tipos.Contains("EvolucaoEstoque"))
        {
            graficos.Add(await _repository.ObterEvolucaoEstoqueAsync(filtros.DataInicial, filtros.DataFinal));
        }

        return new DashboardGraficosDto
        {
            FiltrosAplicados = filtros,
            Graficos = graficos,
            Avisos = avisos
        };
    }

    private static IReadOnlySet<string> NormalizarTipos(IReadOnlyCollection<string>? tiposGraficos)
    {
        var tipos = (tiposGraficos ?? Array.Empty<string>())
            .Where(t => !string.IsNullOrWhiteSpace(t))
            .Select(t => t.Trim())
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        return tipos.Count == 0
            ? TiposPadrao.ToHashSet(StringComparer.OrdinalIgnoreCase)
            : tipos;
    }
}
