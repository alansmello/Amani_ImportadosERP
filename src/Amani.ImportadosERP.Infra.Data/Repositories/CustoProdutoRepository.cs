using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Infra.Data.Context;

namespace Amani.ImportadosERP.Infra.Data.Repositories;

public class CustoProdutoRepository : ICustoProdutoRepository
{
    private readonly AmaniDbContext _db;

    public CustoProdutoRepository(AmaniDbContext db)
    {
        _db = db;
    }

    public async Task<decimal> ObterCustoMedioAsync(Guid produtoId)
    {
        if (produtoId == Guid.Empty) throw new ArgumentException("produtoId inválido", nameof(produtoId));

        var entradas = await _db.EstoqueMovimentacoes
            .Where(m => m.ProdutoId == produtoId && m.Tipo == Amani.ImportadosERP.Domain.Entities.TipoMovimentacao.Entrada && m.ValorUnitario != null)
            .ToListAsync();

        var somaQuantidade = entradas.Sum(e => e.Quantidade);
        if (somaQuantidade == 0) return 0m;

        var somaValor = entradas.Sum(e => (e.ValorUnitario ?? 0m) * e.Quantidade);

        return somaValor / somaQuantidade;
    }
}
