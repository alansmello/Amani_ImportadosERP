using MediatR;
using Amani.ImportadosERP.Application.DTOs.Dashboards;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Application.Services;

namespace Amani.ImportadosERP.Application.Queries.Handlers;

public sealed class ObterDashboardOperacionalQueryHandler
    : IRequestHandler<ObterDashboardOperacionalQuery, DashboardOperacionalDto>
{
    private readonly IDashboardOperacionalRepository _repository;
    private readonly DashboardFiltroService _filtroService;

    public ObterDashboardOperacionalQueryHandler(
        IDashboardOperacionalRepository repository,
        DashboardFiltroService filtroService)
    {
        _repository = repository;
        _filtroService = filtroService;
    }

    public async Task<DashboardOperacionalDto> Handle(
        ObterDashboardOperacionalQuery request,
        CancellationToken cancellationToken)
    {
        var filtros = _filtroService.Normalizar(request.ToFiltro());

        var produtosCadastrados = await _repository.ObterProdutosCadastradosAsync(filtros.DataReferencia);
        var estoqueDisponivelTotal = await _repository.ObterEstoqueDisponivelTotalAsync(filtros.DataReferencia);
        var mercadoriasEmTransito = await _repository.ObterMercadoriasEmTransitoAsync(filtros.DataReferencia);
        var comprasEmAberto = await _repository.ObterComprasEmAbertoAsync(filtros.DataReferencia);
        var produtosPendentesRecebimento = await _repository.ObterProdutosPendentesRecebimentoAsync(filtros.DataReferencia);
        var perdasRegistradas = await _repository.ObterPerdasRegistradasAsync(filtros.DataInicial, filtros.DataFinal);
        var recuperacao = await _repository.ObterRecuperacaoOperacionalAsync(
            filtros.DataInicial,
            filtros.DataFinal,
            filtros.DataReferencia);
        var quantidadeVendas = await _repository.ObterQuantidadeVendasAsync(filtros.DataInicial, filtros.DataFinal);
        var quantidadeCompras = await _repository.ObterQuantidadeComprasAsync(filtros.DataInicial, filtros.DataFinal);

        return new DashboardOperacionalDto
        {
            FiltrosAplicados = filtros,
            ProdutosCadastrados = produtosCadastrados,
            EstoqueDisponivelTotal = estoqueDisponivelTotal,
            MercadoriasEmTransitoQuantidade = mercadoriasEmTransito.QuantidadePendente,
            MercadoriasEmTransitoValor = mercadoriasEmTransito.SubtotalCalculavelAoCusto,
            MercadoriasEmTransitoValorCusto = mercadoriasEmTransito.ValorAoCusto,
            MercadoriasEmTransitoValorCustoCompleto = mercadoriasEmTransito.ValorAoCustoCompleto,
            MotivoMercadoriasEmTransitoValorCustoIndisponivel = mercadoriasEmTransito.MotivoValorAoCustoIndisponivel,
            MercadoriasEmTransitoValorVenda = mercadoriasEmTransito.ValorAoPrecoVenda,
            MotivoMercadoriasEmTransitoValorVendaIndisponivel = mercadoriasEmTransito.MotivoValorAoPrecoVendaIndisponivel,
            ComprasEmAberto = comprasEmAberto,
            ProdutosPendentesRecebimento = produtosPendentesRecebimento,
            PerdasRegistradasQuantidade = perdasRegistradas.Quantidade,
            PerdasRegistradasValor = perdasRegistradas.Valor,
            DevolucoesRegistradasQuantidade = recuperacao.DevolucoesQuantidade,
            DevolucoesRegistradasValor = recuperacao.DevolucoesValor,
            ValorBrutoOcorrencias = recuperacao.ValorBrutoOcorrencias,
            ValorRecuperadoAssociado = recuperacao.ValorRecuperadoAssociado,
            PrejuizoLiquidoNaoRecuperado = recuperacao.PrejuizoLiquidoNaoRecuperado,
            QuantidadeVendas = quantidadeVendas,
            QuantidadeCompras = quantidadeCompras
        };
    }
}
