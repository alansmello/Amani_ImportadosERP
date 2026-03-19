using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Application.Queries;

namespace Amani.ImportadosERP.Application.Queries.Handlers;

public sealed class ObterContasReceberPorClienteDetalheHandler
    : IRequestHandler<ObterContasReceberPorClienteDetalheQuery, List<ContaReceberDetalheDto>>
{
    private readonly IContaReceberRepository _repository;

    public ObterContasReceberPorClienteDetalheHandler(IContaReceberRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<ContaReceberDetalheDto>> Handle(
        ObterContasReceberPorClienteDetalheQuery request,
        CancellationToken cancellationToken)
    {
        if (request.ClienteId == Guid.Empty)
            return new List<ContaReceberDetalheDto>();

        return await _repository.ObterEmAbertoDetalhePorClienteAsync(request.ClienteId);
    }
}
