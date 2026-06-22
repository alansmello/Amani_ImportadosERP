using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Domain.Enums;
using Amani.ImportadosERP.Infra.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace Amani.ImportadosERP.Infra.Data.Repositories;

public sealed class DespesaOperadoraRepository : IDespesaOperadoraRepository
{
    private readonly AmaniDbContext _db;

    public DespesaOperadoraRepository(AmaniDbContext db)
    {
        _db = db;
    }

    public async Task AdicionarAsync(DespesaOperadora despesa)
    {
        await _db.DespesasOperadora.AddAsync(despesa);
    }

    public async Task<IReadOnlyList<DespesaOperadora>> ObterComFiltrosAsync(DateTime? dataInicio, DateTime? dataFim, FormaPagamento? formaPagamento)
    {
        var query = _db.DespesasOperadora.AsNoTracking();

        if (dataInicio.HasValue)
        {
            query = query.Where(x => x.DataRegistro >= dataInicio.Value);
        }

        if (dataFim.HasValue)
        {
            query = query.Where(x => x.DataRegistro <= dataFim.Value);
        }

        if (formaPagamento.HasValue)
        {
            query = query.Where(x => x.FormaPagamento == formaPagamento.Value);
        }

        return await query
            .OrderByDescending(x => x.DataRegistro)
            .ToListAsync();
    }

    public async Task SalvarAsync()
    {
        await _db.SaveChangesAsync();
    }
}
