using Amani.ImportadosERP.Application.DTOs.Dashboards;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Infra.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace Amani.ImportadosERP.Infra.Data.Repositories;

public sealed class DashboardAlertaRepository : IDashboardAlertaRepository
{
    private readonly AmaniDbContext _db;

    public DashboardAlertaRepository(AmaniDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyCollection<AlertaGerencialDto>> ObterAlertasEstoqueBaixoAsync(
        DateTime dataReferencia,
        int limiteMinimo)
    {
        var produtos = await _db.Produtos
            .AsNoTracking()
            .Where(p => p.CreatedAt <= dataReferencia)
            .Select(p => new ProdutoResumo(p.Id, p.Nome, default))
            .ToListAsync();

        if (!produtos.Any())
        {
            return Array.Empty<AlertaGerencialDto>();
        }

        var saldos = await ObterSaldosEstoqueAsync(produtos.Select(p => p.Id).ToList(), dataReferencia);

        return produtos
            .Select(p => new
            {
                Produto = p,
                Saldo = saldos.TryGetValue(p.Id, out var saldo) ? saldo : 0
            })
            .Where(p => p.Saldo <= limiteMinimo)
            .OrderBy(p => p.Saldo)
            .ThenBy(p => p.Produto.Nome)
            .ThenBy(p => p.Produto.Id)
            .Select(p => CriarAlerta(
                "EstoqueBaixo",
                p.Saldo <= 0 ? "Critica" : "Alta",
                "Produto",
                p.Produto.Id,
                p.Produto.Nome,
                "Estoque disponivel abaixo do limite operacional.",
                p.Saldo,
                limiteMinimo,
                dataReferencia))
            .ToList();
    }

    public async Task<IReadOnlyCollection<AlertaGerencialDto>> ObterAlertasProdutosSemMovimentacaoAsync(
        DateTime dataReferencia,
        int diasSemMovimentacao)
    {
        var dataLimite = dataReferencia.AddDays(-diasSemMovimentacao);
        var produtos = await _db.Produtos
            .AsNoTracking()
            .Where(p => p.CreatedAt <= dataLimite)
            .Select(p => new ProdutoResumo(p.Id, p.Nome, p.CreatedAt))
            .ToListAsync();

        if (!produtos.Any())
        {
            return Array.Empty<AlertaGerencialDto>();
        }

        var produtoIds = produtos.Select(p => p.Id).ToList();
        var eventos = await ObterEventosOperacionaisAsync(produtoIds, dataReferencia);
        var ultimaMovimentacaoPorProduto = eventos
            .GroupBy(e => e.ProdutoId)
            .ToDictionary(e => e.Key, e => e.Max(v => v.Data));

        return produtos
            .Select(p =>
            {
                var ultimaData = ultimaMovimentacaoPorProduto.TryGetValue(p.Id, out var data)
                    ? data
                    : p.DataCadastro;

                return new
                {
                    Produto = p,
                    UltimaData = ultimaData,
                    DiasSemEvento = Math.Max(0, (dataReferencia.Date - ultimaData.Date).Days)
                };
            })
            .Where(p => p.DiasSemEvento >= diasSemMovimentacao)
            .OrderByDescending(p => p.DiasSemEvento)
            .ThenBy(p => p.Produto.Nome)
            .ThenBy(p => p.Produto.Id)
            .Select(p => CriarAlerta(
                "ProdutoSemMovimentacao",
                "Media",
                "Produto",
                p.Produto.Id,
                p.Produto.Nome,
                $"Produto sem movimentacao operacional desde {p.UltimaData:yyyy-MM-dd}.",
                p.DiasSemEvento,
                diasSemMovimentacao,
                dataReferencia))
            .ToList();
    }

    public async Task<IReadOnlyCollection<AlertaGerencialDto>> ObterAlertasComprasEmTransitoAntigoAsync(
        DateTime dataReferencia,
        int limiteDias)
    {
        var compras = await _db.Compras
            .AsNoTracking()
            .AsSplitQuery()
            .Include(c => c.Items)
                .ThenInclude(i => i.Recebimentos)
            .Include(c => c.Items)
                .ThenInclude(i => i.Perdas)
            .Where(c => c.Status != CompraStatus.Cancelada
                && c.DataCompra <= dataReferencia)
            .ToListAsync();

        return compras
            .Select(c => new
            {
                Compra = c,
                DiasEmTransito = Math.Max(0, (dataReferencia.Date - c.DataCompra.Date).Days),
                QuantidadePendente = c.Items.Sum(i => CalcularQuantidadePendente(i, dataReferencia))
            })
            .Where(c => c.QuantidadePendente > 0 && c.DiasEmTransito > limiteDias)
            .OrderByDescending(c => c.DiasEmTransito)
            .ThenBy(c => c.Compra.DataCompra)
            .ThenBy(c => c.Compra.Id)
            .Select(c => CriarAlerta(
                "CompraEmTransitoAntigo",
                c.DiasEmTransito >= limiteDias * 2 ? "Alta" : "Media",
                "Compra",
                c.Compra.Id,
                $"Compra {c.Compra.Id}",
                $"Compra em transito com {c.QuantidadePendente} unidade(s) pendente(s).",
                c.DiasEmTransito,
                limiteDias,
                dataReferencia))
            .ToList();
    }

    public async Task<IReadOnlyCollection<AlertaGerencialDto>> ObterAlertasPerdasRecorrentesAsync(
        DateTime dataInicial,
        DateTime dataFinal,
        int limiteOcorrencias)
    {
        var perdas = await _db.CompraItemPerdas
            .AsNoTracking()
            .Include(p => p.Compra)
            .Where(p => p.Compra.Status != CompraStatus.Cancelada
                && p.DataPerda >= dataInicial
                && p.DataPerda <= dataFinal)
            .GroupBy(p => p.ProdutoId)
            .Select(g => new
            {
                ProdutoId = g.Key,
                Ocorrencias = g.Count(),
                QuantidadePerdida = g.Sum(p => p.Quantidade)
            })
            .Where(p => p.Ocorrencias >= limiteOcorrencias)
            .ToListAsync();

        if (!perdas.Any())
        {
            return Array.Empty<AlertaGerencialDto>();
        }

        var produtos = await ObterProdutosAsync(perdas.Select(p => p.ProdutoId).ToList());

        return perdas
            .OrderByDescending(p => p.Ocorrencias)
            .ThenByDescending(p => p.QuantidadePerdida)
            .ThenBy(p => ObterNomeProduto(produtos, p.ProdutoId))
            .ThenBy(p => p.ProdutoId)
            .Select(p => CriarAlerta(
                "PerdaRecorrente",
                p.Ocorrencias > limiteOcorrencias ? "Alta" : "Media",
                "Produto",
                p.ProdutoId,
                ObterNomeProduto(produtos, p.ProdutoId),
                $"Produto com {p.Ocorrencias} ocorrencia(s) de perda no periodo, totalizando {p.QuantidadePerdida} unidade(s).",
                p.Ocorrencias,
                limiteOcorrencias,
                dataFinal))
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

    private async Task<IReadOnlyCollection<EventoProduto>> ObterEventosOperacionaisAsync(
        IReadOnlyCollection<Guid> produtoIds,
        DateTime dataReferencia)
    {
        var movimentacoes = await _db.EstoqueMovimentacoes
            .AsNoTracking()
            .Where(m => produtoIds.Contains(m.ProdutoId)
                && m.Data <= dataReferencia)
            .Select(m => new EventoProduto(m.ProdutoId, m.Data))
            .ToListAsync();

        var vendas = await _db.VendaItems
            .AsNoTracking()
            .Where(i => produtoIds.Contains(i.ProdutoId)
                && i.Venda != null
                && !i.Venda.Cancelada
                && i.Venda.DataVenda <= dataReferencia)
            .Select(i => new EventoProduto(i.ProdutoId, i.Venda!.DataVenda))
            .ToListAsync();

        var compras = await _db.CompraItems
            .AsNoTracking()
            .Where(i => produtoIds.Contains(i.ProdutoId)
                && i.Compra.Status != CompraStatus.Cancelada
                && i.Compra.DataCompra <= dataReferencia)
            .Select(i => new EventoProduto(i.ProdutoId, i.Compra.DataCompra))
            .ToListAsync();

        var recebimentos = await _db.CompraItemRecebimentos
            .AsNoTracking()
            .Where(r => produtoIds.Contains(r.ProdutoId)
                && r.Compra.Status != CompraStatus.Cancelada
                && r.DataRecebimento <= dataReferencia)
            .Select(r => new EventoProduto(r.ProdutoId, r.DataRecebimento))
            .ToListAsync();

        var perdas = await _db.CompraItemPerdas
            .AsNoTracking()
            .Include(p => p.Compra)
            .Where(p => produtoIds.Contains(p.ProdutoId)
                && p.Compra.Status != CompraStatus.Cancelada
                && p.DataPerda <= dataReferencia)
            .Select(p => new EventoProduto(p.ProdutoId, p.DataPerda))
            .ToListAsync();

        return movimentacoes
            .Concat(vendas)
            .Concat(compras)
            .Concat(recebimentos)
            .Concat(perdas)
            .ToList();
    }

    private async Task<IReadOnlyDictionary<Guid, ProdutoResumo>> ObterProdutosAsync(IReadOnlyCollection<Guid> produtoIds)
    {
        return await _db.Produtos
            .AsNoTracking()
            .Where(p => produtoIds.Contains(p.Id))
            .Select(p => new ProdutoResumo(p.Id, p.Nome, default))
            .ToDictionaryAsync(p => p.Id);
    }

    private static int CalcularQuantidadePendente(CompraItem item, DateTime dataReferencia)
    {
        return item.Quantidade
            - item.Recebimentos
                .Where(r => r.DataRecebimento <= dataReferencia)
                .Sum(r => r.Quantidade)
            - item.Perdas
                .Where(p => p.DataPerda <= dataReferencia)
                .Sum(p => p.Quantidade);
    }

    private static string ObterNomeProduto(IReadOnlyDictionary<Guid, ProdutoResumo> produtos, Guid produtoId)
    {
        return produtos.TryGetValue(produtoId, out var produto)
            ? produto.Nome
            : produtoId.ToString();
    }

    private static AlertaGerencialDto CriarAlerta(
        string tipoAlerta,
        string severidade,
        string entidadeTipo,
        Guid entidadeId,
        string entidadeNome,
        string motivo,
        decimal valorAtual,
        decimal limiteAplicado,
        DateTime dataReferencia)
    {
        return new AlertaGerencialDto
        {
            TipoAlerta = tipoAlerta,
            Severidade = severidade,
            EntidadeTipo = entidadeTipo,
            EntidadeId = entidadeId,
            EntidadeNome = entidadeNome,
            Motivo = motivo,
            ValorAtual = valorAtual,
            LimiteAplicado = limiteAplicado,
            DataReferencia = dataReferencia
        };
    }

    private sealed record ProdutoResumo(Guid Id, string Nome, DateTime DataCadastro = default);
    private sealed record EventoProduto(Guid ProdutoId, DateTime Data);
}
