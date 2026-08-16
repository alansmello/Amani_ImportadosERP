using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Application.DTOs.Dashboards;
using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Domain.Services;
using Amani.ImportadosERP.Infra.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace Amani.ImportadosERP.Infra.Data.Repositories;

public sealed class DashboardOperacionalRepository : IDashboardOperacionalRepository
{
    private readonly AmaniDbContext _db;
    private readonly IEstoqueConsultaRepository _estoqueConsultaRepository;

    public DashboardOperacionalRepository(AmaniDbContext db, IEstoqueConsultaRepository estoqueConsultaRepository)
    {
        _db = db;
        _estoqueConsultaRepository = estoqueConsultaRepository;
    }

    public async Task<int> ObterProdutosCadastradosAsync(DateTime dataReferencia)
    {
        return await _db.Produtos
            .AsNoTracking()
            .Where(p => p.CreatedAt <= dataReferencia)
            .CountAsync();
    }

    public async Task<decimal> ObterEstoqueDisponivelTotalAsync(DateTime dataReferencia)
    {
        var produtoIds = await _db.EstoqueMovimentacoes
            .AsNoTracking()
            .Where(m => m.Data <= dataReferencia)
            .Select(m => m.ProdutoId)
            .Distinct()
            .ToListAsync();
        var saldos = await _estoqueConsultaRepository.ObterSaldosExatosAsync(produtoIds, dataReferencia);
        var total = saldos.Values.Aggregate(
            Amani.ImportadosERP.Domain.Common.QuantidadeRacional.Zero,
            (atual, quantidade) => atual + quantidade);
        return total.ParaDecimal();
    }

    public async Task<ResumoMercadoriasEmTransitoDto> ObterMercadoriasEmTransitoAsync(DateTime dataReferencia)
    {
        var compraIdsComPendencia = await _db.CompraItems
            .AsNoTracking()
            .Where(i => i.Compra.Status != CompraStatus.Cancelada
                && i.Compra.DataCompra <= dataReferencia
                && i.Quantidade
                    - i.Recebimentos.Where(r => r.DataRecebimento <= dataReferencia).Sum(r => r.Quantidade)
                    - i.Perdas.Where(p => p.DataPerda <= dataReferencia).Sum(p => p.Quantidade) > 0)
            .Select(i => i.CompraId)
            .Distinct()
            .ToListAsync();

        if (compraIdsComPendencia.Count == 0)
        {
            return new ResumoMercadoriasEmTransitoDto
            {
                ValorAoCusto = 0m,
                ValorAoPrecoVenda = 0m
            };
        }

        var itens = await (
                from item in _db.CompraItems.AsNoTracking()
                join produto in _db.Produtos.AsNoTracking()
                    on item.ProdutoId equals produto.Id into produtos
                from produto in produtos.DefaultIfEmpty()
                where compraIdsComPendencia.Contains(item.CompraId)
                select new
                {
                    item.Id,
                    item.CompraId,
                    item.Quantidade,
                    item.CustoUnitario,
                    item.Desconto,
                    item.Acrescimo,
                    DescontoGeral = item.Compra.Desconto,
                    AcrescimoGeral = item.Compra.Acrescimo,
                    QuantidadePendente = item.Quantidade
                        - item.Recebimentos.Where(r => r.DataRecebimento <= dataReferencia).Sum(r => r.Quantidade)
                        - item.Perdas.Where(p => p.DataPerda <= dataReferencia).Sum(p => p.Quantidade),
                    PrecoVenda = produto == null ? (decimal?)null : produto.PrecoVenda
                })
            .ToListAsync();

        var quantidadePendente = itens.Where(i => i.QuantidadePendente > 0).Sum(i => i.QuantidadePendente);
        decimal subtotalCalculavelAoCusto = 0m;
        decimal valorAoPrecoVenda = 0m;
        var custoCompleto = true;
        var vendaCompleta = true;
        string? motivoCusto = null;
        string? motivoVenda = null;

        foreach (var compra in itens.GroupBy(i => i.CompraId))
        {
            var primeiroItem = compra.First();
            var calculo = CompraCalculoFinanceiro.Calcular(
                compra.Select(i => new CompraItemCalculoFinanceiro(
                    i.Id,
                    i.Quantidade,
                    i.QuantidadePendente,
                    i.CustoUnitario,
                    i.Desconto,
                    i.Acrescimo)),
                primeiroItem.DescontoGeral,
                primeiroItem.AcrescimoGeral);

            if (calculo.ValorPendenteCusto.HasValue)
            {
                subtotalCalculavelAoCusto += calculo.ValorPendenteCusto.Value;
            }
            else
            {
                custoCompleto = false;
                motivoCusto ??= calculo.MotivoValorPendenteIndisponivel;
            }

            foreach (var item in compra.Where(i => i.QuantidadePendente > 0))
            {
                if (item.PrecoVenda.HasValue)
                {
                    valorAoPrecoVenda += item.QuantidadePendente * item.PrecoVenda.Value;
                }
                else
                {
                    vendaCompleta = false;
                    motivoVenda ??= "O valor em transito ao preco de venda nao pode ser calculado porque um produto pendente nao possui referencia valida.";
                }
            }
        }

        return new ResumoMercadoriasEmTransitoDto
        {
            QuantidadePendente = quantidadePendente,
            ValorAoCusto = custoCompleto ? subtotalCalculavelAoCusto : null,
            SubtotalCalculavelAoCusto = subtotalCalculavelAoCusto,
            ValorAoCustoCompleto = custoCompleto,
            MotivoValorAoCustoIndisponivel = motivoCusto,
            ValorAoPrecoVenda = vendaCompleta ? valorAoPrecoVenda : null,
            MotivoValorAoPrecoVendaIndisponivel = motivoVenda
        };
    }

    public async Task<int> ObterComprasEmAbertoAsync(DateTime dataReferencia)
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

        return compras.Count(c => c.Items.Any(i => CalcularQuantidadePendente(i, dataReferencia) > 0));
    }

    public async Task<int> ObterProdutosPendentesRecebimentoAsync(DateTime dataReferencia)
    {
        var itens = await ObterItensDeComprasAteDataReferenciaAsync(dataReferencia);

        return itens
            .Where(i => CalcularQuantidadePendente(i, dataReferencia) > 0)
            .Select(i => i.ProdutoId)
            .Distinct()
            .Count();
    }

    public async Task<(int Quantidade, decimal Valor)> ObterPerdasRegistradasAsync(DateTime dataInicial, DateTime dataFinal)
    {
        var perdas = await _db.CompraItemPerdas
            .AsNoTracking()
            .Include(p => p.Compra)
            .Include(p => p.CompraItem)
            .Where(p => p.Compra.Status != CompraStatus.Cancelada
                && p.DataPerda >= dataInicial
                && p.DataPerda <= dataFinal)
            .ToListAsync();

        return (
            perdas.Sum(p => p.Quantidade),
            perdas.Sum(p => p.Quantidade * ObterValorUnitarioCompra(p.CompraItem)));
    }

    public async Task<ResumoRecuperacaoOperacionalDto> ObterRecuperacaoOperacionalAsync(
        DateTime dataInicial,
        DateTime dataFinal,
        DateTime dataReferencia)
    {
        var perdas = await _db.CompraItemPerdas
            .AsNoTracking()
            .Include(p => p.Compra)
            .Include(p => p.CompraItem)
            .Where(p => p.Compra.Status != CompraStatus.Cancelada
                && p.DataPerda >= dataInicial
                && p.DataPerda <= dataFinal)
            .ToListAsync();

        var devolucoes = await _db.CompraItemDevolucoes
            .AsNoTracking()
            .Include(d => d.Compra)
            .Include(d => d.CompraItem)
            .Include(d => d.Compensacao)
            .Where(d => d.Compra != null
                && d.Compra.Status != CompraStatus.Cancelada
                && d.DataDevolucao >= dataInicial
                && d.DataDevolucao <= dataFinal
                && (d.Compensacao == null || d.Compensacao.DataCompensacao > dataReferencia))
            .ToListAsync();

        var perdaIds = perdas.Select(p => p.Id).ToArray();
        var devolucaoIds = devolucoes.Select(d => d.Id).ToArray();

        var valorRecuperado = await _db.CompraReembolsoAlocacoes
            .AsNoTracking()
            .Include(a => a.CompraReembolso)
                .ThenInclude(r => r!.Cancelamento)
            .Where(a => a.CompraReembolso != null
                && a.CompraReembolso.DataReembolso <= dataReferencia
                && (a.CompraReembolso.Cancelamento == null
                    || a.CompraReembolso.Cancelamento.DataCancelamento > dataReferencia)
                && ((a.CompraItemPerdaId.HasValue && perdaIds.Contains(a.CompraItemPerdaId.Value))
                    || (a.CompraItemDevolucaoId.HasValue && devolucaoIds.Contains(a.CompraItemDevolucaoId.Value))))
            .SumAsync(a => (decimal?)a.Valor) ?? 0m;

        var perdasValor = perdas.Sum(p => p.Quantidade * ObterValorUnitarioCompra(p.CompraItem));
        var devolucoesValor = devolucoes.Sum(d => d.Quantidade * ObterValorUnitarioCompra(d.CompraItem!));
        var valorBruto = perdasValor + devolucoesValor;

        return new ResumoRecuperacaoOperacionalDto
        {
            PerdasQuantidade = perdas.Sum(p => p.Quantidade),
            PerdasValor = perdasValor,
            DevolucoesQuantidade = devolucoes.Sum(d => d.Quantidade),
            DevolucoesValor = devolucoesValor,
            ValorBrutoOcorrencias = valorBruto,
            ValorRecuperadoAssociado = valorRecuperado,
            PrejuizoLiquidoNaoRecuperado = Math.Max(0m, valorBruto - valorRecuperado)
        };
    }

    public async Task<int> ObterQuantidadeVendasAsync(DateTime dataInicial, DateTime dataFinal)
    {
        return await _db.Vendas
            .AsNoTracking()
            .Where(v => !v.Cancelada
                && v.DataVenda >= dataInicial
                && v.DataVenda <= dataFinal)
            .CountAsync();
    }

    public async Task<int> ObterQuantidadeComprasAsync(DateTime dataInicial, DateTime dataFinal)
    {
        return await _db.Compras
            .AsNoTracking()
            .Where(c => c.Status != CompraStatus.Cancelada
                && c.DataCompra >= dataInicial
                && c.DataCompra <= dataFinal)
            .CountAsync();
    }

    private async Task<IReadOnlyCollection<CompraItem>> ObterItensDeComprasAteDataReferenciaAsync(DateTime dataReferencia)
    {
        return await _db.CompraItems
            .AsNoTracking()
            .AsSplitQuery()
            .Include(i => i.Compra)
            .Include(i => i.Recebimentos)
            .Include(i => i.Perdas)
            .Where(i => i.Compra.Status != CompraStatus.Cancelada
                && i.Compra.DataCompra <= dataReferencia)
            .ToListAsync();
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

    private static decimal ObterValorUnitarioCompra(CompraItem item)
    {
        if (item.Quantidade <= 0)
        {
            return item.CustoUnitario;
        }

        return item.ValorTotal() / item.Quantidade;
    }
}
