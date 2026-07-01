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

        return entradas
            .Where(entrada => entrada.Quantidade > 0)
            .ToDictionary(
                entrada => entrada.ProdutoId,
                entrada => entrada.Valor / entrada.Quantidade);
    }
}
