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
        var quantidadePendenteVigente = compra.Items.Sum(i =>
            i.CalcularQuantidadePendente(ObterResumo(resumosDevolucao, i.Id).QuantidadeDevolvidaAntes));
        var situacaoLogistica = CalcularSituacaoLogisticaDevolucao(
            quantidadeDevolvidaDepois,
            quantidadeDevolvidaDepoisCompensada,
            quantidadeReferenciaDevolucao,
            quantidadeDevolvidaAntes,
            compra.Items.Sum(i => i.Quantidade),
            quantidadeReferenciaDevolucao,
            compra.Items.Sum(i => i.QuantidadePerdida),
            quantidadePendenteVigente);

        return new CompraResponseDto
        {
            Id = compra.Id,
            FornecedorId = compra.FornecedorId,
            DataCompra = compra.DataCompra,
            Status = compra.Status.ToString(),
            PossuiPendenciaVigente = CompraPendenciaLogistica.PossuiPendenciaVigente(quantidadePendenteVigente),
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
                var quantidadePendente = i.CalcularQuantidadePendente(resumoDevolucao.QuantidadeDevolvidaAntes);
                var itemSituacaoLogistica = CalcularSituacaoLogisticaDevolucao(
                    resumoDevolucao.QuantidadeDevolvidaDepois,
                    resumoDevolucao.QuantidadeDevolvidaDepoisCompensada,
                    i.QuantidadeRecebida,
                    resumoDevolucao.QuantidadeDevolvidaAntes,
                    i.Quantidade,
                    i.QuantidadeRecebida,
                    i.QuantidadePerdida,
                    quantidadePendente);

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
                    QuantidadeElegivelDevolucaoAntes = Math.Max(0, quantidadePendente),
                    QuantidadePendente = Math.Max(0, quantidadePendente),
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
        int quantidadeReferenciaDevolucao,
        int quantidadeDevolvidaAntes = 0,
        int quantidadeComprada = 0,
        int quantidadeRecebida = 0,
        int quantidadePerdida = 0,
        int quantidadePendente = 0)
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

        if (quantidadeDevolvidaAntes > 0
            && quantidadeRecebida == 0
            && quantidadePerdida == 0
            && quantidadeComprada > 0
            && quantidadeDevolvidaAntes >= quantidadeComprada
            && !CompraPendenciaLogistica.PossuiPendenciaVigente(quantidadePendente))
        {
            return new SituacaoLogisticaDevolucaoDto(
                "DevolvidaAntesDoRecebimento",
                "Devolvida antes do recebimento");
        }

        if (quantidadeDevolvidaAntes > 0)
        {
            return new SituacaoLogisticaDevolucaoDto("ParcialmenteDevolvida", "Parcialmente devolvida");
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