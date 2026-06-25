using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Commands.Handlers;

public sealed class CriarCategoriaDespesaCommandHandler : IRequestHandler<CriarCategoriaDespesaCommand, Guid>
{
    private readonly ICategoriaDespesaRepository _categoriaDespesaRepository;

    public CriarCategoriaDespesaCommandHandler(ICategoriaDespesaRepository categoriaDespesaRepository)
    {
        _categoriaDespesaRepository = categoriaDespesaRepository;
    }

    public async Task<Guid> Handle(CriarCategoriaDespesaCommand request, CancellationToken cancellationToken)
    {
        var nomeNormalizado = CategoriaDespesa.NormalizarNomeParaComparacao(request.Nome);
        var existente = await _categoriaDespesaRepository.ObterPorNomeNormalizadoAsync(nomeNormalizado);

        if (existente != null)
            throw new InvalidOperationException("Ja existe uma categoria de despesa com este nome.");

        var categoria = new CategoriaDespesa(request.Nome, request.Descricao);
        await _categoriaDespesaRepository.AdicionarAsync(categoria);
        return categoria.Id;
    }
}
