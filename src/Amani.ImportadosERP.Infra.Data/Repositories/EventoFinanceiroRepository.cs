using System;
using System.Threading.Tasks;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Infra.Data.Context;

namespace Amani.ImportadosERP.Infra.Data.Repositories;

public class EventoFinanceiroRepository : IEventoFinanceiroRepository
{
    private readonly AmaniDbContext _db;

    public EventoFinanceiroRepository(AmaniDbContext db)
    {
        _db = db;
    }

    public async Task AdicionarAsync(EventoFinanceiro eventoFinanceiro)
    {
        if (eventoFinanceiro == null) throw new ArgumentNullException(nameof(eventoFinanceiro));

        await _db.EventosFinanceiros.AddAsync(eventoFinanceiro);
        await _db.SaveChangesAsync();
    }
}
