using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Infra.Data.Context;

namespace Amani.ImportadosERP.Infra.Data.Repositories;

public class CategoriaDespesaRepository : ICategoriaDespesaRepository
{
    private readonly AmaniDbContext _db;

    public CategoriaDespesaRepository(AmaniDbContext db)
    {
        _db = db;
    }

    public async Task AdicionarAsync(CategoriaDespesa categoria)
    {
        if (categoria == null) throw new ArgumentNullException(nameof(categoria));
        await _db.CategoriaDespesas.AddAsync(categoria);
        await _db.SaveChangesAsync();
    }

    public async Task<CategoriaDespesa?> ObterPorIdAsync(Guid id)
    {
        if (id == Guid.Empty) return null;
        return await _db.CategoriaDespesas.FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<CategoriaDespesa?> ObterPorNomeNormalizadoAsync(string nomeNormalizado)
    {
        if (string.IsNullOrWhiteSpace(nomeNormalizado)) return null;
        return await _db.CategoriaDespesas
            .FirstOrDefaultAsync(c => c.NomeNormalizado == nomeNormalizado);
    }

    public async Task<List<CategoriaDespesa>> ListarAsync(bool incluirInativas)
    {
        var query = _db.CategoriaDespesas.AsNoTracking().AsQueryable();

        if (!incluirInativas)
            query = query.Where(c => c.Ativa);

        return await query
            .OrderBy(c => c.Nome)
            .ToListAsync();
    }

    public async Task AtualizarAsync(CategoriaDespesa categoria)
    {
        if (categoria == null) throw new ArgumentNullException(nameof(categoria));
        _db.CategoriaDespesas.Update(categoria);
        await _db.SaveChangesAsync();
    }
}
