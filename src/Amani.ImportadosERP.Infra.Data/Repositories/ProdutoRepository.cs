using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Infra.Data.Context;

namespace Amani.ImportadosERP.Infra.Data.Repositories;

public class ProdutoRepository : IProdutoRepository
{
    private readonly AmaniDbContext _db;

    public ProdutoRepository(AmaniDbContext db)
    {
        _db = db;
    }

    public async Task AdicionarAsync(Produto produto)
    {
        if (produto == null) throw new ArgumentNullException(nameof(produto));
        await _db.Produtos.AddAsync(produto);
        await _db.SaveChangesAsync();
    }

    public async Task<Produto?> ObterPorIdAsync(Guid id)
    {
        if (id == Guid.Empty) return null;
        return await _db.Produtos.AsNoTracking().Include(p => p.Apresentacoes).FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Produto?> ObterPorIdParaAtualizarAsync(Guid id)
    {
        if (id == Guid.Empty) return null;
        return await _db.Produtos.Include(p => p.Apresentacoes).FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<List<Produto>> ListarAsync()
    {
        return await _db.Produtos
            .AsNoTracking()
            .Include(p => p.Apresentacoes)
            .OrderBy(p => p.Nome)
            .ToListAsync();
    }

    public async Task SalvarAsync()
    {
        await _db.SaveChangesAsync();
    }
}
