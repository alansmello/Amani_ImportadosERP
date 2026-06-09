using Amani.ImportadosERP.Application.DTOs.Dashboards;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Infra.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace Amani.ImportadosERP.Infra.Data.Repositories;

public sealed class DashboardFinanceiroRepository : IDashboardFinanceiroRepository
{
    private readonly AmaniDbContext _db;

    public DashboardFinanceiroRepository(AmaniDbContext db)
    {
        _db = db;
    }

    public async Task<decimal> ObterReceitaTotalAsync(DateTime dataInicial, DateTime dataFinal)
    {
        var vendas = await VendasConfirmadasNoPeriodo(dataInicial, dataFinal)
            .Include(v => v.Items)
            .ToListAsync();

        return vendas.Sum(v => v.Total());
    }

    public async Task<IReadOnlyCollection<DashboardVendaCustoDto>> ObterItensVendidosComCustoAsync(
        DateTime dataInicial,
        DateTime dataFinal,
        DateTime dataReferencia)
    {
        var vendas = await VendasConfirmadasNoPeriodo(dataInicial, dataFinal)
            .Include(v => v.Items)
            .ToListAsync();

        var produtoIds = vendas
            .SelectMany(v => v.Items)
            .Select(i => i.ProdutoId)
            .Distinct()
            .ToList();

        var custos = await ObterCustosMediosAsync(produtoIds, dataReferencia);

        return vendas
            .SelectMany(v => v.Items.Select(item => new DashboardVendaCustoDto
            {
                VendaId = v.Id,
                ProdutoId = item.ProdutoId,
                Quantidade = item.Quantidade,
                ValorLiquidoItem = item.ValorTotal(),
                CustoMedio = custos.TryGetValue(item.ProdutoId, out var custo) ? custo : null
            }))
            .ToList();
    }

    public async Task<decimal> ObterTotalComprasAsync(DateTime dataInicial, DateTime dataFinal)
    {
        var compras = await _db.Compras
            .AsNoTracking()
            .Include(c => c.Items)
            .Where(c => c.Status != CompraStatus.Cancelada
                && c.DataCompra >= dataInicial
                && c.DataCompra <= dataFinal)
            .ToListAsync();

        return compras.Sum(c => c.Total());
    }

    public async Task<decimal> ObterTotalDespesasAsync(DateTime dataInicial, DateTime dataFinal)
    {
        return await _db.Despesas
            .AsNoTracking()
            .Where(d => d.Data >= dataInicial && d.Data <= dataFinal)
            .SumAsync(d => d.Valor);
    }

    public async Task<decimal> ObterContasReceberAbertasAsync(DateTime dataReferencia)
    {
        var contas = await _db.ContasReceber
            .AsNoTracking()
            .Include(c => c.Pagamentos)
            .Where(c => c.CreatedAt <= dataReferencia)
            .ToListAsync();

        return contas
            .Select(c => c.Valor - c.Pagamentos
                .Where(p => p.DataPagamento <= dataReferencia)
                .Sum(p => p.Valor))
            .Where(saldo => saldo > 0)
            .Sum();
    }

    public async Task<decimal> ObterValoresRecebidosAsync(DateTime dataInicial, DateTime dataFinal)
    {
        return await _db.PagamentosRecebidos
            .AsNoTracking()
            .Where(p => p.DataPagamento >= dataInicial && p.DataPagamento <= dataFinal)
            .SumAsync(p => p.Valor);
    }

    private IQueryable<Venda> VendasConfirmadasNoPeriodo(DateTime dataInicial, DateTime dataFinal)
    {
        return _db.Vendas
            .AsNoTracking()
            .Where(v => !v.Cancelada
                && v.DataVenda >= dataInicial
                && v.DataVenda <= dataFinal);
    }

    private async Task<IReadOnlyDictionary<Guid, decimal>> ObterCustosMediosAsync(
        IReadOnlyCollection<Guid> produtoIds,
        DateTime dataReferencia)
    {
        if (!produtoIds.Any())
        {
            return new Dictionary<Guid, decimal>();
        }

        var entradas = await _db.EstoqueMovimentacoes
            .AsNoTracking()
            .Where(m => produtoIds.Contains(m.ProdutoId)
                && m.Data <= dataReferencia
                && m.ValorUnitario != null
                && (m.Tipo == TipoMovimentacao.InventarioInicial
                    || (m.Tipo == TipoMovimentacao.Entrada && m.CompraItemId != null)))
            .GroupBy(m => m.ProdutoId)
            .Select(g => new
            {
                ProdutoId = g.Key,
                Quantidade = g.Sum(m => m.Quantidade),
                Valor = g.Sum(m => (m.ValorUnitario ?? 0m) * m.Quantidade)
            })
            .ToListAsync();

        return entradas
            .Where(e => e.Quantidade > 0)
            .ToDictionary(e => e.ProdutoId, e => e.Valor / e.Quantidade);
    }
}
