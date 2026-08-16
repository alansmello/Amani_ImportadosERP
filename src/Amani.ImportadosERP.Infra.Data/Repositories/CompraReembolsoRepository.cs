using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Infra.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace Amani.ImportadosERP.Infra.Data.Repositories;

public class CompraReembolsoRepository : ICompraReembolsoRepository
{
    private readonly AmaniDbContext _db;

    public CompraReembolsoRepository(AmaniDbContext db)
    {
        _db = db;
    }

    public async Task AdicionarAsync(CompraReembolso reembolso)
    {
        ArgumentNullException.ThrowIfNull(reembolso);
        await _db.CompraReembolsos.AddAsync(reembolso);
        await _db.SaveChangesAsync();
    }

    public async Task AdicionarSemSalvarAsync(CompraReembolso reembolso)
    {
        ArgumentNullException.ThrowIfNull(reembolso);
        await _db.CompraReembolsos.AddAsync(reembolso);
    }

    public async Task AdicionarCancelamentoAsync(CompraReembolsoCancelamento cancelamento)
    {
        ArgumentNullException.ThrowIfNull(cancelamento);
        await _db.CompraReembolsoCancelamentos.AddAsync(cancelamento);
        await _db.SaveChangesAsync();
    }

    public async Task<CompraReembolso?> ObterPorIdAsync(Guid id)
    {
        if (id == Guid.Empty) return null;
        return await QueryCompleta()
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<CompraReembolso?> ObterPorOperacaoIdAsync(Guid operacaoId)
    {
        if (operacaoId == Guid.Empty) return null;
        return await QueryCompleta()
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.OperacaoId == operacaoId);
    }

    public async Task<CompraReembolsoCancelamento?> ObterCancelamentoPorOperacaoIdAsync(Guid operacaoId)
    {
        if (operacaoId == Guid.Empty) return null;
        return await _db.CompraReembolsoCancelamentos
            .AsNoTracking()
            .Include(c => c.CompraReembolso)
            .FirstOrDefaultAsync(c => c.OperacaoId == operacaoId);
    }

    public async Task<IReadOnlyCollection<CompraReembolso>> ObterPorCompraAsync(Guid compraId, DateTime? referencia = null)
    {
        if (compraId == Guid.Empty) return Array.Empty<CompraReembolso>();

        return await AplicarReferencia(QueryCompleta().AsNoTracking(), referencia)
            .Where(r => r.CompraId == compraId)
            .OrderBy(r => r.DataReembolso)
            .ThenBy(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<decimal> ObterTotalLiquidoPorCompraAsync(Guid compraId, DateTime? referencia = null)
    {
        if (compraId == Guid.Empty) return 0m;

        var reembolsos = await AplicarReferencia(QueryCompleta().AsNoTracking(), referencia)
            .Where(r => r.CompraId == compraId)
            .ToListAsync();

        var data = referencia.HasValue
            ? DateTime.SpecifyKind(referencia.Value.Date, DateTimeKind.Utc)
            : (DateTime?)null;

        var creditos = reembolsos.Sum(r => r.Valor);
        var cancelamentos = reembolsos
            .Where(r => r.Cancelamento != null && (!data.HasValue || r.Cancelamento.DataCancelamento <= data.Value))
            .Sum(r => r.Valor);

        return decimal.Round(Math.Max(0m, creditos - cancelamentos), 2, MidpointRounding.AwayFromZero);
    }

    public async Task<bool> ExisteReferenciaExternaAsync(Guid compraId, string referenciaExterna)
    {
        if (compraId == Guid.Empty || string.IsNullOrWhiteSpace(referenciaExterna)) return false;
        var referencia = referenciaExterna.Trim();

        return await _db.CompraReembolsos
            .AsNoTracking()
            .AnyAsync(r => r.CompraId == compraId && r.ReferenciaExterna == referencia);
    }

    private IQueryable<CompraReembolso> QueryCompleta()
    {
        return _db.CompraReembolsos
            .Include(r => r.Cancelamento)
            .Include(r => r.Alocacoes);
    }

    private static IQueryable<CompraReembolso> AplicarReferencia(
        IQueryable<CompraReembolso> query,
        DateTime? referencia)
    {
        if (!referencia.HasValue) return query;
        var data = DateTime.SpecifyKind(referencia.Value.Date, DateTimeKind.Utc);
        return query.Where(r => r.DataReembolso <= data);
    }
}
