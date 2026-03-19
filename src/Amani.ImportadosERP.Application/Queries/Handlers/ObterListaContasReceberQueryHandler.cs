using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.Interfaces;

namespace Amani.ImportadosERP.Application.Queries.Handlers;

public sealed class ObterListaContasReceberQueryHandler : IRequestHandler<ObterListaContasReceberQuery, List<ContaReceberListDto>>
{
    private readonly IContaReceberRepository _repository;

    public ObterListaContasReceberQueryHandler(IContaReceberRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<ContaReceberListDto>> Handle(ObterListaContasReceberQuery request, CancellationToken cancellationToken)
    {
        var contas = await _repository.ObterTodasAsync();

        return contas.Select(c =>
        {
            var totalPago = c.Pagamentos.Sum(p => p.Valor);
            var saldo = c.Valor - totalPago;

            return new ContaReceberListDto
            {
                Id = c.Id,
                VendaId = c.VendaId,
                ValorTotal = c.Valor,
                TotalPago = totalPago,
                Saldo = saldo,
                Status = saldo <= 0 ? "Pago" : "Pendente",
                DataVencimento = c.DataVencimento
            };
        }).ToList();
    }
}
