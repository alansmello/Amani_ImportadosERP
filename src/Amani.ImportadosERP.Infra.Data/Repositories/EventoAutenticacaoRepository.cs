using System;
using System.Threading.Tasks;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Infra.Data.Context;

namespace Amani.ImportadosERP.Infra.Data.Repositories;

public class EventoAutenticacaoRepository : IEventoAutenticacaoRepository
{
    private readonly AmaniDbContext _db;

    public EventoAutenticacaoRepository(AmaniDbContext db)
    {
        _db = db;
    }

    public async Task AdicionarAsync(EventoAutenticacao evento)
    {
        if (evento == null) throw new ArgumentNullException(nameof(evento));
        await _db.EventosAutenticacao.AddAsync(evento);
    }

    public async Task SalvarAsync()
    {
        await _db.SaveChangesAsync();
    }
}
