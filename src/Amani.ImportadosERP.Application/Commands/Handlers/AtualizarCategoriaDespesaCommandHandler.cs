using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Commands.Handlers;

public sealed class AtualizarCategoriaDespesaCommandHandler : IRequestHandler<AtualizarCategoriaDespesaCommand>
{
    private readonly ICategoriaDespesaRepository _categoriaDespesaRepository;

    public AtualizarCategoriaDespesaCommandHandler(ICategoriaDespesaRepository categoriaDespesaRepository)
    {
        _categoriaDespesaRepository = categoriaDespesaRepository;
    }

    public async Task Handle(AtualizarCategoriaDespesaCommand request, CancellationToken cancellationToken)
    {
        var categoria = await _categoriaDespesaRepository.ObterPorIdAsync(request.Id);

        if (categoria == null)
            throw new KeyNotFoundException("Categoria de despesa nao encontrada.");

        var nomeNormalizado = CategoriaDespesa.NormalizarNomeParaComparacao(request.Nome);
        var existente = await _categoriaDespesaRepository.ObterPorNomeNormalizadoAsync(nomeNormalizado);

        if (existente != null && existente.Id != request.Id)
            throw new InvalidOperationException("Ja existe uma categoria de despesa com este nome.");

        categoria.Atualizar(request.Nome, request.Descricao);
        await _categoriaDespesaRepository.AtualizarAsync(categoria);
    }
}
