using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Common;
using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Infra.Data.Context;
using Microsoft.EntityFrameworkCore;
using System.Numerics;

namespace Amani.ImportadosERP.Infra.Data.Repositories;

public class EstoqueConsultaRepository : IEstoqueConsultaRepository
{
    private readonly AmaniDbContext _db;

    public EstoqueConsultaRepository(AmaniDbContext db) => _db = db;

    public async Task<decimal> ObterSaldoAsync(Guid produtoId) =>
        (await ObterSaldoExatoAsync(produtoId)).ParaDecimal();

    public async Task<QuantidadeRacional> ObterSaldoExatoAsync(Guid produtoId)
    {
        if (produtoId == Guid.Empty) throw new ArgumentException("produtoId inválido", nameof(produtoId));
        var saldos = await ObterSaldosExatosAsync(new[] { produtoId });
        return saldos.TryGetValue(produtoId, out var saldo) ? saldo : QuantidadeRacional.Zero;
    }

    public async Task<IReadOnlyCollection<EstoqueProdutoSaldoDto>> ObterSaldosAsync(Guid? categoriaId, bool apenasComSaldo)
    {
        var query = _db.Produtos.AsNoTracking().AsQueryable();
        if (categoriaId.HasValue) query = query.Where(p => p.CategoriaId == categoriaId.Value);

        var produtos = await query
            .Select(p => new { p.Id, p.Nome, p.CategoriaId })
            .OrderBy(p => p.Nome)
            .ThenBy(p => p.Id)
            .ToListAsync();

        var saldosExatos = await ObterSaldosExatosAsync(produtos.Select(p => p.Id).ToArray());
        var saldos = produtos.Select(p => new EstoqueProdutoSaldoDto
        {
            ProdutoId = p.Id,
            NomeProduto = p.Nome,
            CategoriaId = p.CategoriaId,
            Saldo = saldosExatos.TryGetValue(p.Id, out var saldo) ? saldo.ParaDecimal() : 0m
        });

        if (apenasComSaldo) saldos = saldos.Where(p => p.Saldo > 0m);
        return saldos.OrderBy(p => p.NomeProduto).ThenBy(p => p.ProdutoId).ToList();
    }

    public async Task<IReadOnlyCollection<EstoqueMovimentacaoItemDto>> ObterMovimentacoesAsync(
        Guid produtoId,
        DateTime? dataInicio,
        DateTime? dataFim,
        TipoMovimentacao? tipo,
        int limite)
    {
        if (produtoId == Guid.Empty || limite <= 0) return Array.Empty<EstoqueMovimentacaoItemDto>();

        var movimentacoes = await AplicarFiltrosMovimentacoes(produtoId, dataInicio, dataFim, tipo)
            .OrderByDescending(m => m.Data)
            .ThenByDescending(m => m.CreatedAt)
            .Take(limite)
            .ToListAsync();

        var movimentacaoIds = movimentacoes.Select(m => m.Id).ToArray();
        var devolucoesPorMovimentacao = await _db.CompraItemDevolucoes
            .AsNoTracking()
            .Where(d => d.EstoqueMovimentacaoId.HasValue
                && movimentacaoIds.Contains(d.EstoqueMovimentacaoId.Value))
            .Select(d => new
            {
                EstoqueMovimentacaoId = d.EstoqueMovimentacaoId!.Value,
                DevolucaoId = d.Id,
                d.CompraId,
                d.CompraItemId,
                d.CompraItemRecebimentoId
            })
            .ToDictionaryAsync(d => d.EstoqueMovimentacaoId);

        var compensacoesPorMovimentacao = await _db.CompraItemDevolucaoCompensacoes
            .AsNoTracking()
            .Where(c => c.EstoqueMovimentacaoId.HasValue
                && movimentacaoIds.Contains(c.EstoqueMovimentacaoId.Value))
            .Select(c => new
            {
                EstoqueMovimentacaoId = c.EstoqueMovimentacaoId!.Value,
                DevolucaoId = c.CompraItemDevolucaoId,
                c.CompraItemDevolucao!.CompraId,
                c.CompraItemDevolucao.CompraItemId,
                c.CompraItemDevolucao.CompraItemRecebimentoId
            })
            .ToDictionaryAsync(c => c.EstoqueMovimentacaoId);

        return movimentacoes.Select(m =>
        {
            devolucoesPorMovimentacao.TryGetValue(m.Id, out var devolucao);
            compensacoesPorMovimentacao.TryGetValue(m.Id, out var compensacao);

            return new EstoqueMovimentacaoItemDto
            {
                Id = m.Id,
                Data = m.Data,
                Tipo = m.Tipo.ToString(),
                Quantidade = m.Quantidade,
                Origem = compensacao != null
                    ? "CompensacaoDevolucaoCompra"
                    : devolucao != null
                    ? "DevolucaoCompra"
                    : m.Tipo == TipoMovimentacao.InventarioInicial
                        ? "InventarioInicial"
                        : m.Tipo == TipoMovimentacao.Saida ? "Venda" : m.VendaItemId.HasValue ? "CancelamentoVenda" : "Compra",
                CompraId = compensacao?.CompraId ?? devolucao?.CompraId ?? m.CompraId,
                CompraItemId = compensacao?.CompraItemId ?? devolucao?.CompraItemId ?? m.CompraItemId,
                CompraItemDevolucaoId = compensacao?.DevolucaoId ?? devolucao?.DevolucaoId,
                CompraItemRecebimentoId = compensacao?.CompraItemRecebimentoId ?? devolucao?.CompraItemRecebimentoId,
                VendaId = m.VendaId,
                ValorUnitario = m.ValorUnitario
            };
        }).ToList();
    }

    public async Task<int> ContarMovimentacoesAsync(Guid produtoId, DateTime? dataInicio, DateTime? dataFim, TipoMovimentacao? tipo)
    {
        if (produtoId == Guid.Empty) return 0;
        return await AplicarFiltrosMovimentacoes(produtoId, dataInicio, dataFim, tipo).CountAsync();
    }

    private IQueryable<EstoqueMovimentacao> AplicarFiltrosMovimentacoes(
        Guid produtoId,
        DateTime? dataInicio,
        DateTime? dataFim,
        TipoMovimentacao? tipo)
    {
        var query = _db.EstoqueMovimentacoes.AsNoTracking().Where(m => m.ProdutoId == produtoId);
        if (dataInicio.HasValue) query = query.Where(m => m.Data >= dataInicio.Value);
        if (dataFim.HasValue) query = query.Where(m => m.Data <= dataFim.Value);
        if (tipo.HasValue) query = query.Where(m => m.Tipo == tipo.Value);
        return query;
    }

    public async Task<IReadOnlyDictionary<Guid, QuantidadeRacional>> ObterSaldosExatosAsync(
        IReadOnlyCollection<Guid> produtoIds,
        DateTime? dataReferencia = null)
    {
        if (produtoIds.Count == 0) return new Dictionary<Guid, QuantidadeRacional>();

        var movimentosExatos = _db.EstoqueMovimentacoes
            .AsNoTracking()
            .Where(m => produtoIds.Contains(m.ProdutoId)
                && m.QuantidadeExataNumerador.HasValue
                && m.QuantidadeExataDenominador.HasValue);
        var movimentosLegados = _db.EstoqueMovimentacoes
            .AsNoTracking()
            .Where(m => produtoIds.Contains(m.ProdutoId) && !m.QuantidadeExataNumerador.HasValue);
        if (dataReferencia.HasValue)
        {
            movimentosExatos = movimentosExatos.Where(m => m.Data <= dataReferencia.Value);
            movimentosLegados = movimentosLegados.Where(m => m.Data <= dataReferencia.Value);
        }

        var exatas = await movimentosExatos
            .GroupBy(m => new { m.ProdutoId, m.Tipo, Denominador = m.QuantidadeExataDenominador!.Value })
            .Select(g => new
            {
                g.Key.ProdutoId,
                g.Key.Tipo,
                g.Key.Denominador,
                Numerador = g.Sum(m => (decimal)m.QuantidadeExataNumerador!.Value)
            })
            .ToListAsync();

        var legadas = await movimentosLegados
            .GroupBy(m => new { m.ProdutoId, m.Tipo })
            .Select(g => new { g.Key.ProdutoId, g.Key.Tipo, Quantidade = g.Sum(m => m.Quantidade) })
            .ToListAsync();

        var resultado = new Dictionary<Guid, QuantidadeRacional>();
        foreach (var item in exatas)
        {
            var quantidade = new QuantidadeRacional(new BigInteger(item.Numerador), item.Denominador);
            Adicionar(resultado, item.ProdutoId, item.Tipo == TipoMovimentacao.Saida ? QuantidadeRacional.Zero - quantidade : quantidade);
        }

        foreach (var item in legadas)
        {
            var quantidade = QuantidadeRacional.DeDecimal(item.Quantidade);
            Adicionar(resultado, item.ProdutoId, item.Tipo == TipoMovimentacao.Saida ? QuantidadeRacional.Zero - quantidade : quantidade);
        }

        return resultado;
    }

    private static void Adicionar(Dictionary<Guid, QuantidadeRacional> saldos, Guid produtoId, QuantidadeRacional quantidade)
    {
        saldos[produtoId] = saldos.TryGetValue(produtoId, out var atual) ? atual + quantidade : quantidade;
    }
}
