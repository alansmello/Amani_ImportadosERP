using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Application.Queries;
using Amani.ImportadosERP.Application.Services;

namespace Amani.ImportadosERP.Application.Queries.Handlers;

public sealed class ObterDashboardFinanceiroQueryHandler : IRequestHandler<ObterDashboardFinanceiroQuery, DashboardFinanceiroDto>
{
    private readonly IDashboardFinanceiroRepository _repository;
    private readonly DashboardFiltroService _filtroService;

    public ObterDashboardFinanceiroQueryHandler(
        IDashboardFinanceiroRepository repository,
        DashboardFiltroService filtroService)
    {
        _repository = repository;
        _filtroService = filtroService;
    }

    public async Task<DashboardFinanceiroDto> Handle(ObterDashboardFinanceiroQuery request, CancellationToken cancellationToken)
    {
        var filtros = _filtroService.Normalizar(new());
        var totalRecebido = await _repository.ObterValoresRecebidosAsync(filtros.DataInicial, filtros.DataFinal);
        var reembolsosCompras = await _repository.ObterReembolsosComprasLiquidosAsync(filtros.DataInicial, filtros.DataFinal);
        var entradasCaixa = totalRecebido + reembolsosCompras;
        var totalAReceber = await _repository.ObterContasReceberAbertasAsync(filtros.DataReferencia);
        var totalCompras = await _repository.ObterTotalComprasAsync(filtros.DataInicial, filtros.DataFinal);
        var totalDespesas = await _repository.ObterTotalDespesasAsync(filtros.DataInicial, filtros.DataFinal);
        var itensVendidos = await _repository.ObterItensVendidosComCustoAsync(
            filtros.DataInicial,
            filtros.DataFinal,
            filtros.DataReferencia);

        var custoCalculavel = itensVendidos
            .Where(i => i.CustoMedio.HasValue)
            .Sum(i => i.CustoMedio!.Value * i.Quantidade);

        var receitaCalculavel = itensVendidos
            .Where(i => i.CustoMedio.HasValue)
            .Sum(i => i.ValorLiquidoItem);

        var receitaTotal = await _repository.ObterReceitaTotalAsync(filtros.DataInicial, filtros.DataFinal);
        var caixaAtual = entradasCaixa - totalCompras - totalDespesas;
        var lucroReal = receitaCalculavel - custoCalculavel;

        return new DashboardFinanceiroDto
        {
            TotalRecebido = totalRecebido,
            ReembolsosComprasPeriodo = reembolsosCompras,
            EntradasCaixaPeriodo = entradasCaixa,
            TotalAReceber = totalAReceber,
            TotalCompras = totalCompras,
            TotalDespesas = totalDespesas,
            CaixaAtual = caixaAtual,
            LucroReal = lucroReal
        };
    }
}
