using System;
using System.Collections.Generic;
using MediatR;
using Amani.ImportadosERP.Application.DTOs;

namespace Amani.ImportadosERP.Application.Queries;

public sealed class ObterListaComprasQuery : IRequest<List<CompraListDto>>
{
    public DateTime? DataInicio { get; set; }
    public DateTime? DataFim { get; set; }
    public Guid? FornecedorId { get; set; }
}
