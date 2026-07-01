using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Infra.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace Amani.ImportadosERP.Infra.Data.Repositories;

public sealed class ProdutoApresentacaoRepository : IProdutoApresentacaoRepository
{
    private readonly AmaniDbContext _db;

    public ProdutoApresentacaoRepository(AmaniDbContext db) => _db = db;

    public async Task AdicionarAsync(ProdutoApresentacao apresentacao)
    {
        await _db.ProdutoApresentacoes.AddAsync(apresentacao);
        await _db.SaveChangesAsync();
    }

    public Task<ProdutoApresentacao?> ObterPorIdAsync(Guid id) =>
        _db.ProdutoApresentacoes.AsNoTracking().FirstOrDefaultAsync(a => a.Id == id);

    public Task<ProdutoApresentacao?> ObterPorIdParaAtualizarAsync(Guid id) =>
        _db.ProdutoApresentacoes.FirstOrDefaultAsync(a => a.Id == id);

    public async Task<IReadOnlyCollection<ProdutoApresentacao>> ListarPorProdutoAsync(Guid produtoId, bool apenasAtivas = false)
    {
        var query = _db.ProdutoApresentacoes.AsNoTracking().Where(a => a.ProdutoId == produtoId);
        if (apenasAtivas) query = query.Where(a => a.Ativo);
        return await query.OrderBy(a => a.Nome).ToListAsync();
    }

    public Task<bool> NomeExisteAsync(Guid produtoId, string nome, Guid? ignorarId = null)
    {
        var normalizado = nome.Trim().ToLower();
        return _db.ProdutoApresentacoes.AnyAsync(a =>
            a.ProdutoId == produtoId &&
            a.Nome.ToLower() == normalizado &&
            (!ignorarId.HasValue || a.Id != ignorarId.Value));
    }

    public Task SalvarAsync() => _db.SaveChangesAsync();
}
