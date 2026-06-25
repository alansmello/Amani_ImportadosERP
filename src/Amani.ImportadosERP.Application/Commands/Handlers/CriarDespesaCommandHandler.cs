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
    private readonly ICategoriaDespesaRepository _categoriaDespesaRepository;

    public CriarDespesaCommandHandler(
        IDespesaRepository despesaRepository,
        ICategoriaDespesaRepository categoriaDespesaRepository)
    {
        _despesaRepository = despesaRepository;
        _categoriaDespesaRepository = categoriaDespesaRepository;
    }

    public async Task<Guid> Handle(CriarDespesaCommand request, CancellationToken cancellationToken)
    {
        var categoria = await _categoriaDespesaRepository.ObterPorIdAsync(request.CategoriaDespesaId);

        if (categoria == null)
            throw new InvalidOperationException("Categoria de despesa nao encontrada.");

        if (!categoria.Ativa)
            throw new InvalidOperationException("Categoria de despesa inativa.");

        if (!Despesa.FormaPagamentoValidaParaDespesa(request.FormaPagamento))
            throw new InvalidOperationException("Forma de pagamento invalida para despesa.");

        var despesa = new Despesa(
            request.Descricao,
            request.Valor,
            request.DataCompetencia,
            request.CategoriaDespesaId,
            request.FormaPagamento
        );

        await _despesaRepository.AdicionarAsync(despesa);
        return despesa.Id;
    }
}
