using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Domain.Services;
using Amani.ImportadosERP.Application.Mappers;

namespace Amani.ImportadosERP.Application.Queries.Handlers;

public sealed class ObterListaComprasQueryHandler : IRequestHandler<ObterListaComprasQuery, List<CompraListDto>>
{
    private readonly ICompraRepository _compraRepository;
    private readonly ICompraReembolsoRepository _reembolsoRepository;
    private readonly ICompraItemDevolucaoRepository _devolucaoRepository;

    public ObterListaComprasQueryHandler(
        ICompraRepository compraRepository,
        ICompraReembolsoRepository reembolsoRepository,
        ICompraItemDevolucaoRepository devolucaoRepository)
    {
        _compraRepository = compraRepository;
        _reembolsoRepository = reembolsoRepository;
        _devolucaoRepository = devolucaoRepository;
    }

    public async Task<List<CompraListDto>> Handle(ObterListaComprasQuery request, CancellationToken cancellationToken)
    {
        var compras = await _compraRepository.ObterComFiltrosAsync(
            request.DataInicio,
            request.DataFim,
            request.FornecedorId
        );

        var result = new List<CompraListDto>();

        foreach (var compra in compras)
        {
            var reembolsos = await _reembolsoRepository.ObterPorCompraAsync(compra.Id);
            var devolucoes = await _devolucaoRepository.ObterPorCompraAsync(compra.Id);
            var resumo = CompraCalculoFinanceiro.CalcularResumoReembolso(
                compra.Total(),
                reembolsos.Sum(r => r.Valor),
                reembolsos.Where(r => r.Cancelamento != null).Sum(r => r.Valor));

            var quantidadeDevolvidaAntes = devolucoes
                .Where(d => d.Compensacao == null && d.Momento == CompraItemDevolucaoMomento.AntesDoRecebimento)
                .Sum(d => d.Quantidade);
            var quantidadeDevolvidaDepois = devolucoes
                .Where(d => d.Compensacao == null && d.Momento == CompraItemDevolucaoMomento.DepoisDoRecebimento)
                .Sum(d => d.Quantidade);
            var quantidadeDevolvidaDepoisCompensada = devolucoes
                .Where(d => d.Compensacao != null && d.Momento == CompraItemDevolucaoMomento.DepoisDoRecebimento)
                .Sum(d => d.Quantidade);
            var situacaoLogistica = CompraMapper.CalcularSituacaoLogisticaDevolucao(
                quantidadeDevolvidaDepois,
                quantidadeDevolvidaDepoisCompensada,
                compra.Items.Sum(i => i.QuantidadeRecebida));

            result.Add(new CompraListDto
            {
                Id = compra.Id,
                FornecedorId = compra.FornecedorId,
                DataCompra = compra.DataCompra,
                Status = compra.Status.ToString(),
                TotalCompra = compra.Total(),
                TotalReembolsadoLiquido = resumo.TotalReembolsado,
                CustoFinanceiroLiquido = resumo.CustoFinanceiroLiquido,
                SituacaoReembolso = resumo.Situacao.ToString(),
                PossuiDevolucao = devolucoes.Any(),
                QuantidadeDevolvidaAntes = quantidadeDevolvidaAntes,
                QuantidadeDevolvidaDepois = quantidadeDevolvidaDepois,
                QuantidadeDevolvidaDepoisCompensada = quantidadeDevolvidaDepoisCompensada,
                SituacaoLogisticaDevolucao = situacaoLogistica.Codigo,
                DescricaoSituacaoLogisticaDevolucao = situacaoLogistica.Descricao
            });
        }

        return result;
    }
}
