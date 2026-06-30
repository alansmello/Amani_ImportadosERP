using Amani.ImportadosERP.Application.DTOs.Dashboards;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Infra.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace Amani.ImportadosERP.Infra.Data.Repositories;

public sealed class DashboardEstoqueRepository : IDashboardEstoqueRepository
{
    private readonly AmaniDbContext _db;
    private readonly DashboardCustoMedioReadService _custoMedioReadService;

    public DashboardEstoqueRepository(
        AmaniDbContext db,
        DashboardCustoMedioReadService custoMedioReadService)
    {
        _db = db;
        _custoMedioReadService = custoMedioReadService;
    }

    public async Task<DashboardEstoqueValorizadoDto> ObterEstoqueValorizadoAsync(DateTime dataReferencia)
    {
        var saldos = await _db.EstoqueMovimentacoes
            .AsNoTracking()
            .Where(m => m.Data <= dataReferencia)
            .GroupBy(m => m.ProdutoId)
            .Select(g => new
            {
                ProdutoId = g.Key,
                Saldo = g.Sum(m =>
                    m.Tipo == TipoMovimentacao.Saida
                        ? -m.Quantidade
                        : m.Tipo == TipoMovimentacao.InventarioInicial
                            ? m.Quantidade
                            : m.Tipo == TipoMovimentacao.Entrada && m.CompraItemId != null
                                ? m.Quantidade
                                : 0)
            })
            .Where(x => x.Saldo > 0)
            .ToListAsync();

        if (saldos.Count == 0)
        {
            return new DashboardEstoqueValorizadoDto();
        }

        var produtoIds = saldos.Select(s => s.ProdutoId).ToList();
        var precosVenda = await _db.Produtos
            .AsNoTracking()
            .Where(p => produtoIds.Contains(p.Id))
            .Select(p => new { p.Id, p.PrecoVenda })
            .ToDictionaryAsync(p => p.Id, p => p.PrecoVenda);

        var custos = await _custoMedioReadService.ObterCustosMediosAsync(produtoIds, dataReferencia);

        var quantidadeTotal = 0;
        var valorAoCusto = 0m;
        var valorAoPrecoVenda = 0m;
        var lucroPotencialCalculavel = 0m;
        var quantidadeSemCusto = 0;
        var valorVendaSemCusto = 0m;

        foreach (var saldo in saldos)
        {
            if (!precosVenda.TryGetValue(saldo.ProdutoId, out var precoVenda))
            {
                continue;
            }

            quantidadeTotal += saldo.Saldo;
            var valorPotencial = saldo.Saldo * precoVenda;
            valorAoPrecoVenda += valorPotencial;

            if (custos.TryGetValue(saldo.ProdutoId, out var custoMedio))
            {
                valorAoCusto += saldo.Saldo * custoMedio;
                lucroPotencialCalculavel += saldo.Saldo * (precoVenda - custoMedio);
            }
            else
            {
                quantidadeSemCusto += saldo.Saldo;
                valorVendaSemCusto += valorPotencial;
            }
        }

        return new DashboardEstoqueValorizadoDto
        {
            QuantidadeTotal = quantidadeTotal,
            ValorAoCusto = valorAoCusto,
            ValorAoPrecoVenda = valorAoPrecoVenda,
            LucroPotencialCalculavel = lucroPotencialCalculavel,
            QuantidadeSemCusto = quantidadeSemCusto,
            ValorVendaSemCusto = valorVendaSemCusto
        };
    }
}
