using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Commands.Handlers;

public sealed class RegistrarPagamentoCommandHandler : IRequestHandler<RegistrarPagamentoCommand, Unit>
{
    private readonly IContaReceberRepository _repository;

    public RegistrarPagamentoCommandHandler(IContaReceberRepository repository)
    {
        _repository = repository;
    }

    public async Task<Unit> Handle(RegistrarPagamentoCommand request, CancellationToken cancellationToken)
    {
        if (request.Valor <= 0)
            throw new Exception("Valor inválido");

        var conta = await _repository.ObterPorIdAsync(request.ContaReceberId);

        if (conta == null)
            throw new Exception("Conta não encontrada");

        var totalPago = conta.Pagamentos.Sum(p => p.Valor);
        var saldoRestante = conta.Valor - totalPago;

        if (request.Valor > saldoRestante)
            throw new Exception("Pagamento maior que o saldo restante");

        var pagamento = new PagamentoRecebido(conta.Id, request.Valor);

        await _repository.AdicionarPagamentoAsync(pagamento);

        await _repository.SalvarAsync();

        return Unit.Value;
    }
}
