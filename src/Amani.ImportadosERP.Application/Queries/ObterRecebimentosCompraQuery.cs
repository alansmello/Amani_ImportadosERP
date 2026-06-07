using System;
using System.Collections.Generic;
using MediatR;
using Amani.ImportadosERP.Application.DTOs;

namespace Amani.ImportadosERP.Application.Queries;

public sealed class ObterRecebimentosCompraQuery : IRequest<List<RecebimentoCompraItemDto>>
{
    public Guid CompraId { get; set; }
}
