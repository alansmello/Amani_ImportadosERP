using System.Linq;
using Amani.ImportadosERP.Application.DTOs.Response;
using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Domain.Services;

namespace Amani.ImportadosERP.Application.Mappers;

public static class CompraMapper
{
    public static IReadOnlyCollection<CompraHistoricoEventoDto> ToHistoricoOrdenado(
        IEnumerable<CompraHistoricoEventoDto> eventos)
    {
        ArgumentNullException.ThrowIfNull(eventos);
        return eventos
            .OrderByDescending(e => e.DataEfetiva)
            .ThenByDescending(e => e.DataRegistro)
            .ToList()
            .AsReadOnly();
    }

    public static CompraResponseDto ToResponse(
        Compra compra,
        CompraResumoReembolso? resumoReembolso = null,
        IReadOnlyDictionary<Guid, CompraItemResumoDevolucao>? resumosDevolucao = null)
    {
        if (compra == null) return null!;
        resumoReembolso ??= CompraCalculoFinanceiro.CalcularResumoReembolso(compra.Total(), 0m, 0m);
        resumosDevolucao ??= new Dictionary<Guid, CompraItemResumoDevolucao>();

        var quantidadeDevolvidaAntes = resumosDevolucao.Values.Sum(r => r.QuantidadeDevolvidaAntes);
        var quantidadeDevolvidaDepois = resumosDevolucao.Values.Sum(r => r.QuantidadeDevolvidaDepois);
        var quantidadeDevolvidaDepoisCompensada = resumosDevolucao.Values.Sum(r => r.QuantidadeDevolvidaDepoisCompensada);
        var quantidadeReferenciaDevolucao = compra.Items.Sum(i => i.QuantidadeRecebida);
        var situacaoLogistica = CalcularSituacaoLogisticaDevolucao(
            quantidadeDevolvidaDepois,
            quantidadeDevolvidaDepoisCompensada,
            quantidadeReferenciaDevolucao);

        return new CompraResponseDto
        {
            Id = compra.Id,
            FornecedorId = compra.FornecedorId,
            DataCompra = compra.DataCompra,
            Status = Compra.CalcularStatusOperacional(
                compra.Items,
                item => item.CalcularQuantidadePendente(ObterResumo(resumosDevolucao, item.Id).QuantidadeDevolvidaAntes)).ToString(),
            Desconto = compra.Desconto,
            Acrescimo = compra.Acrescimo,
            Total = compra.Total(),
            TotalReembolsadoLiquido = resumoReembolso.TotalReembolsado,
            SaldoReembolsavel = resumoReembolso.SaldoReembolsavel,
            CustoFinanceiroLiquido = resumoReembolso.CustoFinanceiroLiquido,
            SituacaoReembolso = resumoReembolso.Situacao.ToString(),
            PossuiDevolucao = resumosDevolucao.Values.Any(r => r.QuantidadeTotalRegistrada > 0),
            QuantidadeDevolvidaAntes = quantidadeDevolvidaAntes,
            QuantidadeDevolvidaDepois = quantidadeDevolvidaDepois,
            QuantidadeDevolvidaDepoisCompensada = quantidadeDevolvidaDepoisCompensada,
            SituacaoLogisticaDevolucao = situacaoLogistica.Codigo,
            DescricaoSituacaoLogisticaDevolucao = situacaoLogistica.Descricao,
            Items = compra.Items.Select(i =>
            {
                var resumoDevolucao = ObterResumo(resumosDevolucao, i.Id);
                var itemSituacaoLogistica = CalcularSituacaoLogisticaDevolucao(
                    resumoDevolucao.QuantidadeDevolvidaDepois,
                    resumoDevolucao.QuantidadeDevolvidaDepoisCompensada,
                    i.QuantidadeRecebida);

                return new CompraItemResponseDto
                {
                    Id = i.Id,
                    ProdutoId = i.ProdutoId,
                    Quantidade = i.Quantidade,
                    QuantidadeComprada = i.Quantidade,
                    QuantidadeRecebida = i.QuantidadeRecebida,
                    QuantidadePerdida = i.QuantidadePerdida,
                    QuantidadeDevolvidaAntes = resumoDevolucao.QuantidadeDevolvidaAntes,
                    QuantidadeDevolvidaDepois = resumoDevolucao.QuantidadeDevolvidaDepois,
                    QuantidadeDevolvidaDepoisCompensada = resumoDevolucao.QuantidadeDevolvidaDepoisCompensada,
                    SituacaoLogisticaDevolucao = itemSituacaoLogistica.Codigo,
                    DescricaoSituacaoLogisticaDevolucao = itemSituacaoLogistica.Descricao,
                    QuantidadeElegivelDevolucaoAntes = i.CalcularQuantidadePendente(resumoDevolucao.QuantidadeDevolvidaAntes),
                    QuantidadePendente = i.CalcularQuantidadePendente(resumoDevolucao.QuantidadeDevolvidaAntes),
                    RecebimentosElegiveisDevolucao = i.Recebimentos
                        .Select(r =>
                        {
                            var quantidadeDevolvidaDepoisRecebimento = resumoDevolucao
                                .QuantidadeDevolvidaDepoisPorRecebimento
                                .TryGetValue(r.Id, out var quantidade)
                                    ? quantidade
                                    : 0;
                            return new CompraItemRecebimentoElegivelDevolucaoDto
                            {
                                RecebimentoId = r.Id,
                                DataRecebimento = r.DataRecebimento,
                                QuantidadeRecebida = r.Quantidade,
                                QuantidadeDevolvidaDepois = quantidadeDevolvidaDepoisRecebimento,
                                QuantidadeElegivel = Math.Max(0, r.Quantidade - quantidadeDevolvidaDepoisRecebimento),
                                ValorUnitario = r.ValorUnitario
                            };
                        })
                        .Where(r => r.QuantidadeElegivel > 0)
                        .ToList()
                        .AsReadOnly(),
                    CustoUnitario = i.CustoUnitario,
                    Desconto = i.Desconto,
                    Acrescimo = i.Acrescimo,
                    ValorTotal = i.ValorTotal()
                };
            }).ToList().AsReadOnly()
        };
    }

    public static SituacaoLogisticaDevolucaoDto CalcularSituacaoLogisticaDevolucao(
        int quantidadeDevolvidaDepois,
        int quantidadeDevolvidaDepoisCompensada,
        int quantidadeReferenciaDevolucao)
    {
        if (quantidadeDevolvidaDepois > 0 && quantidadeDevolvidaDepoisCompensada > 0)
        {
            return new SituacaoLogisticaDevolucaoDto("ParcialmenteCompensada", "Parcialmente compensada");
        }

        if (quantidadeDevolvidaDepois > 0)
        {
            return quantidadeReferenciaDevolucao > 0 && quantidadeDevolvidaDepois >= quantidadeReferenciaDevolucao
                ? new SituacaoLogisticaDevolucaoDto("Devolvida", "Recebida e devolvida")
                : new SituacaoLogisticaDevolucaoDto("ParcialmenteDevolvida", "Parcialmente devolvida");
        }

        if (quantidadeDevolvidaDepoisCompensada > 0)
        {
            return new SituacaoLogisticaDevolucaoDto("DevolucaoCompensada", "Devolucao compensada");
        }

        return new SituacaoLogisticaDevolucaoDto("SemDevolucao", "Sem devolucao");
    }

    private static CompraItemResumoDevolucao ObterResumo(
        IReadOnlyDictionary<Guid, CompraItemResumoDevolucao> resumos,
        Guid itemId)
    {
        return resumos.TryGetValue(itemId, out var resumo)
            ? resumo
            : CompraItemResumoDevolucao.Vazio;
    }
}

public sealed record SituacaoLogisticaDevolucaoDto(string Codigo, string Descricao);

public sealed class CompraItemResumoDevolucao
{
    public CompraItemResumoDevolucao(
        int quantidadeDevolvidaAntes,
        int quantidadeDevolvidaDepois,
        IReadOnlyDictionary<Guid, int>? quantidadeDevolvidaDepoisPorRecebimento = null,
        int quantidadeDevolvidaAntesCompensada = 0,
        int quantidadeDevolvidaDepoisCompensada = 0,
        IReadOnlyDictionary<Guid, int>? quantidadeDevolvidaDepoisCompensadaPorRecebimento = null)
    {
        QuantidadeDevolvidaAntes = quantidadeDevolvidaAntes;
        QuantidadeDevolvidaDepois = quantidadeDevolvidaDepois;
        QuantidadeDevolvidaAntesCompensada = quantidadeDevolvidaAntesCompensada;
        QuantidadeDevolvidaDepoisCompensada = quantidadeDevolvidaDepoisCompensada;
        QuantidadeDevolvidaDepoisPorRecebimento =
            quantidadeDevolvidaDepoisPorRecebimento ?? new Dictionary<Guid, int>();
        QuantidadeDevolvidaDepoisCompensadaPorRecebimento =
            quantidadeDevolvidaDepoisCompensadaPorRecebimento ?? new Dictionary<Guid, int>();
    }

    public int QuantidadeDevolvidaAntes { get; }
    public int QuantidadeDevolvidaDepois { get; }
    public int QuantidadeDevolvidaAntesCompensada { get; }
    public int QuantidadeDevolvidaDepoisCompensada { get; }
    public int QuantidadeTotalRegistrada =>
        QuantidadeDevolvidaAntes +
        QuantidadeDevolvidaDepois +
        QuantidadeDevolvidaAntesCompensada +
        QuantidadeDevolvidaDepoisCompensada;
    public IReadOnlyDictionary<Guid, int> QuantidadeDevolvidaDepoisPorRecebimento { get; }
    public IReadOnlyDictionary<Guid, int> QuantidadeDevolvidaDepoisCompensadaPorRecebimento { get; }

    public static CompraItemResumoDevolucao Vazio { get; } = new(0, 0);
}