using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Infra.Data.Context;

namespace Amani.ImportadosERP.Infra.Data.Repositories;

public class ClienteRepository : IClienteRepository
{
    private readonly AmaniDbContext _db;

    public ClienteRepository(AmaniDbContext db)
    {
        _db = db;
    }

    public async Task AdicionarAsync(Cliente cliente)
    {
        if (cliente == null) throw new ArgumentNullException(nameof(cliente));
        await _db.Clientes.AddAsync(cliente);
        await _db.SaveChangesAsync();
    }

    public async Task<Cliente?> ObterPorIdAsync(Guid id)
    {
        if (id == Guid.Empty) return null;
        return await _db.Clientes.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<Cliente?> ObterPorIdParaAtualizarAsync(Guid id)
    {
        if (id == Guid.Empty) return null;
        return await _db.Clientes.FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<List<Cliente>> ListarAsync(bool? ativo = null)
    {
        var query = _db.Clientes.AsNoTracking().AsQueryable();

        if (ativo.HasValue)
            query = query.Where(c => c.Ativo == ativo.Value);

        return await query
            .OrderBy(c => c.Nome)
            .ToListAsync();
    }

    public async Task SalvarAsync()
    {
        await _db.SaveChangesAsync();
    }
}
