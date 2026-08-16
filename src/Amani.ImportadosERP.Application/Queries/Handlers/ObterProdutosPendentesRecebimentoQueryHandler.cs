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

namespace Amani.ImportadosERP.Application.Queries.Handlers;

public sealed class ObterProdutosPendentesRecebimentoQueryHandler : IRequestHandler<ObterProdutosPendentesRecebimentoQuery, List<ProdutoPendenteRecebimentoDto>>
{
    private readonly ICompraRepository _compraRepository;
    private readonly ICompraItemDevolucaoRepository _devolucaoRepository;

    public ObterProdutosPendentesRecebimentoQueryHandler(
        ICompraRepository compraRepository,
        ICompraItemDevolucaoRepository devolucaoRepository)
    {
        _compraRepository = compraRepository;
        _devolucaoRepository = devolucaoRepository;
    }

    public async Task<List<ProdutoPendenteRecebimentoDto>> Handle(ObterProdutosPendentesRecebimentoQuery request, CancellationToken cancellationToken)
    {
        var compras = await _compraRepository.ObterComprasComProdutosPendentesAsync();
        var devolucoesPorCompra = new Dictionary<Guid, IReadOnlyDictionary<Guid, CompraItemResumoDevolucao>>();
        foreach (var compra in compras)
        {
            var devolucoes = await _devolucaoRepository.ObterPorCompraAsync(compra.Id);
            devolucoesPorCompra[compra.Id] = devolucoes
                .Where(d => d.Compensacao == null)
                .GroupBy(d => d.CompraItemId)
                .ToDictionary(
                    g => g.Key,
                    g => new CompraItemResumoDevolucao(
                        g.Where(d => d.Momento == CompraItemDevolucaoMomento.AntesDoRecebimento).Sum(d => d.Quantidade),
                        g.Where(d => d.Momento == CompraItemDevolucaoMomento.DepoisDoRecebimento).Sum(d => d.Quantidade)));
        }

        return compras
            .SelectMany(c => c.Items
                .Where(i => i.CalcularQuantidadePendente(ObterResumo(devolucoesPorCompra[c.Id], i.Id).QuantidadeDevolvidaAntes) > 0)
                .Select(i =>
                {
                    var resumo = ObterResumo(devolucoesPorCompra[c.Id], i.Id);
                    var pendente = i.CalcularQuantidadePendente(resumo.QuantidadeDevolvidaAntes);
                    return new ProdutoPendenteRecebimentoDto
                    {
                        CompraId = c.Id,
                        ItemId = i.Id,
                        ProdutoId = i.ProdutoId,
                        FornecedorId = c.FornecedorId,
                        DataCompra = c.DataCompra,
                        StatusCompra = Compra.CalcularStatusOperacional(
                            c.Items,
                            item => item.CalcularQuantidadePendente(ObterResumo(devolucoesPorCompra[c.Id], item.Id).QuantidadeDevolvidaAntes)).ToString(),
                        QuantidadeComprada = i.Quantidade,
                        QuantidadeRecebida = i.QuantidadeRecebida,
                        QuantidadePerdida = i.QuantidadePerdida,
                        QuantidadeDevolvidaAntes = resumo.QuantidadeDevolvidaAntes,
                        QuantidadeDevolvidaDepois = resumo.QuantidadeDevolvidaDepois,
                        QuantidadeElegivelDevolucaoAntes = pendente,
                        QuantidadePendente = pendente
                    };
                }))
            .ToList();
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
