using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Application.Mappers;

namespace Amani.ImportadosERP.Application.Queries.Handlers;

public sealed class ObterPerdasCompraQueryHandler : IRequestHandler<ObterPerdasCompraQuery, List<PerdaCompraItemDto>>
{
    private readonly ICompraRepository _compraRepository;

    public ObterPerdasCompraQueryHandler(ICompraRepository compraRepository)
    {
        _compraRepository = compraRepository;
    }

    public async Task<List<PerdaCompraItemDto>> Handle(ObterPerdasCompraQuery request, CancellationToken cancellationToken)
    {
        var perdas = await _compraRepository.ObterPerdasPorCompraAsync(request.CompraId);
        return perdas.Select(CompraPerdaMapper.ToDto).ToList();
    }
}
