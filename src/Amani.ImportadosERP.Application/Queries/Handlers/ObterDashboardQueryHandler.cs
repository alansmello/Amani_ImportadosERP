using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.Interfaces;

namespace Amani.ImportadosERP.Application.Queries.Handlers;

public sealed class ObterDashboardQueryHandler : IRequestHandler<ObterDashboardQuery, DashboardDto>
{
    private readonly IVendaRepository _vendaRepository;
    private readonly ICustoProdutoRepository _custoRepository;

    public ObterDashboardQueryHandler(IVendaRepository vendaRepository, ICustoProdutoRepository custoRepository)
    {
        _vendaRepository = vendaRepository;
        _custoRepository = custoRepository;
    }

    public async Task<DashboardDto> Handle(ObterDashboardQuery request, CancellationToken cancellationToken)
    {
        // Buscar vendas com filtros
        var vendas = await _vendaRepository.ObterComFiltrosAsync(
            request.DataInicio,
            request.DataFim,
            request.ClienteId
        );

        if (!vendas.Any())
        {
            return new DashboardDto
            {
                TotalVendido = 0m,
                LucroTotal = 0m,
                QuantidadeVendas = 0,
                TicketMedio = 0m
            };
        }

        // Calcular lucro total para cada venda
        var vendaComLucro = new List<(decimal TotalVenda, decimal Lucro)>();

        foreach (var venda in vendas)
        {
            // Calcular total dos itens
            decimal totalItens = venda.Items.Sum(i => (i.PrecoUnitario * i.Quantidade) + i.Acrescimo - i.Desconto);

            // Aplicar desconto e acrescimo geral da venda
            decimal totalVenda = totalItens + venda.Acrescimo - venda.Desconto;

            decimal lucroVenda = 0m;
            foreach (var item in venda.Items)
            {
                var custoMedio = await _custoRepository.ObterCustoMedioAsync(item.ProdutoId);
                lucroVenda += item.ValorTotal() - custoMedio * item.ObterQuantidadeEstoqueExata().ParaDecimal();
            }

            vendaComLucro.Add((totalVenda, lucroVenda));
        }

        // Calcular métricas
        var totalVendido = vendaComLucro.Sum(v => v.TotalVenda);
        var lucroTotal = vendaComLucro.Sum(v => v.Lucro);
        var quantidadeVendas = vendas.Count;
        var ticketMedio = quantidadeVendas > 0 ? totalVendido / quantidadeVendas : 0m;

        return new DashboardDto
        {
            TotalVendido = totalVendido,
            LucroTotal = lucroTotal,
            QuantidadeVendas = quantidadeVendas,
            TicketMedio = ticketMedio
        };
    }
}
