using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Commands.Handlers;

public sealed class CriarDespesaCommandHandler : IRequestHandler<CriarDespesaCommand, Guid>
{
    private readonly IDespesaRepository _despesaRepository;

    public CriarDespesaCommandHandler(IDespesaRepository despesaRepository)
    {
        _despesaRepository = despesaRepository;
    }

    public async Task<Guid> Handle(CriarDespesaCommand request, CancellationToken cancellationToken)
    {
        var despesa = new Despesa(request.Descricao, request.Valor, request.Data, request.CategoriaDespesaId);
        await _despesaRepository.AdicionarAsync(despesa);
        return despesa.Id;
    }
}
