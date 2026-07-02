using MediatR;
using Amani.ImportadosERP.Application.DTOs.Dashboards;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Application.Services;

namespace Amani.ImportadosERP.Application.Queries.Handlers;

public sealed class ObterDashboardFinanceiroGerencialQueryHandler
    : IRequestHandler<ObterDashboardFinanceiroGerencialQuery, DashboardFinanceiroGerencialDto>
{
    private readonly IDashboardFinanceiroRepository _repository;
    private readonly IDashboardEstoqueRepository _estoqueRepository;
    private readonly IDashboardOperacionalRepository _operacionalRepository;
    private readonly DashboardFiltroService _filtroService;

    public ObterDashboardFinanceiroGerencialQueryHandler(
        IDashboardFinanceiroRepository repository,
        IDashboardEstoqueRepository estoqueRepository,
        IDashboardOperacionalRepository operacionalRepository,
        DashboardFiltroService filtroService)
    {
        _repository = repository;
        _estoqueRepository = estoqueRepository;
        _operacionalRepository = operacionalRepository;
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
        var resumoRecebiveis = await _repository.ObterResumoRecebiveisAsync(filtros.DataReferencia);
        var valoresRecebidos = await _repository.ObterValoresRecebidosAsync(filtros.DataInicial, filtros.DataFinal);
        var resumoCaixa = await _repository.ObterResumoCaixaAsync(filtros.DataInicial, filtros.DataFinal);
        var estoqueValorizado = await _estoqueRepository.ObterEstoqueValorizadoAsync(filtros.DataReferencia);
        var transito = await _operacionalRepository.ObterMercadoriasEmTransitoAsync(filtros.DataReferencia);
        var saidasPeriodo = totalCompras + totalDespesas;

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
        var caixaFinal = resumoCaixa.CaixaFinal;

        var avisos = CriarAvisos(
            itensVendidos,
            valorLucroNaoCalculavel,
            estoqueValorizado.QuantidadeSemCusto,
            estoqueValorizado.ValorVendaSemCusto).ToList();

        AdicionarAvisosTransito(avisos, transito);

        decimal? valorTotalRealista = transito.ValorAoCusto.HasValue
                ? caixaFinal + resumoRecebiveis.Abertas
                    + estoqueValorizado.ValorAoCusto
                    + transito.ValorAoCusto.Value
                : null;
        decimal? valorTotalPotencial = transito.ValorAoPrecoVenda.HasValue
                ? caixaFinal + resumoRecebiveis.Abertas
                    + estoqueValorizado.ValorAoPrecoVenda
                    + transito.ValorAoPrecoVenda.Value
                : null;

        return new DashboardFinanceiroGerencialDto
        {
            FiltrosAplicados = filtros,
            ReceitaTotal = receitaTotal,
            LucroTotal = lucroTotal,
            TotalCompras = totalCompras,
            TotalDespesas = totalDespesas,
            SaldoOperacional = saldoOperacional,
            ContasReceberAbertas = resumoRecebiveis.Abertas,
            ValoresRecebidos = valoresRecebidos,
            ValorLucroNaoCalculavel = valorLucroNaoCalculavel,
            QuantidadeItensSemCusto = quantidadeItensSemCusto,
            SaidasPeriodo = saidasPeriodo,
            CaixaInicialPeriodo = resumoCaixa.CaixaInicial,
            AjusteImplantacaoPeriodo = resumoCaixa.AjusteImplantacao,
            CaixaFinalPeriodo = caixaFinal,
            ContasReceberVencidas = resumoRecebiveis.Vencidas,
            ContasReceberAVencer = resumoRecebiveis.AVencer,
            ValorEstoqueAoCusto = estoqueValorizado.ValorAoCusto,
            ValorEstoqueAoPrecoVenda = estoqueValorizado.ValorAoPrecoVenda,
            ValorMercadoriasEmTransitoAoCusto = transito.ValorAoCusto,
            MotivoValorMercadoriasEmTransitoAoCustoIndisponivel = transito.MotivoValorAoCustoIndisponivel,
            ValorMercadoriasEmTransitoAoPrecoVenda = transito.ValorAoPrecoVenda,
            MotivoValorMercadoriasEmTransitoAoPrecoVendaIndisponivel = transito.MotivoValorAoPrecoVendaIndisponivel,
            LucroPotencialEstoque = estoqueValorizado.LucroPotencialCalculavel,
            QuantidadeEstoqueSemCusto = estoqueValorizado.QuantidadeSemCusto,
            ValorVendaEstoqueSemCusto = estoqueValorizado.ValorVendaSemCusto,
            ValorTotalRealistaOperacao = valorTotalRealista,
            ValorTotalPotencialOperacao = valorTotalPotencial,
            Avisos = avisos
        };
    }

    private static void AdicionarAvisosTransito(
        ICollection<AvisoDadoIncompletoDto> avisos,
        ResumoMercadoriasEmTransitoDto transito)
    {
        if (!transito.ValorAoCusto.HasValue)
        {
            avisos.Add(new AvisoDadoIncompletoDto
            {
                Codigo = "TRANSITO_CUSTO_INDISPONIVEL",
                Mensagem = transito.MotivoValorAoCustoIndisponivel
                    ?? "O valor oficial das mercadorias em transito ao custo esta indisponivel.",
                EntidadeTipo = "Compra",
                Impacto = "O valor total realista da operacao nao pode ser calculado."
            });
        }

        if (!transito.ValorAoPrecoVenda.HasValue)
        {
            avisos.Add(new AvisoDadoIncompletoDto
            {
                Codigo = "TRANSITO_PRECO_VENDA_INDISPONIVEL",
                Mensagem = transito.MotivoValorAoPrecoVendaIndisponivel
                    ?? "O valor das mercadorias em transito ao preco de venda esta indisponivel.",
                EntidadeTipo = "Produto",
                Impacto = "O valor total potencial da operacao nao pode ser calculado."
            });
        }
    }

    private static IReadOnlyCollection<AvisoDadoIncompletoDto> CriarAvisos(
        IReadOnlyCollection<DashboardVendaCustoDto> itensVendidos,
        decimal valorLucroNaoCalculavel,
        decimal quantidadeEstoqueSemCusto,
        decimal valorVendaEstoqueSemCusto)
    {
        var avisos = new List<AvisoDadoIncompletoDto>();

        var produtosSemCustoVenda = itensVendidos
            .Where(i => !i.CustoMedio.HasValue)
            .Select(i => i.ProdutoId)
            .Distinct()
            .ToList();

        if (produtosSemCustoVenda.Count > 0)
        {
            avisos.Add(new AvisoDadoIncompletoDto
            {
                Codigo = "CUSTO_MEDIO_AUSENTE",
                Mensagem = "Existem itens vendidos sem custo medio derivado de entradas reais em estoque.",
                EntidadeTipo = "Produto",
                Impacto = $"Lucro possui R$ {valorLucroNaoCalculavel:N2} de receita sem custo calculavel em {produtosSemCustoVenda.Count} produto(s)."
            });
        }

        if (quantidadeEstoqueSemCusto > 0)
        {
            avisos.Add(new AvisoDadoIncompletoDto
            {
                Codigo = "ESTOQUE_CUSTO_MEDIO_AUSENTE",
                Mensagem = "Existem unidades em estoque sem custo medio derivado de entradas reais.",
                EntidadeTipo = "Produto",
                Impacto = $"{quantidadeEstoqueSemCusto} unidade(s) com potencial de venda de R$ {valorVendaEstoqueSemCusto:N2} sem valor ao custo calculavel."
            });
        }

        return avisos;
    }
}
