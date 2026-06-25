using MediatR;
using Amani.ImportadosERP.Application.DTOs.Dashboards;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Application.Services;

namespace Amani.ImportadosERP.Application.Queries.Handlers;

public sealed class ObterDashboardRankingsQueryHandler
    : IRequestHandler<ObterDashboardRankingsQuery, DashboardRankingsDto>
{
    private const int LimitePadrao = 10;

    private readonly IDashboardRankingRepository _repository;
    private readonly DashboardFiltroService _filtroService;

    public ObterDashboardRankingsQueryHandler(
        IDashboardRankingRepository repository,
        DashboardFiltroService filtroService)
    {
        _repository = repository;
        _filtroService = filtroService;
    }

    public async Task<DashboardRankingsDto> Handle(
        ObterDashboardRankingsQuery request,
        CancellationToken cancellationToken)
    {
        var filtros = _filtroService.Normalizar(request.ToFiltro());
        var limite = NormalizarLimite(request.LimiteRankings);

        var maisVendidos = await _repository.ObterProdutosMaisVendidosAsync(
            filtros.DataInicial,
            filtros.DataFinal,
            limite);

        var maisLucrativos = await _repository.ObterProdutosMaisLucrativosAsync(
            filtros.DataInicial,
            filtros.DataFinal,
            filtros.DataReferencia,
            limite);

        var maiorEstoque = await _repository.ObterProdutosComMaiorEstoqueAsync(
            filtros.DataReferencia,
            limite);

        var menorEstoque = await _repository.ObterProdutosComMenorEstoqueAsync(
            filtros.DataReferencia,
            limite);

        var clientesMaiorFaturamento = await _repository.ObterClientesMaisValiososAsync(
            filtros.DataInicial,
            filtros.DataFinal,
            limite);

        return new DashboardRankingsDto
        {
            FiltrosAplicados = filtros,
            Rankings = maisVendidos
                .Cast<object>()
                .Concat(maisLucrativos.Rankings)
                .Concat(maiorEstoque)
                .Concat(menorEstoque)
                .Concat(clientesMaiorFaturamento)
                .ToList(),
            Avisos = maisLucrativos.Avisos
        };
    }

    private static int NormalizarLimite(int? limite)
    {
        if (!limite.HasValue)
        {
            return LimitePadrao;
        }

        if (limite.Value <= 0)
        {
            throw new ArgumentException("LimiteRankings deve ser maior que zero", nameof(limite));
        }

        return limite.Value;
    }
}
