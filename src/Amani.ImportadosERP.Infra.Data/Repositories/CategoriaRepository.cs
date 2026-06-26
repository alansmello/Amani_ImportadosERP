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

    public async Task RemoverAsync(Guid id)
    {
        var categoria = await _db.Categorias.FirstOrDefaultAsync(c => c.Id == id);

        if (categoria == null)
            throw new KeyNotFoundException($"Categoria {id} nao encontrada.");

        _db.Categorias.Remove(categoria);

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (
            ex.InnerException?.Message.Contains("foreign key") == true
            || ex.InnerException?.Message.Contains("violates") == true
            || ex.InnerException?.Message.Contains("FK_") == true
            || ex.InnerException?.Message.Contains("23503") == true)
        {
            throw new InvalidOperationException(
                "Nao e possivel remover esta categoria pois ela possui produtos vinculados.", ex);
        }
    }
}
