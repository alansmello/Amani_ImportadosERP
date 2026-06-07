using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Infra.Data.Context;

namespace Amani.ImportadosERP.Infra.Data.Repositories;

public class CompraItemRecebimentoRepository : ICompraItemRecebimentoRepository
{
    private readonly AmaniDbContext _db;

    public CompraItemRecebimentoRepository(AmaniDbContext db)
    {
        _db = db;
    }

    public async Task AdicionarAsync(CompraItemRecebimento recebimento)
    {
        if (recebimento == null) throw new ArgumentNullException(nameof(recebimento));
        await _db.CompraItemRecebimentos.AddAsync(recebimento);
        await _db.SaveChangesAsync();
    }

    public async Task AdicionarSemSalvarAsync(CompraItemRecebimento recebimento)
    {
        if (recebimento == null) throw new ArgumentNullException(nameof(recebimento));
        await _db.CompraItemRecebimentos.AddAsync(recebimento);
    }

    public async Task<List<CompraItemRecebimento>> ObterPorCompraAsync(Guid compraId)
    {
        if (compraId == Guid.Empty) return new List<CompraItemRecebimento>();

        return await _db.CompraItemRecebimentos
            .AsNoTracking()
            .Where(r => r.CompraId == compraId)
            .OrderBy(r => r.DataRecebimento)
            .ThenBy(r => r.CreatedAt)
            .ToListAsync();
    }
}
