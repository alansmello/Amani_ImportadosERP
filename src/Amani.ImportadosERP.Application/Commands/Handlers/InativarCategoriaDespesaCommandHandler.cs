using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Amani.ImportadosERP.Application.Interfaces;

namespace Amani.ImportadosERP.Application.Commands.Handlers;

public sealed class InativarCategoriaDespesaCommandHandler : IRequestHandler<InativarCategoriaDespesaCommand>
{
    private readonly ICategoriaDespesaRepository _categoriaDespesaRepository;

    public InativarCategoriaDespesaCommandHandler(ICategoriaDespesaRepository categoriaDespesaRepository)
    {
        _categoriaDespesaRepository = categoriaDespesaRepository;
    }

    public async Task Handle(InativarCategoriaDespesaCommand request, CancellationToken cancellationToken)
    {
        var categoria = await _categoriaDespesaRepository.ObterPorIdAsync(request.Id);

        if (categoria == null)
            throw new KeyNotFoundException("Categoria de despesa nao encontrada.");

        categoria.Inativar();
        await _categoriaDespesaRepository.AtualizarAsync(categoria);
    }
}
