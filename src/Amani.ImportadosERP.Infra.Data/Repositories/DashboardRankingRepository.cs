using Amani.ImportadosERP.Application.DTOs.Dashboards;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Infra.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace Amani.ImportadosERP.Infra.Data.Repositories;

public sealed class DashboardRankingRepository : IDashboardRankingRepository
{
    private readonly AmaniDbContext _db;

    public DashboardRankingRepository(AmaniDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyCollection<RankingProdutoDto>> ObterProdutosMaisVendidosAsync(
        DateTime dataInicial,
        DateTime dataFinal,
        int limite)
    {
        var vendas = await VendasConfirmadasNoPeriodo(dataInicial, dataFinal)
            .Include(v => v.Items)
            .ToListAsync();

        var agregados = vendas
            .SelectMany(v => v.Items)
            .GroupBy(i => i.ProdutoId)
            .Select(g => new RankingAgregado(
                g.Key,
                g.Sum(i => i.Quantidade),
                g.Sum(i => i.ValorTotal())))
            .ToList();

        var produtos = await ObterProdutosAsync(agregados.Select(a => a.ProdutoId).ToList());

        return agregados
            .Select(a => CriarRanking(
                "ProdutosMaisVendidos",
                a.ProdutoId,
                ObterNomeProduto(produtos, a.ProdutoId),
                a.Quantidade,
                a.ValorFinanceiro,
                "QuantidadeVendidaDescValorDescNomeAscIdAsc"))
            .OrderByDescending(r => r.Quantidade)
            .ThenByDescending(r => r.ValorFinanceiro ?? 0m)
            .ThenBy(r => r.ProdutoNome)
            .ThenBy(r => r.ProdutoId)
            .Take(limite)
            .Select((r, index) => ComPosicao(r, index + 1))
            .ToList();
    }

    public async Task<(IReadOnlyCollection<RankingProdutoDto> Rankings, IReadOnlyCollection<AvisoDadoIncompletoDto> Avisos)> ObterProdutosMaisLucrativosAsync(
        DateTime dataInicial,
        DateTime dataFinal,
        DateTime dataReferencia,
        int limite)
    {
        var vendas = await VendasConfirmadasNoPeriodo(dataInicial, dataFinal)
            .Include(v => v.Items)
            .ToListAsync();

        var agregados = vendas
            .SelectMany(v => v.Items)
            .GroupBy(i => i.ProdutoId)
            .Select(g => new RankingAgregado(
                g.Key,
                g.Sum(i => i.Quantidade),
                g.Sum(i => i.ValorTotal())))
            .ToList();

        var produtoIds = agregados.Select(a => a.ProdutoId).ToList();
        var produtos = await ObterProdutosAsync(produtoIds);
        var custos = await ObterCustosMediosAsync(produtoIds, dataReferencia);

        var rankings = agregados
            .Where(a => custos.ContainsKey(a.ProdutoId))
            .Select(a =>
            {
                var lucro = a.ValorFinanceiro - (custos[a.ProdutoId] * a.Quantidade);
                return CriarRanking(
                    "ProdutosMaisLucrativos",
                    a.ProdutoId,
                    ObterNomeProduto(produtos, a.ProdutoId),
                    a.Quantidade,
                    lucro,
                    "LucroTotalDescNomeAscIdAsc");
            })
            .OrderByDescending(r => r.ValorFinanceiro ?? 0m)
            .ThenBy(r => r.ProdutoNome)
            .ThenBy(r => r.ProdutoId)
            .Take(limite)
            .Select((r, index) => ComPosicao(r, index + 1))
            .ToList();

        var avisos = agregados
            .Where(a => !custos.ContainsKey(a.ProdutoId))
            .OrderBy(a => ObterNomeProduto(produtos, a.ProdutoId))
            .ThenBy(a => a.ProdutoId)
            .Select(a => new AvisoDadoIncompletoDto
            {
                Codigo = "CUSTO_MEDIO_AUSENTE",
                Mensagem = "Produto vendido sem custo medio derivado de entradas reais em estoque.",
                EntidadeTipo = "Produto",
                EntidadeId = a.ProdutoId,
                Impacto = $"Produto {ObterNomeProduto(produtos, a.ProdutoId)} possui R$ {a.ValorFinanceiro:N2} de receita sem lucro calculavel no ranking."
            })
            .ToList();

        return (rankings, avisos);
    }

    public async Task<IReadOnlyCollection<RankingProdutoDto>> ObterProdutosComMaiorEstoqueAsync(
        DateTime dataReferencia,
        int limite)
    {
        var rankings = await ObterRankingsDeEstoqueAsync(dataReferencia, "ProdutosComMaiorEstoque", "EstoqueDisponivelDescNomeAscIdAsc");

        return rankings
            .OrderByDescending(r => r.Quantidade)
            .ThenBy(r => r.ProdutoNome)
            .ThenBy(r => r.ProdutoId)
            .Take(limite)
            .Select((r, index) => ComPosicao(r, index + 1))
            .ToList();
    }

    public async Task<IReadOnlyCollection<RankingProdutoDto>> ObterProdutosComMenorEstoqueAsync(
        DateTime dataReferencia,
        int limite)
    {
        var rankings = await ObterRankingsDeEstoqueAsync(dataReferencia, "ProdutosComMenorEstoque", "EstoqueDisponivelAscNomeAscIdAsc");

        return rankings
            .OrderBy(r => r.Quantidade)
            .ThenBy(r => r.ProdutoNome)
            .ThenBy(r => r.ProdutoId)
            .Take(limite)
            .Select((r, index) => ComPosicao(r, index + 1))
            .ToList();
    }

    public async Task<IReadOnlyCollection<RankingClienteDto>> ObterClientesMaisValiososAsync(
        DateTime dataInicial,
        DateTime dataFinal,
        int limite)
    {
        var vendas = await VendasConfirmadasNoPeriodo(dataInicial, dataFinal)
            .Include(v => v.Items)
            .ToListAsync();

        var agregados = vendas
            .GroupBy(v => v.ClienteId)
            .Select(g => new RankingClienteAgregado(
                g.Key,
                g.Count(),
                g.Sum(v => v.Total())))
            .ToList();

        var clientes = await ObterClientesAsync(agregados.Select(a => a.ClienteId).ToList());

        return agregados
            .Select(a => CriarRankingCliente(
                "ClientesMaiorFaturamento",
                a.ClienteId,
                ObterNomeCliente(clientes, a.ClienteId),
                a.Quantidade,
                a.ValorFinanceiro,
                "ValorFinanceiroDescQuantidadeDescNomeAscIdAsc"))
            .OrderByDescending(r => r.ValorFinanceiro ?? 0m)
            .ThenByDescending(r => r.Quantidade)
            .ThenBy(r => r.ClienteNome)
            .ThenBy(r => r.ClienteId)
            .Take(limite)
            .Select((r, index) => ComPosicao(r, index + 1))
            .ToList();
    }

    private IQueryable<Venda> VendasConfirmadasNoPeriodo(DateTime dataInicial, DateTime dataFinal)
    {
        return _db.Vendas
            .AsNoTracking()
            .Where(v => !v.Cancelada
                && v.DataVenda >= dataInicial
                && v.DataVenda <= dataFinal);
    }

    private async Task<IReadOnlyDictionary<Guid, ProdutoResumo>> ObterProdutosAsync(IReadOnlyCollection<Guid> produtoIds)
    {
        if (!produtoIds.Any())
        {
            return new Dictionary<Guid, ProdutoResumo>();
        }

        return await _db.Produtos
            .AsNoTracking()
            .Where(p => produtoIds.Contains(p.Id))
            .Select(p => new ProdutoResumo(p.Id, p.Nome))
            .ToDictionaryAsync(p => p.Id);
    }

    private async Task<IReadOnlyDictionary<Guid, ClienteResumo>> ObterClientesAsync(IReadOnlyCollection<Guid> clienteIds)
    {
        if (!clienteIds.Any())
        {
            return new Dictionary<Guid, ClienteResumo>();
        }

        return await _db.Clientes
            .AsNoTracking()
            .Where(c => clienteIds.Contains(c.Id))
            .Select(c => new ClienteResumo(c.Id, c.Nome))
            .ToDictionaryAsync(c => c.Id);
    }

    private async Task<IReadOnlyDictionary<Guid, decimal>> ObterCustosMediosAsync(
        IReadOnlyCollection<Guid> produtoIds,
        DateTime dataReferencia)
    {
        if (!produtoIds.Any())
        {
            return new Dictionary<Guid, decimal>();
        }

        var entradas = await _db.EstoqueMovimentacoes
            .AsNoTracking()
            .Where(m => produtoIds.Contains(m.ProdutoId)
                && m.Data <= dataReferencia
                && m.ValorUnitario != null
                && (m.Tipo == TipoMovimentacao.InventarioInicial
                    || (m.Tipo == TipoMovimentacao.Entrada && m.CompraItemId != null)))
            .GroupBy(m => m.ProdutoId)
            .Select(g => new
            {
                ProdutoId = g.Key,
                Quantidade = g.Sum(m => m.Quantidade),
                Valor = g.Sum(m => (m.ValorUnitario ?? 0m) * m.Quantidade)
            })
            .ToListAsync();

        return entradas
            .Where(e => e.Quantidade > 0)
            .ToDictionary(e => e.ProdutoId, e => e.Valor / e.Quantidade);
    }

    private async Task<IReadOnlyCollection<RankingProdutoDto>> ObterRankingsDeEstoqueAsync(
        DateTime dataReferencia,
        string tipoRanking,
        string criterioOrdenacao)
    {
        var produtos = await _db.Produtos
            .AsNoTracking()
            .Where(p => p.CreatedAt <= dataReferencia)
            .Select(p => new ProdutoResumo(p.Id, p.Nome))
            .ToListAsync();

        if (!produtos.Any())
        {
            return Array.Empty<RankingProdutoDto>();
        }

        var produtoIds = produtos.Select(p => p.Id).ToList();
        var saldos = await ObterSaldosEstoqueAsync(produtoIds, dataReferencia);

        return produtos
            .Select(p => CriarRanking(
                tipoRanking,
                p.Id,
                p.Nome,
                saldos.TryGetValue(p.Id, out var saldo) ? saldo : 0,
                null,
                criterioOrdenacao))
            .ToList();
    }

    private async Task<IReadOnlyDictionary<Guid, int>> ObterSaldosEstoqueAsync(
        IReadOnlyCollection<Guid> produtoIds,
        DateTime dataReferencia)
    {
        var entradas = await _db.EstoqueMovimentacoes
            .AsNoTracking()
            .Where(m => produtoIds.Contains(m.ProdutoId)
                && m.Data <= dataReferencia
                && (m.Tipo == TipoMovimentacao.Entrada || m.Tipo == TipoMovimentacao.InventarioInicial))
            .GroupBy(m => m.ProdutoId)
            .Select(g => new { ProdutoId = g.Key, Quantidade = g.Sum(m => m.Quantidade) })
            .ToListAsync();

        var saidas = await _db.EstoqueMovimentacoes
            .AsNoTracking()
            .Where(m => produtoIds.Contains(m.ProdutoId)
                && m.Data <= dataReferencia
                && m.Tipo == TipoMovimentacao.Saida)
            .GroupBy(m => m.ProdutoId)
            .Select(g => new { ProdutoId = g.Key, Quantidade = g.Sum(m => m.Quantidade) })
            .ToListAsync();

        var saldos = entradas.ToDictionary(e => e.ProdutoId, e => e.Quantidade);

        foreach (var saida in saidas)
        {
            saldos[saida.ProdutoId] = saldos.TryGetValue(saida.ProdutoId, out var entrada)
                ? entrada - saida.Quantidade
                : -saida.Quantidade;
        }

        return saldos;
    }

    private static RankingProdutoDto CriarRanking(
        string tipoRanking,
        Guid produtoId,
        string produtoNome,
        int quantidade,
        decimal? valorFinanceiro,
        string criterioOrdenacao)
    {
        return new RankingProdutoDto
        {
            TipoRanking = tipoRanking,
            ProdutoId = produtoId,
            ProdutoNome = produtoNome,
            Quantidade = quantidade,
            ValorFinanceiro = valorFinanceiro,
            CriterioOrdenacao = criterioOrdenacao
        };
    }

    private static RankingProdutoDto ComPosicao(RankingProdutoDto ranking, int posicao)
    {
        ranking.Posicao = posicao;
        return ranking;
    }

    private static RankingClienteDto CriarRankingCliente(
        string tipoRanking,
        Guid clienteId,
        string clienteNome,
        int quantidade,
        decimal? valorFinanceiro,
        string criterioOrdenacao)
    {
        return new RankingClienteDto
        {
            TipoRanking = tipoRanking,
            ClienteId = clienteId,
            ClienteNome = clienteNome,
            Quantidade = quantidade,
            ValorFinanceiro = valorFinanceiro,
            CriterioOrdenacao = criterioOrdenacao
        };
    }

    private static RankingClienteDto ComPosicao(RankingClienteDto ranking, int posicao)
    {
        ranking.Posicao = posicao;
        return ranking;
    }

    private static string ObterNomeProduto(IReadOnlyDictionary<Guid, ProdutoResumo> produtos, Guid produtoId)
    {
        return produtos.TryGetValue(produtoId, out var produto)
            ? produto.Nome
            : produtoId.ToString();
    }

    private static string ObterNomeCliente(IReadOnlyDictionary<Guid, ClienteResumo> clientes, Guid clienteId)
    {
        return clientes.TryGetValue(clienteId, out var cliente)
            ? cliente.Nome
            : clienteId.ToString();
    }

    private sealed record RankingAgregado(Guid ProdutoId, int Quantidade, decimal ValorFinanceiro);
    private sealed record ProdutoResumo(Guid Id, string Nome);
    private sealed record RankingClienteAgregado(Guid ClienteId, int Quantidade, decimal ValorFinanceiro);
    private sealed record ClienteResumo(Guid Id, string Nome);
}
