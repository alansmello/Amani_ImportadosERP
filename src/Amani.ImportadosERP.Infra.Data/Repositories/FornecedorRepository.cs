using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Infra.Data.Context;

namespace Amani.ImportadosERP.Infra.Data.Repositories;

public class FornecedorRepository : IFornecedorRepository
{
    private readonly AmaniDbContext _db;

    public FornecedorRepository(AmaniDbContext db)
    {
        _db = db;
    }

    public async Task AdicionarAsync(Fornecedor fornecedor)
    {
        if (fornecedor == null) throw new ArgumentNullException(nameof(fornecedor));
        await _db.Fornecedores.AddAsync(fornecedor);
        await _db.SaveChangesAsync();
    }

    public async Task<Fornecedor?> ObterPorIdAsync(Guid id)
    {
        if (id == Guid.Empty) return null;
        return await _db.Fornecedores.AsNoTracking().FirstOrDefaultAsync(f => f.Id == id);
    }

    public async Task<Fornecedor?> ObterPorIdParaAtualizarAsync(Guid id)
    {
        if (id == Guid.Empty) return null;
        return await _db.Fornecedores.FirstOrDefaultAsync(f => f.Id == id);
    }

    public async Task<List<Fornecedor>> ListarAsync()
    {
        return await _db.Fornecedores
            .AsNoTracking()
            .OrderBy(f => f.Nome)
            .ToListAsync();
    }

    public async Task SalvarAsync()
    {
        await _db.SaveChangesAsync();
    }
}
