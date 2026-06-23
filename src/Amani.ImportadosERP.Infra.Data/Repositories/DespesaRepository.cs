using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Infra.Data.Context;

namespace Amani.ImportadosERP.Infra.Data.Repositories;

public class DespesaRepository : IDespesaRepository
{
    private readonly AmaniDbContext _db;

    public DespesaRepository(AmaniDbContext db)
    {
        _db = db;
    }

    public async Task AdicionarAsync(Despesa despesa)
    {
        if (despesa == null) throw new ArgumentNullException(nameof(despesa));
        await _db.Despesas.AddAsync(despesa);
        await _db.SaveChangesAsync();
    }

    public async Task<Despesa?> ObterPorIdAsync(Guid id)
    {
        if (id == Guid.Empty) return null;
        return await _db.Despesas
            .AsNoTracking()
            .Include(d => d.CategoriaDespesa)
            .FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task<List<Despesa>> ObterComFiltrosAsync(DateTime? dataInicio, DateTime? dataFim, Guid? categoriaId)
    {
        var query = _db.Despesas
            .AsNoTracking()
            .Include(d => d.CategoriaDespesa)
            .AsQueryable();

        if (dataInicio.HasValue)
            query = query.Where(d => d.DataCompetencia >= dataInicio.Value);

        if (dataFim.HasValue)
            query = query.Where(d => d.DataCompetencia <= dataFim.Value);

        if (categoriaId.HasValue)
            query = query.Where(d => d.CategoriaDespesaId == categoriaId.Value);

        return await query
            .OrderByDescending(d => d.DataCompetencia)
            .ThenBy(d => d.Descricao)
            .ToListAsync();
    }
}
