using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.Interfaces;

namespace Amani.ImportadosERP.Application.Queries.Handlers;

public sealed class ObterProdutosPendentesRecebimentoQueryHandler : IRequestHandler<ObterProdutosPendentesRecebimentoQuery, List<ProdutoPendenteRecebimentoDto>>
{
    private readonly ICompraRepository _compraRepository;

    public ObterProdutosPendentesRecebimentoQueryHandler(ICompraRepository compraRepository)
    {
        _compraRepository = compraRepository;
    }

    public async Task<List<ProdutoPendenteRecebimentoDto>> Handle(ObterProdutosPendentesRecebimentoQuery request, CancellationToken cancellationToken)
    {
        var compras = await _compraRepository.ObterComprasComProdutosPendentesAsync();

        return compras
            .SelectMany(c => c.Items
                .Where(i => i.QuantidadePendente > 0)
                .Select(i => new ProdutoPendenteRecebimentoDto
                {
                    CompraId = c.Id,
                    ItemId = i.Id,
                    ProdutoId = i.ProdutoId,
                    FornecedorId = c.FornecedorId,
                    DataCompra = c.DataCompra,
                    StatusCompra = c.Status.ToString(),
                    QuantidadeComprada = i.Quantidade,
                    QuantidadeRecebida = i.QuantidadeRecebida,
                    QuantidadePerdida = i.QuantidadePerdida,
                    QuantidadePendente = i.QuantidadePendente
                }))
            .ToList();
    }
}
