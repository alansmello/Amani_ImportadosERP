using System;
using System.Collections.Generic;
using MediatR;
using Amani.ImportadosERP.Application.DTOs;

namespace Amani.ImportadosERP.Application.Queries;

public sealed class ObterContasReceberPorClienteDetalheQuery : IRequest<List<ContaReceberDetalheDto>>
{
    public Guid ClienteId { get; set; }
}
