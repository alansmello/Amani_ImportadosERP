using System.Collections.Generic;
using MediatR;
using Amani.ImportadosERP.Application.DTOs;

namespace Amani.ImportadosERP.Application.Queries;

public sealed class ObterComprasEmTransitoQuery : IRequest<List<CompraEmTransitoDto>>
{
}
