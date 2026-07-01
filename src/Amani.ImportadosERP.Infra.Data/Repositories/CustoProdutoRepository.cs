using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;
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
            .Where(m => m.ProdutoId == produtoId
                && m.VendaItemId == null
                && m.ValorUnitario != null
                && (m.Tipo == TipoMovimentacao.InventarioInicial
                    || (m.Tipo == TipoMovimentacao.Entrada && m.CompraItemId != null)))
            .ToListAsync();

        var somaQuantidade = entradas.Sum(e => e.Quantidade);

        if (somaQuantidade > 0)
        {
            var somaValor = entradas.Sum(e => (e.ValorUnitario ?? 0m) * e.Quantidade);
            return somaValor / somaQuantidade;
        }

        // Fallback: sem movimentações com custo registrado, usa o custo cadastrado no produto
        var produto = await _db.Produtos
            .Where(p => p.Id == produtoId)
            .Select(p => new { p.Custo })
            .FirstOrDefaultAsync();

        return produto?.Custo ?? 0m;
    }
}
