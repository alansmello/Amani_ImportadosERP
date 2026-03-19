using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Infra.Data.Context;

namespace Amani.ImportadosERP.Infra.Data.Repositories;

public class CompraRepository : ICompraRepository
{
    private readonly AmaniDbContext _db;

    public CompraRepository(AmaniDbContext db)
    {
        _db = db;
    }

    public async Task AdicionarAsync(Compra compra)
    {
        if (compra == null) throw new ArgumentNullException(nameof(compra));
        await _db.Compras.AddAsync(compra);
        await _db.SaveChangesAsync();
    }

    public async Task<Compra?> ObterPorIdAsync(Guid id)
    {
        if (id == Guid.Empty) return null;
        return await _db.Compras.AsNoTracking().Include(c => c.Items).FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<List<Compra>> ObterTodasAsync()
    {
        return await _db.Compras
            .AsNoTracking()
            .Include(c => c.Items)
            .ToListAsync();
    }

    public async Task<List<Compra>> ObterComFiltrosAsync(DateTime? dataInicio, DateTime? dataFim, Guid? fornecedorId)
    {
        var query = _db.Compras.AsNoTracking().AsQueryable();

        if (dataInicio.HasValue)
            query = query.Where(c => c.DataCompra >= dataInicio.Value);

        if (dataFim.HasValue)
            query = query.Where(c => c.DataCompra <= dataFim.Value);

        if (fornecedorId.HasValue)
            query = query.Where(c => c.FornecedorId == fornecedorId.Value);

        query = query.Include(c => c.Items);

        return await query.ToListAsync();
    }
}

