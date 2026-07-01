using Amani.ImportadosERP.Application.DTOs.Dashboards;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Infra.Data.Context;
using Microsoft.EntityFrameworkCore;
using Amani.ImportadosERP.Domain.Common;

namespace Amani.ImportadosERP.Infra.Data.Repositories;

public sealed class DashboardGraficoRepository : IDashboardGraficoRepository
{
    private readonly AmaniDbContext _db;
    private readonly DashboardCustoMedioReadService _custoMedioReadService;
    private readonly IEstoqueConsultaRepository _estoqueConsultaRepository;

    public DashboardGraficoRepository(
        AmaniDbContext db,
        DashboardCustoMedioReadService custoMedioReadService,
        IEstoqueConsultaRepository estoqueConsultaRepository)
    {
        _db = db;
        _custoMedioReadService = custoMedioReadService;
        _estoqueConsultaRepository = estoqueConsultaRepository;
    }

    public async Task<SerieGraficaDto> ObterReceitaPorPeriodoAsync(DateTime dataInicial, DateTime dataFinal)
    {
        var buckets = CriarBuckets(dataInicial, dataFinal);
        var vendas = await VendasConfirmadasNoPeriodo(dataInicial, dataFinal)
            .Include(v => v.Items)
            .ToListAsync();

        var pontos = buckets
            .Select(bucket =>
            {
                var vendasDoPeriodo = vendas
                    .Where(v => v.DataVenda >= bucket.Inicio && v.DataVenda <= bucket.Fim)
                    .ToList();

                return CriarPonto(
                    bucket,
                    vendasDoPeriodo.Sum(v => v.Total()),
                    vendasDoPeriodo.Count);
            })
            .Where(p => p.Valor != 0m || p.Quantidade > 0)
            .ToList();

        return CriarSerie("ReceitaPorPeriodo", "Receita", buckets.Granularidade, "BRL", pontos);
    }

    public async Task<(SerieGraficaDto Serie, IReadOnlyCollection<AvisoDadoIncompletoDto> Avisos)> ObterLucroPorPeriodoAsync(
        DateTime dataInicial,
        DateTime dataFinal)
    {
        var buckets = CriarBuckets(dataInicial, dataFinal);
        var vendas = await VendasConfirmadasNoPeriodo(dataInicial, dataFinal)
            .Include(v => v.Items)
            .ToListAsync();

        var itensVendidos = vendas
            .SelectMany(v => v.Items.Select(item => new ItemVendidoGrafico(
                v.Id,
                v.DataVenda,
                item.ProdutoId,
                item.ObterQuantidadeEstoqueExata().ParaDecimal(),
                item.ValorTotal())))
            .ToList();

        var produtoIds = itensVendidos.Select(i => i.ProdutoId).Distinct().ToList();
        var custos = await _custoMedioReadService.ObterCustosMediosAsync(produtoIds, dataFinal);

        var pontos = buckets
            .Select(bucket =>
            {
                var itensDoPeriodo = itensVendidos
                    .Where(i => i.DataVenda >= bucket.Inicio && i.DataVenda <= bucket.Fim)
                    .ToList();

                var lucro = itensDoPeriodo
                    .Where(i => custos.ContainsKey(i.ProdutoId))
                    .Sum(i => i.ValorLiquidoItem - (custos[i.ProdutoId] * i.Quantidade));

                return CriarPonto(
                    bucket,
                    lucro,
                    itensDoPeriodo.Count(i => custos.ContainsKey(i.ProdutoId)));
            })
            .Where(p => p.Valor != 0m || p.Quantidade > 0)
            .ToList();

        return (
            CriarSerie("LucroPorPeriodo", "Lucro", buckets.Granularidade, "BRL", pontos),
            CriarAvisosDeCustoAusente(itensVendidos, custos));
    }

    public async Task<SerieGraficaDto> ObterComprasPorPeriodoAsync(DateTime dataInicial, DateTime dataFinal)
    {
        var buckets = CriarBuckets(dataInicial, dataFinal);
        var compras = await _db.Compras
            .AsNoTracking()
            .Include(c => c.Items)
            .Where(c => c.Status != CompraStatus.Cancelada
                && c.DataCompra >= dataInicial
                && c.DataCompra <= dataFinal)
            .ToListAsync();

        var pontos = buckets
            .Select(bucket =>
            {
                var comprasDoPeriodo = compras
                    .Where(c => c.DataCompra >= bucket.Inicio && c.DataCompra <= bucket.Fim)
                    .ToList();

                return CriarPonto(
                    bucket,
                    comprasDoPeriodo.Sum(c => c.Total()),
                    comprasDoPeriodo.Count);
            })
            .Where(p => p.Valor != 0m || p.Quantidade > 0)
            .ToList();

        return CriarSerie("ComprasPorPeriodo", "Compras", buckets.Granularidade, "BRL", pontos);
    }

    public async Task<SerieGraficaDto> ObterDespesasPorCategoriaAsync(DateTime dataInicial, DateTime dataFinal)
    {
        var despesas = await (
                from despesa in _db.Despesas.AsNoTracking()
                join categoria in _db.CategoriaDespesas.AsNoTracking()
                    on despesa.CategoriaDespesaId equals categoria.Id into categorias
                from categoria in categorias.DefaultIfEmpty()
                where despesa.DataCompetencia >= dataInicial && despesa.DataCompetencia <= dataFinal
                select new
                {
                    Categoria = categoria != null ? categoria.Nome : "Sem categoria",
                    despesa.Valor
                })
            .ToListAsync();

        var pontos = despesas
            .GroupBy(d => d.Categoria)
            .Select(g => new PontoGraficoDto
            {
                Periodo = dataInicial.Date,
                Rotulo = g.Key,
                Valor = g.Sum(d => d.Valor),
                Quantidade = g.Count(),
                Categoria = g.Key
            })
            .OrderByDescending(p => p.Valor)
            .ThenBy(p => p.Categoria)
            .ToList();

        return CriarSerie("DespesasPorCategoria", "Despesas por categoria", "Categoria", "BRL", pontos);
    }

    public async Task<SerieGraficaDto> ObterEvolucaoEstoqueAsync(DateTime dataInicial, DateTime dataFinal)
    {
        var buckets = CriarBuckets(dataInicial, dataFinal);
        var produtoIds = await _db.EstoqueMovimentacoes
            .AsNoTracking()
            .Where(m => m.Data <= dataFinal)
            .Select(m => m.ProdutoId)
            .Distinct()
            .ToListAsync();

        if (produtoIds.Count == 0)
        {
            return CriarSerie("EvolucaoEstoque", "Evolucao do estoque", buckets.Granularidade, "UN", Array.Empty<PontoGraficoDto>());
        }

        var pontos = new List<PontoGraficoDto>();
        foreach (var bucket in buckets)
        {
            var saldos = await _estoqueConsultaRepository.ObterSaldosExatosAsync(produtoIds, bucket.Fim);
            var saldoExato = saldos.Values.Aggregate(
                QuantidadeRacional.Zero,
                (total, quantidade) => total + quantidade);
            var saldo = saldoExato.ParaDecimal();
            pontos.Add(CriarPonto(bucket, saldo, saldo));
        }

        return new SerieGraficaDto
        {
            TipoGrafico = "EvolucaoEstoque",
            NomeSerie = "Evolucao do estoque",
            Granularidade = buckets.Granularidade,
            Unidade = "UN",
            Pontos = pontos,
            TotalConsolidado = pontos.LastOrDefault()?.Valor ?? 0m
        };
    }

    private IQueryable<Venda> VendasConfirmadasNoPeriodo(DateTime dataInicial, DateTime dataFinal)
    {
        return _db.Vendas
            .AsNoTracking()
            .Where(v => !v.Cancelada
                && v.DataVenda >= dataInicial
                && v.DataVenda <= dataFinal);
    }

    private static IReadOnlyCollection<AvisoDadoIncompletoDto> CriarAvisosDeCustoAusente(
        IReadOnlyCollection<ItemVendidoGrafico> itensVendidos,
        IReadOnlyDictionary<Guid, decimal> custos)
    {
        var produtosSemCusto = itensVendidos
            .Where(i => !custos.ContainsKey(i.ProdutoId))
            .Select(i => i.ProdutoId)
            .Distinct()
            .ToList();

        if (!produtosSemCusto.Any())
        {
            return Array.Empty<AvisoDadoIncompletoDto>();
        }

        var valorNaoCalculavel = itensVendidos
            .Where(i => !custos.ContainsKey(i.ProdutoId))
            .Sum(i => i.ValorLiquidoItem);

        return new[]
        {
            new AvisoDadoIncompletoDto
            {
                Codigo = "CUSTO_MEDIO_AUSENTE",
                Mensagem = "Existem itens vendidos sem custo medio derivado de entradas reais em estoque.",
                EntidadeTipo = "Produto",
                Impacto = $"Grafico de lucro possui R$ {valorNaoCalculavel:N2} de receita sem custo calculavel em {produtosSemCusto.Count} produto(s)."
            }
        };
    }

    private static SerieGraficaDto CriarSerie(
        string tipoGrafico,
        string nomeSerie,
        string granularidade,
        string unidade,
        IReadOnlyCollection<PontoGraficoDto> pontos)
    {
        return new SerieGraficaDto
        {
            TipoGrafico = tipoGrafico,
            NomeSerie = nomeSerie,
            Granularidade = granularidade,
            Unidade = unidade,
            Pontos = pontos,
            TotalConsolidado = pontos.Sum(p => p.Valor)
        };
    }

    private static PontoGraficoDto CriarPonto(BucketGrafico bucket, decimal valor, decimal? quantidade)
    {
        return new PontoGraficoDto
        {
            Periodo = bucket.Inicio.Date,
            Rotulo = bucket.Rotulo,
            Valor = valor,
            Quantidade = quantidade
        };
    }

    private static BucketsGrafico CriarBuckets(DateTime dataInicial, DateTime dataFinal)
    {
        var granularidade = (dataFinal.Date - dataInicial.Date).TotalDays <= 62
            ? "Dia"
            : "Mes";

        var buckets = granularidade == "Dia"
            ? CriarBucketsDiarios(dataInicial, dataFinal)
            : CriarBucketsMensais(dataInicial, dataFinal);

        return new BucketsGrafico(granularidade, buckets);
    }

    private static IReadOnlyCollection<BucketGrafico> CriarBucketsDiarios(DateTime dataInicial, DateTime dataFinal)
    {
        var buckets = new List<BucketGrafico>();
        var data = dataInicial.Date;

        while (data <= dataFinal.Date)
        {
            var inicio = new DateTime(data.Year, data.Month, data.Day, 0, 0, 0, DateTimeKind.Utc);
            var fim = new DateTime(data.Year, data.Month, data.Day, 23, 59, 59, DateTimeKind.Utc);
            buckets.Add(new BucketGrafico(inicio, fim, data.ToString("dd/MM")));
            data = data.AddDays(1);
        }

        return buckets;
    }

    private static IReadOnlyCollection<BucketGrafico> CriarBucketsMensais(DateTime dataInicial, DateTime dataFinal)
    {
        var buckets = new List<BucketGrafico>();
        var data = new DateTime(dataInicial.Year, dataInicial.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        while (data <= dataFinal.Date)
        {
            var primeiroDia = new DateTime(data.Year, data.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var ultimoDia = primeiroDia.AddMonths(1).AddDays(-1);
            var inicio = primeiroDia < dataInicial ? dataInicial : primeiroDia;
            var fimDoMes = new DateTime(ultimoDia.Year, ultimoDia.Month, ultimoDia.Day, 23, 59, 59, DateTimeKind.Utc);
            var fim = fimDoMes > dataFinal ? dataFinal : fimDoMes;

            buckets.Add(new BucketGrafico(inicio, fim, data.ToString("MM/yyyy")));
            data = data.AddMonths(1);
        }

        return buckets;
    }

    private sealed record BucketsGrafico(string Granularidade, IReadOnlyCollection<BucketGrafico> Items)
        : IReadOnlyCollection<BucketGrafico>
    {
        public int Count => Items.Count;
        public IEnumerator<BucketGrafico> GetEnumerator() => Items.GetEnumerator();
        System.Collections.IEnumerator System.Collections.IEnumerable.GetEnumerator() => GetEnumerator();
    }

    private sealed record BucketGrafico(DateTime Inicio, DateTime Fim, string Rotulo);
    private sealed record ItemVendidoGrafico(Guid VendaId, DateTime DataVenda, Guid ProdutoId, decimal Quantidade, decimal ValorLiquidoItem);
    private sealed record MovimentoEstoqueGrafico(DateTime Data, QuantidadeRacional Quantidade);
}
