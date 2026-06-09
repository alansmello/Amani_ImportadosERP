using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Infra.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace Amani.ImportadosERP.Infra.Data.Repositories;

public sealed class DashboardOperacionalRepository : IDashboardOperacionalRepository
{
    private readonly AmaniDbContext _db;

    public DashboardOperacionalRepository(AmaniDbContext db)
    {
        _db = db;
    }

    public async Task<int> ObterProdutosCadastradosAsync(DateTime dataReferencia)
    {
        return await _db.Produtos
            .AsNoTracking()
            .Where(p => p.CreatedAt <= dataReferencia)
            .CountAsync();
    }

    public async Task<int> ObterEstoqueDisponivelTotalAsync(DateTime dataReferencia)
    {
        var entradas = await _db.EstoqueMovimentacoes
            .AsNoTracking()
            .Where(m => m.Data <= dataReferencia
                && (m.Tipo == TipoMovimentacao.Entrada || m.Tipo == TipoMovimentacao.InventarioInicial))
            .SumAsync(m => (int?)m.Quantidade) ?? 0;

        var saidas = await _db.EstoqueMovimentacoes
            .AsNoTracking()
            .Where(m => m.Data <= dataReferencia && m.Tipo == TipoMovimentacao.Saida)
            .SumAsync(m => (int?)m.Quantidade) ?? 0;

        return entradas - saidas;
    }

    public async Task<(int Quantidade, decimal Valor)> ObterMercadoriasEmTransitoAsync(DateTime dataReferencia)
    {
        var itens = await ObterItensDeComprasAteDataReferenciaAsync(dataReferencia);

        var pendentes = itens
            .Select(i => new
            {
                Quantidade = CalcularQuantidadePendente(i, dataReferencia),
                ValorUnitario = ObterValorUnitarioCompra(i)
            })
            .Where(i => i.Quantidade > 0)
            .ToList();

        return (
            pendentes.Sum(i => i.Quantidade),
            pendentes.Sum(i => i.Quantidade * i.ValorUnitario));
    }

    public async Task<int> ObterComprasEmAbertoAsync(DateTime dataReferencia)
    {
        var compras = await _db.Compras
            .AsNoTracking()
            .AsSplitQuery()
            .Include(c => c.Items)
                .ThenInclude(i => i.Recebimentos)
            .Include(c => c.Items)
                .ThenInclude(i => i.Perdas)
            .Where(c => c.Status != CompraStatus.Cancelada
                && c.DataCompra <= dataReferencia)
            .ToListAsync();

        return compras.Count(c => c.Items.Any(i => CalcularQuantidadePendente(i, dataReferencia) > 0));
    }

    public async Task<int> ObterProdutosPendentesRecebimentoAsync(DateTime dataReferencia)
    {
        var itens = await ObterItensDeComprasAteDataReferenciaAsync(dataReferencia);

        return itens
            .Where(i => CalcularQuantidadePendente(i, dataReferencia) > 0)
            .Select(i => i.ProdutoId)
            .Distinct()
            .Count();
    }

    public async Task<(int Quantidade, decimal Valor)> ObterPerdasRegistradasAsync(DateTime dataInicial, DateTime dataFinal)
    {
        var perdas = await _db.CompraItemPerdas
            .AsNoTracking()
            .Include(p => p.Compra)
            .Include(p => p.CompraItem)
            .Where(p => p.Compra.Status != CompraStatus.Cancelada
                && p.DataPerda >= dataInicial
                && p.DataPerda <= dataFinal)
            .ToListAsync();

        return (
            perdas.Sum(p => p.Quantidade),
            perdas.Sum(p => p.Quantidade * ObterValorUnitarioCompra(p.CompraItem)));
    }

    public async Task<int> ObterQuantidadeVendasAsync(DateTime dataInicial, DateTime dataFinal)
    {
        return await _db.Vendas
            .AsNoTracking()
            .Where(v => !v.Cancelada
                && v.DataVenda >= dataInicial
                && v.DataVenda <= dataFinal)
            .CountAsync();
    }

    public async Task<int> ObterQuantidadeComprasAsync(DateTime dataInicial, DateTime dataFinal)
    {
        return await _db.Compras
            .AsNoTracking()
            .Where(c => c.Status != CompraStatus.Cancelada
                && c.DataCompra >= dataInicial
                && c.DataCompra <= dataFinal)
            .CountAsync();
    }

    private async Task<IReadOnlyCollection<CompraItem>> ObterItensDeComprasAteDataReferenciaAsync(DateTime dataReferencia)
    {
        return await _db.CompraItems
            .AsNoTracking()
            .AsSplitQuery()
            .Include(i => i.Compra)
            .Include(i => i.Recebimentos)
            .Include(i => i.Perdas)
            .Where(i => i.Compra.Status != CompraStatus.Cancelada
                && i.Compra.DataCompra <= dataReferencia)
            .ToListAsync();
    }

    private static int CalcularQuantidadePendente(CompraItem item, DateTime dataReferencia)
    {
        return item.Quantidade
            - item.Recebimentos
                .Where(r => r.DataRecebimento <= dataReferencia)
                .Sum(r => r.Quantidade)
            - item.Perdas
                .Where(p => p.DataPerda <= dataReferencia)
                .Sum(p => p.Quantidade);
    }

    private static decimal ObterValorUnitarioCompra(CompraItem item)
    {
        if (item.Quantidade <= 0)
        {
            return item.CustoUnitario;
        }

        return item.ValorTotal() / item.Quantidade;
    }
}
