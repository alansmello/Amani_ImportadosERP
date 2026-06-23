using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Commands.Handlers;

public sealed class CriarContaReceberCommandHandler : IRequestHandler<CriarContaReceberCommand, Guid>
{
    private readonly IContaReceberRepository _repository;

    public CriarContaReceberCommandHandler(IContaReceberRepository repository)
    {
        _repository = repository;
    }

    public async Task<Guid> Handle(CriarContaReceberCommand request, CancellationToken cancellationToken)
    {
        if (request.Valor <= 0)
            throw new Exception("Valor inválido");

        if (!request.ClienteId.HasValue || request.ClienteId.Value == Guid.Empty)
            throw new Exception("ClienteId e obrigatorio para criacao de conta a receber manual");

        var conta = ContaReceber.CriarManual(
            request.ClienteId.Value,
            request.Valor,
            request.DataVencimento
        );

        await _repository.AdicionarAsync(conta);

        return conta.Id;
    }
}
