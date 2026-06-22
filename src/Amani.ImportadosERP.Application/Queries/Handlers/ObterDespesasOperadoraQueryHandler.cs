using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Enums;
using MediatR;

namespace Amani.ImportadosERP.Application.Queries.Handlers;

public sealed class ObterDespesasOperadoraQueryHandler
    : IRequestHandler<ObterDespesasOperadoraQuery, List<DespesaOperadoraListDto>>
{
    private readonly IDespesaOperadoraRepository _repository;

    public ObterDespesasOperadoraQueryHandler(IDespesaOperadoraRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<DespesaOperadoraListDto>> Handle(
        ObterDespesasOperadoraQuery request,
        CancellationToken cancellationToken)
    {
        if (request.DataInicio.HasValue && request.DataFim.HasValue && request.DataInicio.Value > request.DataFim.Value)
        {
            throw new InvalidOperationException("Periodo invalido");
        }

        if (request.FormaPagamento.HasValue &&
            request.FormaPagamento.Value is not FormaPagamento.CartaoDebito and not FormaPagamento.CartaoCredito)
        {
            throw new InvalidOperationException("Forma de pagamento invalida para despesa de operadora");
        }

        var despesas = await _repository.ObterComFiltrosAsync(
            request.DataInicio,
            request.DataFim,
            request.FormaPagamento);

        return despesas
            .Select(x => new DespesaOperadoraListDto
            {
                Id = x.Id,
                VendaId = x.VendaId,
                FormaPagamento = x.FormaPagamento,
                ValorBruto = x.ValorBruto,
                ValorLiquido = x.ValorLiquido,
                PercentualTaxa = x.PercentualTaxa,
                ValorTaxa = x.ValorTaxa,
                DataRegistro = x.DataRegistro
            })
            .ToList();
    }
}
