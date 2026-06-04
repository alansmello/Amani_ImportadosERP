using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Infra.Data.Context;

namespace Amani.ImportadosERP.Infra.Data.Repositories;

public class CategoriaRepository : ICategoriaRepository
{
    private readonly AmaniDbContext _db;

    public CategoriaRepository(AmaniDbContext db)
    {
        _db = db;
    }

    public async Task AdicionarAsync(Categoria categoria)
    {
        if (categoria == null) throw new ArgumentNullException(nameof(categoria));
        await _db.Categorias.AddAsync(categoria);
        await _db.SaveChangesAsync();
    }

    public async Task<Categoria?> ObterPorIdAsync(Guid id)
    {
        if (id == Guid.Empty) return null;
        return await _db.Categorias.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<Categoria?> ObterPorIdParaAtualizarAsync(Guid id)
    {
        if (id == Guid.Empty) return null;
        return await _db.Categorias.FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<List<Categoria>> ListarAsync()
    {
        return await _db.Categorias
            .AsNoTracking()
            .OrderBy(c => c.Nome)
            .ToListAsync();
    }

    public async Task SalvarAsync()
    {
        await _db.SaveChangesAsync();
    }
}
