using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Amani.ImportadosERP.Application.Interfaces;

namespace Amani.ImportadosERP.Application.Commands.Handlers;

public sealed class ExcluirContaReceberCommandHandler : IRequestHandler<ExcluirContaReceberCommand, Unit>
{
    private readonly IContaReceberRepository _repository;

    public ExcluirContaReceberCommandHandler(IContaReceberRepository repository)
    {
        _repository = repository;
    }

    public async Task<Unit> Handle(ExcluirContaReceberCommand request, CancellationToken cancellationToken)
    {
        var conta = await _repository.ObterPorIdAsync(request.Id);

        if (conta == null)
            throw new Exception("Conta não encontrada");

        if (conta.Pagamentos.Any())
            throw new Exception("Não é possível excluir uma conta com pagamentos");

        await _repository.RemoverAsync(conta);
        await _repository.SalvarAsync();

        return Unit.Value;
    }
}
