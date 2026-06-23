using System;
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
    private readonly IVendaRepository _vendaRepository;

    public ObterListaContasReceberQueryHandler(
        IContaReceberRepository repository,
        IVendaRepository vendaRepository)
    {
        _repository = repository;
        _vendaRepository = vendaRepository;
    }

    public async Task<List<ContaReceberListDto>> Handle(ObterListaContasReceberQuery request, CancellationToken cancellationToken)
    {
        var contas = await _repository.ObterTodasAsync();

        var vendaIds = contas
            .Where(c => c.VendaId.HasValue)
            .Select(c => c.VendaId!.Value)
            .Distinct()
            .ToList();

        Dictionary<Guid, string> formaPagamentoPorVenda = new();
        if (vendaIds.Count > 0)
        {
            var vendas = await _vendaRepository.ObterTodasAsync();
            formaPagamentoPorVenda = vendas
                .Where(v => vendaIds.Contains(v.Id))
                .ToDictionary(v => v.Id, v => v.FormaPagamento.ToString());
        }

        return contas.Select(c =>
        {
            var totalPago = c.Pagamentos.Sum(p => p.ValorBrutoLiquidado);
            var saldo = c.Valor - totalPago;
            string? formaPagamento = c.VendaId.HasValue && formaPagamentoPorVenda.TryGetValue(c.VendaId.Value, out var fp)
                ? fp
                : null;

            return new ContaReceberListDto
            {
                Id = c.Id,
                VendaId = c.VendaId,
                ClienteId = c.ClienteId,
                Origem = c.Origem,
                FormaPagamento = formaPagamento,
                ValorTotal = c.Valor,
                TotalPago = totalPago,
                Saldo = saldo,
                Status = saldo <= 0 ? "Pago" : "Pendente",
                DataVencimento = c.DataVencimento
            };
        }).ToList();
    }
}
