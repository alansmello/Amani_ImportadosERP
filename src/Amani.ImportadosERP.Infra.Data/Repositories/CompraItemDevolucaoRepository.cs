using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Infra.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace Amani.ImportadosERP.Infra.Data.Repositories;

public class CompraItemDevolucaoRepository : ICompraItemDevolucaoRepository
{
    private readonly AmaniDbContext _db;

    public CompraItemDevolucaoRepository(AmaniDbContext db)
    {
        _db = db;
    }

    public async Task AdicionarAsync(CompraItemDevolucao devolucao)
    {
        ArgumentNullException.ThrowIfNull(devolucao);
        await _db.CompraItemDevolucoes.AddAsync(devolucao);
        await _db.SaveChangesAsync();
    }

    public async Task AdicionarSemSalvarAsync(CompraItemDevolucao devolucao)
    {
        ArgumentNullException.ThrowIfNull(devolucao);
        await _db.CompraItemDevolucoes.AddAsync(devolucao);
    }

    public async Task AdicionarCompensacaoAsync(CompraItemDevolucaoCompensacao compensacao)
    {
        ArgumentNullException.ThrowIfNull(compensacao);
        await _db.CompraItemDevolucaoCompensacoes.AddAsync(compensacao);
        await _db.SaveChangesAsync();
    }

    public async Task<CompraItemDevolucao?> ObterPorIdAsync(Guid id)
    {
        if (id == Guid.Empty) return null;
        return await QueryCompleta()
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task<CompraItemDevolucao?> ObterPorOperacaoIdAsync(Guid operacaoId)
    {
        if (operacaoId == Guid.Empty) return null;
        return await QueryCompleta()
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.OperacaoId == operacaoId);
    }

    public async Task<CompraItemDevolucaoCompensacao?> ObterCompensacaoPorOperacaoIdAsync(Guid operacaoId)
    {
        if (operacaoId == Guid.Empty) return null;
        return await _db.CompraItemDevolucaoCompensacoes
            .AsNoTracking()
            .Include(c => c.CompraItemDevolucao)
            .FirstOrDefaultAsync(c => c.OperacaoId == operacaoId);
    }

    public async Task<IReadOnlyCollection<CompraItemDevolucao>> ObterPorCompraAsync(Guid compraId, DateTime? referencia = null)
    {
        if (compraId == Guid.Empty) return Array.Empty<CompraItemDevolucao>();
        return await AplicarReferencia(QueryCompleta().AsNoTracking(), referencia)
            .Where(d => d.CompraId == compraId)
            .OrderBy(d => d.DataDevolucao)
            .ThenBy(d => d.CreatedAt)
            .ToListAsync();
    }

    public async Task<IReadOnlyCollection<CompraItemDevolucao>> ObterPorItemAsync(Guid compraItemId, DateTime? referencia = null)
    {
        if (compraItemId == Guid.Empty) return Array.Empty<CompraItemDevolucao>();
        return await AplicarReferencia(QueryCompleta().AsNoTracking(), referencia)
            .Where(d => d.CompraItemId == compraItemId)
            .OrderBy(d => d.DataDevolucao)
            .ThenBy(d => d.CreatedAt)
            .ToListAsync();
    }

    public async Task<int> ObterQuantidadeVigenteAntesRecebimentoAsync(Guid compraItemId, DateTime? referencia = null)
    {
        if (compraItemId == Guid.Empty) return 0;

        var devolucoes = await AplicarReferencia(QueryCompleta().AsNoTracking(), referencia)
            .Where(d => d.CompraItemId == compraItemId
                && d.Momento == CompraItemDevolucaoMomento.AntesDoRecebimento)
            .ToListAsync();

        return CalcularQuantidadeVigente(devolucoes, referencia);
    }

    public async Task<int> ObterQuantidadeVigenteDepoisRecebimentoAsync(Guid compraItemRecebimentoId, DateTime? referencia = null)
    {
        if (compraItemRecebimentoId == Guid.Empty) return 0;

        var devolucoes = await AplicarReferencia(QueryCompleta().AsNoTracking(), referencia)
            .Where(d => d.CompraItemRecebimentoId == compraItemRecebimentoId
                && d.Momento == CompraItemDevolucaoMomento.DepoisDoRecebimento)
            .ToListAsync();

        return CalcularQuantidadeVigente(devolucoes, referencia);
    }

    private IQueryable<CompraItemDevolucao> QueryCompleta()
    {
        return _db.CompraItemDevolucoes
            .Include(d => d.Compensacao);
    }

    private static IQueryable<CompraItemDevolucao> AplicarReferencia(
        IQueryable<CompraItemDevolucao> query,
        DateTime? referencia)
    {
        if (!referencia.HasValue) return query;
        var data = DateTime.SpecifyKind(referencia.Value.Date, DateTimeKind.Utc);
        return query.Where(d => d.DataDevolucao <= data);
    }

    private static int CalcularQuantidadeVigente(
        IEnumerable<CompraItemDevolucao> devolucoes,
        DateTime? referencia)
    {
        var data = referencia.HasValue
            ? DateTime.SpecifyKind(referencia.Value.Date, DateTimeKind.Utc)
            : (DateTime?)null;

        return devolucoes.Sum(d =>
            d.Compensacao != null && (!data.HasValue || d.Compensacao.DataCompensacao <= data.Value)
                ? 0
                : d.Quantidade);
    }
}
