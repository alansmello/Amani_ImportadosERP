using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.Interfaces;

namespace Amani.ImportadosERP.Application.Queries.Handlers;

public sealed class ObterListaVendasQueryHandler : IRequestHandler<ObterListaVendasQuery, List<VendaListDto>>
{
    private readonly IVendaRepository _vendaRepository;
    private readonly ICustoProdutoRepository _custoRepository;

    public ObterListaVendasQueryHandler(IVendaRepository vendaRepository, ICustoProdutoRepository custoRepository)
    {
        _vendaRepository = vendaRepository;
        _custoRepository = custoRepository;
    }

    public async Task<List<VendaListDto>> Handle(ObterListaVendasQuery request, CancellationToken cancellationToken)
    {
        var vendas = await _vendaRepository.ObterComFiltrosAsync(
            request.DataInicio,
            request.DataFim,
            request.ClienteId
        );
        var result = new List<VendaListDto>();

        foreach (var venda in vendas)
        {
            // Calcular total dos itens
            decimal totalItens = venda.Items.Sum(i => (i.PrecoUnitario * i.Quantidade) + i.Acrescimo - i.Desconto); 

            // Aplicar desconto e acrescimo geral da venda
            decimal totalVenda = totalItens + venda.Acrescimo - venda.Desconto;

            decimal lucroTotal = 0m;
            foreach (var item in venda.Items)
            {
                var custoMedio = await _custoRepository.ObterCustoMedioAsync(item.ProdutoId);
                lucroTotal += item.ValorTotal() - custoMedio * item.ObterQuantidadeEstoqueExata().ParaDecimal();
            }

            // Mapear entidade para DTO
            result.Add(new VendaListDto
            {
                Id = venda.Id,
                ClienteId = venda.ClienteId,
                DataVenda = venda.DataVenda,
                TotalVenda = totalVenda,
                Lucro = lucroTotal,
                FormaPagamento = venda.FormaPagamento,
                PossuiApresentacaoFracionada = venda.Items.Any(i => i.ProdutoApresentacaoId.HasValue)
            });
        }

        return result;
    }
}
