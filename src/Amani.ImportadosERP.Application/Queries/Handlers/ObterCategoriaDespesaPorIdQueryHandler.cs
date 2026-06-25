using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.Interfaces;

namespace Amani.ImportadosERP.Application.Queries.Handlers;

public sealed class ObterCategoriaDespesaPorIdQueryHandler : IRequestHandler<ObterCategoriaDespesaPorIdQuery, CategoriaDespesaDto?>
{
    private readonly ICategoriaDespesaRepository _categoriaDespesaRepository;

    public ObterCategoriaDespesaPorIdQueryHandler(ICategoriaDespesaRepository categoriaDespesaRepository)
    {
        _categoriaDespesaRepository = categoriaDespesaRepository;
    }

    public async Task<CategoriaDespesaDto?> Handle(ObterCategoriaDespesaPorIdQuery request, CancellationToken cancellationToken)
    {
        var categoria = await _categoriaDespesaRepository.ObterPorIdAsync(request.Id);

        if (categoria == null)
            return null;

        return new CategoriaDespesaDto
        {
            Id = categoria.Id,
            Nome = categoria.Nome,
            Descricao = categoria.Descricao,
            Ativa = categoria.Ativa
        };
    }
}
