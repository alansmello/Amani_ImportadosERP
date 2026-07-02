using Amani.ImportadosERP.Application.DTOs.Dashboards;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Infra.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace Amani.ImportadosERP.Infra.Data.Repositories;

public sealed class DashboardFinanceiroRepository : IDashboardFinanceiroRepository
{
    private readonly AmaniDbContext _db;
    private readonly DashboardCustoMedioReadService _custoMedioReadService;

    public DashboardFinanceiroRepository(
        AmaniDbContext db,
        DashboardCustoMedioReadService custoMedioReadService)
    {
        _db = db;
        _custoMedioReadService = custoMedioReadService;
    }

    public async Task<decimal> ObterReceitaTotalAsync(DateTime dataInicial, DateTime dataFinal)
    {
        return await VendasConfirmadasNoPeriodo(dataInicial, dataFinal)
            .Select(v => v.Items.Sum(i => i.Quantidade * i.PrecoUnitario - i.Desconto + i.Acrescimo)
                - v.Desconto
                + v.Acrescimo)
            .SumAsync();
    }

    public async Task<IReadOnlyCollection<DashboardVendaCustoDto>> ObterItensVendidosComCustoAsync(
        DateTime dataInicial,
        DateTime dataFinal,
        DateTime dataReferencia)
    {
        var itens = await VendasConfirmadasNoPeriodo(dataInicial, dataFinal)
            .SelectMany(v => v.Items.Select(item => new
            {
                v.Id,
                item.ProdutoId,
                item.Quantidade,
                item.FatorNumeradorAplicado,
                item.FatorDenominadorAplicado,
                ValorLiquidoItem = item.Quantidade * item.PrecoUnitario - item.Desconto + item.Acrescimo
            }))
            .ToListAsync();

        if (itens.Count == 0)
        {
            return Array.Empty<DashboardVendaCustoDto>();
        }

        var produtoIds = itens
            .Select(i => i.ProdutoId)
            .Distinct()
            .ToList();

        var custos = await _custoMedioReadService.ObterCustosMediosAsync(produtoIds, dataReferencia);

        return itens
            .Select(item => new DashboardVendaCustoDto
            {
                VendaId = item.Id,
                ProdutoId = item.ProdutoId,
                Quantidade = item.FatorNumeradorAplicado.HasValue && item.FatorDenominadorAplicado.HasValue
                    ? new Amani.ImportadosERP.Domain.Common.QuantidadeRacional(
                        item.FatorNumeradorAplicado.Value,
                        item.FatorDenominadorAplicado.Value).Multiplicar(item.Quantidade).ParaDecimal()
                    : item.Quantidade,
                ValorLiquidoItem = item.ValorLiquidoItem,
                CustoMedio = custos.TryGetValue(item.ProdutoId, out var custo) ? custo : null
            })
            .ToList();
    }

    public async Task<decimal> ObterTotalComprasAsync(DateTime dataInicial, DateTime dataFinal)
    {
        return await ComprasNaoCanceladas()
            .Where(c => c.DataCompra >= dataInicial && c.DataCompra <= dataFinal)
            .Select(c => c.Items.Sum(i => i.Quantidade * i.CustoUnitario - i.Desconto + i.Acrescimo)
                - c.Desconto
                + c.Acrescimo)
            .SumAsync();
    }

    public async Task<decimal> ObterTotalDespesasAsync(DateTime dataInicial, DateTime dataFinal)
    {
        return await _db.Despesas
            .AsNoTracking()
            .Where(d => d.DataCompetencia >= dataInicial && d.DataCompetencia <= dataFinal)
            .SumAsync(d => d.Valor);
    }

    public async Task<decimal> ObterContasReceberAbertasAsync(DateTime dataReferencia)
    {
        var resumo = await ObterResumoRecebiveisAsync(dataReferencia);
        return resumo.Abertas;
    }

    public async Task<DashboardRecebiveisResumoDto> ObterResumoRecebiveisAsync(DateTime dataReferencia)
    {
        var contasComSaldo = await _db.ContasReceber
            .AsNoTracking()
            .Where(c => c.CreatedAt <= dataReferencia)
            .Select(c => new
            {
                Saldo = c.Valor - c.Pagamentos
                    .Where(p => p.DataPagamento <= dataReferencia)
                    .Sum(p => p.ValorBrutoLiquidado),
                c.DataVencimento
            })
            .Where(c => c.Saldo > 0)
            .ToListAsync();

        var vencidas = contasComSaldo
            .Where(c => c.DataVencimento < dataReferencia)
            .Sum(c => c.Saldo);

        var aVencer = contasComSaldo
            .Where(c => c.DataVencimento >= dataReferencia)
            .Sum(c => c.Saldo);

        return new DashboardRecebiveisResumoDto
        {
            Abertas = vencidas + aVencer,
            Vencidas = vencidas,
            AVencer = aVencer
        };
    }

    public async Task<decimal> ObterValoresRecebidosAsync(DateTime dataInicial, DateTime dataFinal)
    {
        return await _db.PagamentosRecebidos
            .AsNoTracking()
            .Where(p => p.DataPagamento >= dataInicial && p.DataPagamento <= dataFinal)
            .SumAsync(p => p.Valor);
    }

    public async Task<DashboardCaixaResumoDto> ObterResumoCaixaAsync(
        DateTime dataInicial,
        DateTime dataFinal)
    {
        var entradas = await ObterValoresRecebidosAsync(dataInicial, dataFinal);
        var saidasCompras = await ObterTotalComprasAsync(dataInicial, dataFinal);
        var saidasDespesas = await ObterTotalDespesasAsync(dataInicial, dataFinal);
        var saidas = saidasCompras + saidasDespesas;

        var saldoInicialEventos = await _db.EventosFinanceiros
            .AsNoTracking()
            .Where(e => e.Tipo == TipoEventoFinanceiro.SaldoInicialCaixa && e.Data < dataInicial)
            .SumAsync(e => e.Valor);

        var ajusteImplantacao = await _db.EventosFinanceiros
            .AsNoTracking()
            .Where(e => e.Tipo == TipoEventoFinanceiro.SaldoInicialCaixa
                && e.Data >= dataInicial
                && e.Data <= dataFinal)
            .SumAsync(e => e.Valor);

        var entradasAnteriores = await _db.PagamentosRecebidos
            .AsNoTracking()
            .Where(p => p.DataPagamento < dataInicial)
            .SumAsync(p => p.Valor);

        var comprasAnteriores = await ObterTotalComprasAntesAsync(dataInicial);
        var despesasAnteriores = await _db.Despesas
            .AsNoTracking()
            .Where(d => d.DataCompetencia < dataInicial)
            .SumAsync(d => d.Valor);

        var caixaInicial = saldoInicialEventos + entradasAnteriores - comprasAnteriores - despesasAnteriores;
        var caixaFinal = caixaInicial + ajusteImplantacao + entradas - saidas;

        return new DashboardCaixaResumoDto
        {
            CaixaInicial = caixaInicial,
            AjusteImplantacao = ajusteImplantacao,
            Entradas = entradas,
            Saidas = saidas,
            CaixaFinal = caixaFinal
        };
    }

    private IQueryable<Venda> VendasConfirmadasNoPeriodo(DateTime dataInicial, DateTime dataFinal)
    {
        return _db.Vendas
            .AsNoTracking()
            .Where(v => !v.Cancelada
                && v.DataVenda >= dataInicial
                && v.DataVenda <= dataFinal);
    }

    private IQueryable<Compra> ComprasNaoCanceladas()
    {
        return _db.Compras
            .AsNoTracking()
            .Where(c => c.Status != CompraStatus.Cancelada);
    }

    private async Task<decimal> ObterTotalComprasAntesAsync(DateTime dataInicial)
    {
        return await ComprasNaoCanceladas()
            .Where(c => c.DataCompra < dataInicial)
            .Select(c => c.Items.Sum(i => i.Quantidade * i.CustoUnitario - i.Desconto + i.Acrescimo)
                - c.Desconto
                + c.Acrescimo)
            .SumAsync();
    }
}
