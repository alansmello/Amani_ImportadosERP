using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Infra.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace Amani.ImportadosERP.Infra.Data.Repositories;

public sealed class DashboardCustoMedioReadService
{
    private readonly AmaniDbContext _db;

    public DashboardCustoMedioReadService(AmaniDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyDictionary<Guid, decimal>> ObterCustosMediosAsync(
        IReadOnlyCollection<Guid> produtoIds,
        DateTime dataReferencia)
    {
        ArgumentNullException.ThrowIfNull(produtoIds);

        var ids = produtoIds
            .Where(id => id != Guid.Empty)
            .Distinct()
            .ToArray();

        if (ids.Length == 0)
        {
            return new Dictionary<Guid, decimal>();
        }

        var entradas = await _db.EstoqueMovimentacoes
            .AsNoTracking()
            .Where(m => ids.Contains(m.ProdutoId)
                && m.Data <= dataReferencia
                && m.VendaItemId == null
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

        var devolucoes = await _db.CompraItemDevolucoes
            .AsNoTracking()
            .Include(d => d.CompraItemRecebimento)
            .Where(d => d.CompraItemRecebimento != null
                && ids.Contains(d.CompraItemRecebimento.ProdutoId)
                && d.Momento == CompraItemDevolucaoMomento.DepoisDoRecebimento
                && d.DataDevolucao <= dataReferencia
                && (d.Compensacao == null || d.Compensacao.DataCompensacao > dataReferencia))
            .GroupBy(d => d.CompraItemRecebimento!.ProdutoId)
            .Select(g => new
            {
                ProdutoId = g.Key,
                Quantidade = g.Sum(d => d.Quantidade),
                Valor = g.Sum(d => d.CompraItemRecebimento!.ValorUnitario * d.Quantidade)
            })
            .ToListAsync();

        var devolucoesPorProduto = devolucoes.ToDictionary(d => d.ProdutoId);

        return entradas
            .Select(entrada =>
            {
                var devolucao = devolucoesPorProduto.TryGetValue(entrada.ProdutoId, out var item)
                    ? item
                    : null;
                return new
                {
                    entrada.ProdutoId,
                    Quantidade = entrada.Quantidade - (devolucao?.Quantidade ?? 0),
                    Valor = entrada.Valor - (devolucao?.Valor ?? 0m)
                };
            })
            .Where(entrada => entrada.Quantidade > 0)
            .ToDictionary(
                entrada => entrada.ProdutoId,
                entrada => entrada.Valor / entrada.Quantidade);
    }
}
