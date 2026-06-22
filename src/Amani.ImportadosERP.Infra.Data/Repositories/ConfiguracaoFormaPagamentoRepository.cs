using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Domain.Enums;
using Amani.ImportadosERP.Infra.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace Amani.ImportadosERP.Infra.Data.Repositories;

public sealed class ConfiguracaoFormaPagamentoRepository : IConfiguracaoFormaPagamentoRepository
{
    private readonly AmaniDbContext _db;

    public ConfiguracaoFormaPagamentoRepository(AmaniDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<ConfiguracaoFormaPagamento>> ObterTodasAsync()
    {
        return await _db.ConfiguracoesFormasPagamento
            .AsNoTracking()
            .OrderBy(x => x.FormaPagamento)
            .ToListAsync();
    }

    public async Task<ConfiguracaoFormaPagamento?> ObterPorFormaAsync(FormaPagamento formaPagamento)
    {
        return await _db.ConfiguracoesFormasPagamento
            .FirstOrDefaultAsync(x => x.FormaPagamento == formaPagamento);
    }

    public Task AtualizarAsync(ConfiguracaoFormaPagamento configuracao)
    {
        _db.ConfiguracoesFormasPagamento.Update(configuracao);
        return Task.CompletedTask;
    }

    public async Task SalvarAsync()
    {
        await _db.SaveChangesAsync();
    }
}
