using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Infra.Data.Context;

namespace Amani.ImportadosERP.Infra.Data.Repositories;

public class VendaRepository : IVendaRepository
{
    private readonly AmaniDbContext _db;

    public VendaRepository(AmaniDbContext db)
    {
        _db = db;
    }

    public async Task AdicionarAsync(Venda venda)
    {
        if (venda == null) throw new ArgumentNullException(nameof(venda));
        // Ensure child items reference parent id (EF will handle this on SaveChanges, but keep explicit for domain clarity)
        await _db.Vendas.AddAsync(venda);
        await _db.SaveChangesAsync();
    }

    public async Task<Venda?> ObterPorIdAsync(Guid id)
    {
        if (id == Guid.Empty) return null;
        return await _db.Vendas.AsNoTracking().Include(v => v.Items).FirstOrDefaultAsync(v => v.Id == id);
    }

    public async Task<Venda?> ObterPorIdParaAtualizarAsync(Guid id)
    {
        if (id == Guid.Empty) return null;
        return await _db.Vendas.Include(v => v.Items).FirstOrDefaultAsync(v => v.Id == id);
    }

    public async Task<List<Venda>> ObterTodasAsync()
    {
        return await _db.Vendas.AsNoTracking().Include(v => v.Items).ToListAsync();
    }

    public async Task<List<Venda>> ObterComFiltrosAsync(DateTime? dataInicio, DateTime? dataFim, Guid? clienteId)
    {
        var query = _db.Vendas.AsNoTracking().AsQueryable();

        if (dataInicio.HasValue)
            query = query.Where(v => v.DataVenda >= dataInicio.Value);

        if (dataFim.HasValue)
            query = query.Where(v => v.DataVenda <= dataFim.Value);

        if (clienteId.HasValue)
            query = query.Where(v => v.ClienteId == clienteId.Value);

        query = query.Include(v => v.Items);

        return await query.ToListAsync();
    }

    public async Task SalvarAsync()
    {
        await _db.SaveChangesAsync();
    }
}
