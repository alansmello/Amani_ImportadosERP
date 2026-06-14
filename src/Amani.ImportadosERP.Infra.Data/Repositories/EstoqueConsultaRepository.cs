using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Infra.Data.Context;

namespace Amani.ImportadosERP.Infra.Data.Repositories;

public class EstoqueConsultaRepository : IEstoqueConsultaRepository
{
    private readonly AmaniDbContext _db;

    public EstoqueConsultaRepository(AmaniDbContext db)
    {
        _db = db;
    }

    public async Task<int> ObterSaldoAsync(Guid produtoId)
    {
        if (produtoId == Guid.Empty) throw new ArgumentException("produtoId inválido", nameof(produtoId));

        var entradas = await _db.EstoqueMovimentacoes
            .Where(m => m.ProdutoId == produtoId
                && (m.Tipo == TipoMovimentacao.Entrada || m.Tipo == TipoMovimentacao.InventarioInicial))
            .SumAsync(m => (int?)m.Quantidade) ?? 0;

        var saidas = await _db.EstoqueMovimentacoes
            .Where(m => m.ProdutoId == produtoId && m.Tipo == TipoMovimentacao.Saida)
            .SumAsync(m => (int?)m.Quantidade) ?? 0;

        return entradas - saidas;
    }

    public async Task<IReadOnlyCollection<EstoqueProdutoSaldoDto>> ObterSaldosAsync(Guid? categoriaId, bool apenasComSaldo)
    {
        var query = _db.Produtos
            .AsNoTracking()
            .AsQueryable();

        if (categoriaId.HasValue)
        {
            query = query.Where(p => p.CategoriaId == categoriaId.Value);
        }

        var saldos = query
            .GroupJoin(
                _db.EstoqueMovimentacoes.AsNoTracking(),
                produto => produto.Id,
                movimentacao => movimentacao.ProdutoId,
                (produto, movimentacoes) => new EstoqueProdutoSaldoDto
                {
                    ProdutoId = produto.Id,
                    NomeProduto = produto.Nome,
                    CategoriaId = produto.CategoriaId,
                    Saldo = movimentacoes.Sum(m =>
                        m.Tipo == TipoMovimentacao.Saida
                            ? (int?)-m.Quantidade
                            : m.Quantidade) ?? 0
                });

        if (apenasComSaldo)
        {
            saldos = saldos.Where(p => p.Saldo > 0);
        }

        return await saldos
            .OrderBy(p => p.NomeProduto)
            .ThenBy(p => p.ProdutoId)
            .ToListAsync();
    }

    public async Task<IReadOnlyCollection<EstoqueMovimentacaoItemDto>> ObterMovimentacoesAsync(
        Guid produtoId,
        DateTime? dataInicio,
        DateTime? dataFim,
        TipoMovimentacao? tipo,
        int limite)
    {
        if (produtoId == Guid.Empty) return Array.Empty<EstoqueMovimentacaoItemDto>();
        if (limite <= 0) return Array.Empty<EstoqueMovimentacaoItemDto>();

        var movimentacoes = await AplicarFiltrosMovimentacoes(produtoId, dataInicio, dataFim, tipo)
            .OrderByDescending(m => m.Data)
            .ThenByDescending(m => m.CreatedAt)
            .Take(limite)
            .ToListAsync();

        return movimentacoes
            .Select(m => new EstoqueMovimentacaoItemDto
            {
                Id = m.Id,
                Data = m.Data,
                Tipo = m.Tipo.ToString(),
                Quantidade = m.Quantidade,
                Origem = m.Tipo == TipoMovimentacao.InventarioInicial
                    ? "InventarioInicial"
                    : m.Tipo == TipoMovimentacao.Saida
                        ? "Venda"
                        : "Compra",
                CompraId = m.CompraId,
                CompraItemId = m.CompraItemId,
                VendaId = m.VendaId,
                ValorUnitario = m.ValorUnitario
            })
            .ToList();
    }

    public async Task<int> ContarMovimentacoesAsync(Guid produtoId, DateTime? dataInicio, DateTime? dataFim, TipoMovimentacao? tipo)
    {
        if (produtoId == Guid.Empty) return 0;

        return await AplicarFiltrosMovimentacoes(produtoId, dataInicio, dataFim, tipo)
            .CountAsync();
    }

    private IQueryable<EstoqueMovimentacao> AplicarFiltrosMovimentacoes(
        Guid produtoId,
        DateTime? dataInicio,
        DateTime? dataFim,
        TipoMovimentacao? tipo)
    {
        var query = _db.EstoqueMovimentacoes
            .AsNoTracking()
            .Where(m => m.ProdutoId == produtoId);

        if (dataInicio.HasValue)
        {
            query = query.Where(m => m.Data >= dataInicio.Value);
        }

        if (dataFim.HasValue)
        {
            query = query.Where(m => m.Data <= dataFim.Value);
        }

        if (tipo.HasValue)
        {
            query = query.Where(m => m.Tipo == tipo.Value);
        }

        return query;
    }
}
