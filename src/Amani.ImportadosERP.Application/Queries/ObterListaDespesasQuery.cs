using System;
using System.Collections.Generic;
using MediatR;
using Amani.ImportadosERP.Application.DTOs;

namespace Amani.ImportadosERP.Application.Queries;

public sealed class ObterListaDespesasQuery : IRequest<List<DespesaListDto>>
{
    public DateTime? DataInicio { get; set; }
    public DateTime? DataFim { get; set; }
    public Guid? CategoriaId { get; set; }
}
