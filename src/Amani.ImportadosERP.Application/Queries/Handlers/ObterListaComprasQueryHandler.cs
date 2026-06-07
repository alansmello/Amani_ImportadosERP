using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.Interfaces;

namespace Amani.ImportadosERP.Application.Queries.Handlers;

public sealed class ObterListaComprasQueryHandler : IRequestHandler<ObterListaComprasQuery, List<CompraListDto>>
{
    private readonly ICompraRepository _compraRepository;

    public ObterListaComprasQueryHandler(ICompraRepository compraRepository)
    {
        _compraRepository = compraRepository;
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
            // Calcular total dos itens
            decimal totalItens = compra.Items.Sum(i => i.CustoUnitario * i.Quantidade);

            // Aplicar desconto e acrescimo geral da compra
            decimal totalCompra = totalItens + compra.Acrescimo - compra.Desconto;

            // Mapear entidade para DTO
            result.Add(new CompraListDto
            {
                Id = compra.Id,
                FornecedorId = compra.FornecedorId,
                DataCompra = compra.DataCompra,
                Status = compra.Status.ToString(),
                TotalCompra = totalCompra
            });
        }

        return result;
    }
}
