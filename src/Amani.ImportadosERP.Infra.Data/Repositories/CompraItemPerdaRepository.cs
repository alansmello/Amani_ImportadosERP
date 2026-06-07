using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Infra.Data.Context;

namespace Amani.ImportadosERP.Infra.Data.Repositories;

public class CompraItemPerdaRepository : ICompraItemPerdaRepository
{
    private readonly AmaniDbContext _db;

    public CompraItemPerdaRepository(AmaniDbContext db)
    {
        _db = db;
    }

    public async Task AdicionarAsync(CompraItemPerda perda)
    {
        if (perda == null) throw new ArgumentNullException(nameof(perda));
        await _db.CompraItemPerdas.AddAsync(perda);
        await _db.SaveChangesAsync();
    }

    public async Task<List<CompraItemPerda>> ObterPorCompraAsync(Guid compraId)
    {
        if (compraId == Guid.Empty) return new List<CompraItemPerda>();

        return await _db.CompraItemPerdas
            .AsNoTracking()
            .Where(p => p.CompraId == compraId)
            .OrderBy(p => p.DataPerda)
            .ThenBy(p => p.CreatedAt)
            .ToListAsync();
    }
}
