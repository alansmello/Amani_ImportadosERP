using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.Interfaces;

namespace Amani.ImportadosERP.Application.Queries.Handlers;

public sealed class ObterComprasEmTransitoQueryHandler : IRequestHandler<ObterComprasEmTransitoQuery, List<CompraEmTransitoDto>>
{
    private readonly ICompraRepository _compraRepository;

    public ObterComprasEmTransitoQueryHandler(ICompraRepository compraRepository)
    {
        _compraRepository = compraRepository;
    }

    public async Task<List<CompraEmTransitoDto>> Handle(ObterComprasEmTransitoQuery request, CancellationToken cancellationToken)
    {
        var compras = await _compraRepository.ObterComprasEmTransitoAsync();

        return compras.Select(c => new CompraEmTransitoDto
        {
            CompraId = c.Id,
            FornecedorId = c.FornecedorId,
            DataCompra = c.DataCompra,
            Status = c.Status.ToString(),
            Itens = c.Items
                .Where(i => i.QuantidadePendente > 0)
                .Select(i => new CompraEmTransitoItemDto
                {
                    ItemId = i.Id,
                    ProdutoId = i.ProdutoId,
                    QuantidadeComprada = i.Quantidade,
                    QuantidadeRecebida = i.QuantidadeRecebida,
                    QuantidadePerdida = i.QuantidadePerdida,
                    QuantidadePendente = i.QuantidadePendente
                })
                .ToList()
                .AsReadOnly()
        }).ToList();
    }
}
