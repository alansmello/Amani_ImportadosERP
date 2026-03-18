using System;
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
        return await _db.Produtos.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id);
    }
}
