using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.Interfaces;

namespace Amani.ImportadosERP.Application.Queries.Handlers;

public sealed class ObterCategoriasDespesaQueryHandler : IRequestHandler<ObterCategoriasDespesaQuery, List<CategoriaDespesaDto>>
{
    private readonly ICategoriaDespesaRepository _categoriaDespesaRepository;

    public ObterCategoriasDespesaQueryHandler(ICategoriaDespesaRepository categoriaDespesaRepository)
    {
        _categoriaDespesaRepository = categoriaDespesaRepository;
    }

    public async Task<List<CategoriaDespesaDto>> Handle(ObterCategoriasDespesaQuery request, CancellationToken cancellationToken)
    {
        var categorias = await _categoriaDespesaRepository.ListarAsync(request.IncluirInativas);

        return categorias.Select(c => new CategoriaDespesaDto
        {
            Id = c.Id,
            Nome = c.Nome,
            Descricao = c.Descricao,
            Ativa = c.Ativa
        }).ToList();
    }
}
