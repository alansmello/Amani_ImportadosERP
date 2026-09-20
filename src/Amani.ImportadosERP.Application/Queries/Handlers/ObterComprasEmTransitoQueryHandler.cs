using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Application.Mappers;
using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Domain.Services;

namespace Amani.ImportadosERP.Application.Queries.Handlers;

public sealed class ObterComprasEmTransitoQueryHandler : IRequestHandler<ObterComprasEmTransitoQuery, List<CompraEmTransitoDto>>
{
    private readonly ICompraRepository _compraRepository;
    private readonly ICompraItemDevolucaoRepository _devolucaoRepository;

    public ObterComprasEmTransitoQueryHandler(
        ICompraRepository compraRepository,
        ICompraItemDevolucaoRepository devolucaoRepository)
    {
        _compraRepository = compraRepository;
        _devolucaoRepository = devolucaoRepository;
    }

    public async Task<List<CompraEmTransitoDto>> Handle(ObterComprasEmTransitoQuery request, CancellationToken cancellationToken)
    {
        var compras = await _compraRepository.ObterComprasEmTransitoAsync();
        var devolucoesPorCompra = new Dictionary<Guid, IReadOnlyDictionary<Guid, CompraItemResumoDevolucao>>();
        var hoje = DateTime.UtcNow.Date;
        foreach (var compra in compras)
        {
            var devolucoes = await _devolucaoRepository.ObterPorCompraAsync(compra.Id);
            devolucoesPorCompra[compra.Id] = AgruparResumosVigentes(devolucoes, hoje);
        }

        return compras.Select(c =>
        {
            var resumos = devolucoesPorCompra[c.Id];
            var calculo = CompraCalculoFinanceiro.Calcular(
                c.Items.Select(i => CompraItemCalculoFinanceiro.FromEntity(
                    i,
                    ObterResumo(resumos, i.Id).QuantidadeDevolvidaAntes)),
                c.Desconto,
                c.Acrescimo);

            return new CompraEmTransitoDto
            {
                CompraId = c.Id,
                FornecedorId = c.FornecedorId,
                DataCompra = c.DataCompra,
                Status = c.Status.ToString(),
                TotalCompra = calculo.TotalCompra,
                ValorPendenteCusto = calculo.ValorPendenteCusto,
                MotivoValorPendenteIndisponivel = calculo.MotivoValorPendenteIndisponivel,
                Itens = c.Items
                    .Where(i => CompraPendenciaLogistica.PossuiPendenciaVigente(
                        i.CalcularQuantidadePendente(ObterResumo(resumos, i.Id).QuantidadeDevolvidaAntes)))
                    .Select(i =>
                    {
                        var resumo = ObterResumo(resumos, i.Id);
                        var pendente = i.CalcularQuantidadePendente(resumo.QuantidadeDevolvidaAntes);
                        return new CompraEmTransitoItemDto
                        {
                            ItemId = i.Id,
                            ProdutoId = i.ProdutoId,
                            QuantidadeComprada = i.Quantidade,
                            QuantidadeRecebida = i.QuantidadeRecebida,
                            QuantidadePerdida = i.QuantidadePerdida,
                            QuantidadeDevolvidaAntes = resumo.QuantidadeDevolvidaAntes,
                            QuantidadeDevolvidaDepois = resumo.QuantidadeDevolvidaDepois,
                            QuantidadeElegivelDevolucaoAntes = Math.Max(0, pendente),
                            QuantidadePendente = Math.Max(0, pendente)
                        };
                    })
                    .ToList()
                    .AsReadOnly()
            };
        })
        .Where(c => c.Itens.Count > 0)
        .ToList();
    }

    private static IReadOnlyDictionary<Guid, CompraItemResumoDevolucao> AgruparResumosVigentes(
        IEnumerable<CompraItemDevolucao> devolucoes,
        DateTime referencia)
    {
        return devolucoes
            .Where(d => d.Compensacao == null || d.Compensacao.DataCompensacao > referencia)
            .Where(d => d.DataDevolucao <= referencia)
            .GroupBy(d => d.CompraItemId)
            .ToDictionary(
                g => g.Key,
                g => new CompraItemResumoDevolucao(
                    g.Where(d => d.Momento == CompraItemDevolucaoMomento.AntesDoRecebimento).Sum(d => d.Quantidade),
                    g.Where(d => d.Momento == CompraItemDevolucaoMomento.DepoisDoRecebimento).Sum(d => d.Quantidade)));
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
