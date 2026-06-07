using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Infra.Data.Context;

namespace Amani.ImportadosERP.Infra.Data.Repositories;

public class EstoqueConsultaRepository : IEstoqueConsultaRepository
{
    private readonly AmaniDbContext _db;

    public EstoqueConsultaRepository(AmaniDbContext db)
    {
        _db = db;
    }

    public async Task<int> ObterSaldoAsync(Guid produtoId)
    {
        if (produtoId == Guid.Empty) throw new ArgumentException("produtoId inválido", nameof(produtoId));

        var entradas = await _db.EstoqueMovimentacoes
            .Where(m => m.ProdutoId == produtoId
                && (m.Tipo == TipoMovimentacao.Entrada || m.Tipo == TipoMovimentacao.InventarioInicial))
            .SumAsync(m => (int?)m.Quantidade) ?? 0;

        var saidas = await _db.EstoqueMovimentacoes
            .Where(m => m.ProdutoId == produtoId && m.Tipo == TipoMovimentacao.Saida)
            .SumAsync(m => (int?)m.Quantidade) ?? 0;

        return entradas - saidas;
    }
}
