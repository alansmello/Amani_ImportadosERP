using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.Interfaces;

namespace Amani.ImportadosERP.Application.Queries.Handlers;

public sealed class ObterListaDespesasQueryHandler : IRequestHandler<ObterListaDespesasQuery, List<DespesaListDto>>
{
    private readonly IDespesaRepository _despesaRepository;

    public ObterListaDespesasQueryHandler(IDespesaRepository despesaRepository)
    {
        _despesaRepository = despesaRepository;
    }

    public async Task<List<DespesaListDto>> Handle(ObterListaDespesasQuery request, CancellationToken cancellationToken)
    {
        var despesas = await _despesaRepository.ObterComFiltrosAsync(
            request.DataInicio,
            request.DataFim,
            request.CategoriaId
        );

        return despesas.Select(d => new DespesaListDto
        {
            Id = d.Id,
            DataCompetencia = d.DataCompetencia,
            Valor = d.Valor,
            Descricao = d.Descricao,
            CategoriaId = d.CategoriaDespesaId,
            CategoriaNome = d.CategoriaDespesa?.Nome ?? "Categoria nao encontrada",
            CategoriaAtiva = d.CategoriaDespesa?.Ativa ?? false,
            FormaPagamento = d.FormaPagamento
        }).ToList();
    }
}
