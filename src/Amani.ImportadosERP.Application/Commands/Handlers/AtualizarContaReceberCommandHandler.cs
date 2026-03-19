using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Amani.ImportadosERP.Application.Interfaces;

namespace Amani.ImportadosERP.Application.Commands.Handlers;

public sealed class AtualizarContaReceberCommandHandler : IRequestHandler<AtualizarContaReceberCommand, Unit>
{
    private readonly IContaReceberRepository _repository;

    public AtualizarContaReceberCommandHandler(IContaReceberRepository repository)
    {
        _repository = repository;
    }

    public async Task<Unit> Handle(AtualizarContaReceberCommand request, CancellationToken cancellationToken)
    {
        var conta = await _repository.ObterPorIdAsync(request.Id);

        if (conta == null)
            throw new Exception("Conta não encontrada");

        var totalPago = conta.Pagamentos.Sum(p => p.Valor);

        if (request.Valor < totalPago)
            throw new Exception("Valor não pode ser menor que o total já pago");

        conta.Atualizar(request.Valor, request.DataVencimento);

        await _repository.SalvarAsync();

        return Unit.Value;
    }
}
