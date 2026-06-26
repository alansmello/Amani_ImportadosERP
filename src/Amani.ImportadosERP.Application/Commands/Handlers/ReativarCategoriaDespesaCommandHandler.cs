using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Amani.ImportadosERP.Application.Interfaces;

namespace Amani.ImportadosERP.Application.Commands.Handlers;

public sealed class ReativarCategoriaDespesaCommandHandler : IRequestHandler<ReativarCategoriaDespesaCommand>
{
    private readonly ICategoriaDespesaRepository _categoriaDespesaRepository;

    public ReativarCategoriaDespesaCommandHandler(ICategoriaDespesaRepository categoriaDespesaRepository)
    {
        _categoriaDespesaRepository = categoriaDespesaRepository;
    }

    public async Task Handle(ReativarCategoriaDespesaCommand request, CancellationToken cancellationToken)
    {
        await _categoriaDespesaRepository.ReativarAsync(request.Id);
    }
}
