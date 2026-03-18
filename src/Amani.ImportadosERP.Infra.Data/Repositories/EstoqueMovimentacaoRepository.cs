using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Infra.Data.Context;

namespace Amani.ImportadosERP.Infra.Data.Repositories;

public class EstoqueMovimentacaoRepository : IEstoqueMovimentacaoRepository
{
    private readonly AmaniDbContext _db;

    public EstoqueMovimentacaoRepository(AmaniDbContext db)
    {
        _db = db;
    }

    public async Task AdicionarAsync(EstoqueMovimentacao movimentacao)
    {
        if (movimentacao == null) throw new ArgumentNullException(nameof(movimentacao));
        await _db.EstoqueMovimentacoes.AddAsync(movimentacao);
        await _db.SaveChangesAsync();
    }

    public async Task AdicionarRangeAsync(System.Collections.Generic.IEnumerable<EstoqueMovimentacao> movimentacoes)
    {
        if (movimentacoes == null) throw new ArgumentNullException(nameof(movimentacoes));
        await _db.EstoqueMovimentacoes.AddRangeAsync(movimentacoes);
        await _db.SaveChangesAsync();
    }
}
