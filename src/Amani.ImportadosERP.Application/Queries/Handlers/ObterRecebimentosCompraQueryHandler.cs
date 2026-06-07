using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Application.Mappers;

namespace Amani.ImportadosERP.Application.Queries.Handlers;

public sealed class ObterRecebimentosCompraQueryHandler : IRequestHandler<ObterRecebimentosCompraQuery, List<RecebimentoCompraItemDto>>
{
    private readonly ICompraRepository _compraRepository;

    public ObterRecebimentosCompraQueryHandler(ICompraRepository compraRepository)
    {
        _compraRepository = compraRepository;
    }

    public async Task<List<RecebimentoCompraItemDto>> Handle(ObterRecebimentosCompraQuery request, CancellationToken cancellationToken)
    {
        var recebimentos = await _compraRepository.ObterRecebimentosPorCompraAsync(request.CompraId);
        return recebimentos.Select(CompraRecebimentoMapper.ToDto).ToList();
    }
}
