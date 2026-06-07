using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Infra.Data.Context;

namespace Amani.ImportadosERP.Infra.Data.Repositories;

public class CompraRepository : ICompraRepository
{
    private readonly AmaniDbContext _db;

    public CompraRepository(AmaniDbContext db)
    {
        _db = db;
    }

    public async Task AdicionarAsync(Compra compra)
    {
        if (compra == null) throw new ArgumentNullException(nameof(compra));
        await _db.Compras.AddAsync(compra);
        await _db.SaveChangesAsync();
    }

    public async Task<Compra?> ObterPorIdAsync(Guid id)
    {
        if (id == Guid.Empty) return null;
        return await QueryCompraCompleta()
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<Compra?> ObterPorIdParaAtualizarAsync(Guid id)
    {
        if (id == Guid.Empty) return null;
        return await QueryCompraCompleta()
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<Compra?> ObterPorIdComItemParaAtualizarAsync(Guid compraId, Guid itemId)
    {
        if (compraId == Guid.Empty || itemId == Guid.Empty) return null;
        return await QueryCompraCompleta()
            .FirstOrDefaultAsync(c => c.Id == compraId && c.Items.Any(i => i.Id == itemId));
    }

    public async Task<List<Compra>> ObterTodasAsync()
    {
        return await QueryCompraCompleta()
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<List<Compra>> ObterComFiltrosAsync(DateTime? dataInicio, DateTime? dataFim, Guid? fornecedorId)
    {
        var query = QueryCompraCompleta().AsNoTracking().AsQueryable();

        if (dataInicio.HasValue)
            query = query.Where(c => c.DataCompra >= dataInicio.Value);

        if (dataFim.HasValue)
            query = query.Where(c => c.DataCompra <= dataFim.Value);

        if (fornecedorId.HasValue)
            query = query.Where(c => c.FornecedorId == fornecedorId.Value);

        return await query.ToListAsync();
    }

    public async Task<List<Compra>> ObterComprasEmTransitoAsync()
    {
        return await QueryComprasEmTransito()
            .Where(c => c.Items.Any(i =>
                i.Quantidade
                - i.Recebimentos.Sum(r => r.Quantidade)
                - i.Perdas.Sum(p => p.Quantidade) > 0))
            .OrderBy(c => c.DataCompra)
            .ToListAsync();
    }

    public async Task<List<Compra>> ObterComprasComProdutosPendentesAsync()
    {
        return await QueryComprasEmTransito()
            .Where(c => c.Items.Any(i =>
                i.Quantidade
                - i.Recebimentos.Sum(r => r.Quantidade)
                - i.Perdas.Sum(p => p.Quantidade) > 0))
            .OrderBy(c => c.DataCompra)
            .ToListAsync();
    }

    public async Task<List<CompraItemRecebimento>> ObterRecebimentosPorCompraAsync(Guid compraId)
    {
        if (compraId == Guid.Empty) return new List<CompraItemRecebimento>();

        return await _db.CompraItemRecebimentos
            .AsNoTracking()
            .Where(r => r.CompraId == compraId)
            .OrderBy(r => r.DataRecebimento)
            .ThenBy(r => r.Origem)
            .ToListAsync();
    }

    public async Task<List<CompraItemPerda>> ObterPerdasPorCompraAsync(Guid compraId)
    {
        if (compraId == Guid.Empty) return new List<CompraItemPerda>();

        return await _db.CompraItemPerdas
            .AsNoTracking()
            .Where(p => p.CompraId == compraId)
            .OrderBy(p => p.DataPerda)
            .ThenBy(p => p.Motivo)
            .ToListAsync();
    }

    public async Task SalvarAsync()
    {
        await _db.SaveChangesAsync();
    }

    private IQueryable<Compra> QueryComprasEmTransito()
    {
        return QueryCompraCompleta()
            .AsNoTracking()
            .Where(c => c.Status != CompraStatus.Recebida
                && c.Status != CompraStatus.Finalizada
                && c.Status != CompraStatus.Cancelada);
    }

    private IQueryable<Compra> QueryCompraCompleta()
    {
        return _db.Compras
            .Include(c => c.Items)
                .ThenInclude(i => i.Recebimentos)
            .Include(c => c.Items)
                .ThenInclude(i => i.Perdas)
            .Include(c => c.Recebimentos)
            .Include(c => c.Perdas);
    }
}

