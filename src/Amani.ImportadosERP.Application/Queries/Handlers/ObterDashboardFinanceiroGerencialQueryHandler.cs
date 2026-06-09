using MediatR;
using Amani.ImportadosERP.Application.DTOs.Dashboards;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Application.Services;

namespace Amani.ImportadosERP.Application.Queries.Handlers;

public sealed class ObterDashboardFinanceiroGerencialQueryHandler
    : IRequestHandler<ObterDashboardFinanceiroGerencialQuery, DashboardFinanceiroGerencialDto>
{
    private readonly IDashboardFinanceiroRepository _repository;
    private readonly DashboardFiltroService _filtroService;

    public ObterDashboardFinanceiroGerencialQueryHandler(
        IDashboardFinanceiroRepository repository,
        DashboardFiltroService filtroService)
    {
        _repository = repository;
        _filtroService = filtroService;
    }

    public async Task<DashboardFinanceiroGerencialDto> Handle(
        ObterDashboardFinanceiroGerencialQuery request,
        CancellationToken cancellationToken)
    {
        var filtros = _filtroService.Normalizar(request.ToFiltro());

        var receitaTotal = await _repository.ObterReceitaTotalAsync(filtros.DataInicial, filtros.DataFinal);
        var itensVendidos = await _repository.ObterItensVendidosComCustoAsync(
            filtros.DataInicial,
            filtros.DataFinal,
            filtros.DataReferencia);
        var totalCompras = await _repository.ObterTotalComprasAsync(filtros.DataInicial, filtros.DataFinal);
        var totalDespesas = await _repository.ObterTotalDespesasAsync(filtros.DataInicial, filtros.DataFinal);
        var contasReceberAbertas = await _repository.ObterContasReceberAbertasAsync(filtros.DataReferencia);
        var valoresRecebidos = await _repository.ObterValoresRecebidosAsync(filtros.DataInicial, filtros.DataFinal);

        var custoCalculavel = itensVendidos
            .Where(i => i.CustoMedio.HasValue)
            .Sum(i => i.CustoMedio!.Value * i.Quantidade);

        var receitaCalculavel = itensVendidos
            .Where(i => i.CustoMedio.HasValue)
            .Sum(i => i.ValorLiquidoItem);

        var valorLucroNaoCalculavel = itensVendidos
            .Where(i => !i.CustoMedio.HasValue)
            .Sum(i => i.ValorLiquidoItem);

        var quantidadeItensSemCusto = itensVendidos.Count(i => !i.CustoMedio.HasValue);
        var lucroTotal = receitaCalculavel - custoCalculavel;
        var saldoOperacional = valoresRecebidos - totalCompras - totalDespesas;

        var avisos = CriarAvisosDeCustoAusente(itensVendidos, valorLucroNaoCalculavel);

        return new DashboardFinanceiroGerencialDto
        {
            FiltrosAplicados = filtros,
            ReceitaTotal = receitaTotal,
            LucroTotal = lucroTotal,
            TotalCompras = totalCompras,
            TotalDespesas = totalDespesas,
            SaldoOperacional = saldoOperacional,
            ContasReceberAbertas = contasReceberAbertas,
            ValoresRecebidos = valoresRecebidos,
            ValorLucroNaoCalculavel = valorLucroNaoCalculavel,
            QuantidadeItensSemCusto = quantidadeItensSemCusto,
            Avisos = avisos
        };
    }

    private static IReadOnlyCollection<AvisoDadoIncompletoDto> CriarAvisosDeCustoAusente(
        IReadOnlyCollection<DashboardVendaCustoDto> itensVendidos,
        decimal valorLucroNaoCalculavel)
    {
        var produtosSemCusto = itensVendidos
            .Where(i => !i.CustoMedio.HasValue)
            .Select(i => i.ProdutoId)
            .Distinct()
            .ToList();

        if (!produtosSemCusto.Any())
        {
            return Array.Empty<AvisoDadoIncompletoDto>();
        }

        return new[]
        {
            new AvisoDadoIncompletoDto
            {
                Codigo = "CUSTO_MEDIO_AUSENTE",
                Mensagem = "Existem itens vendidos sem custo medio derivado de entradas reais em estoque.",
                EntidadeTipo = "Produto",
                Impacto = $"Lucro possui R$ {valorLucroNaoCalculavel:N2} de receita sem custo calculavel em {produtosSemCusto.Count} produto(s)."
            }
        };
    }
}
