using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Application.Queries;

namespace Amani.ImportadosERP.Application.Queries.Handlers;

public sealed class ContasReceberRelatorioHandler :
    IRequestHandler<ObterContasReceberPorClienteQuery, List<ContaReceberPorClienteDto>>
{
    private readonly IContaReceberRepository _repository;

    public ContasReceberRelatorioHandler(IContaReceberRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<ContaReceberPorClienteDto>> Handle(
        ObterContasReceberPorClienteQuery request,
        CancellationToken cancellationToken)
    {
        return await _repository.ObterEmAbertoPorClienteAsync();
    }
}
