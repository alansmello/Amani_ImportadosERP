using System;
using MediatR;

namespace Amani.ImportadosERP.Application.Commands;

public sealed class CancelarVendaCommand : IRequest<Unit>
{
    public Guid VendaId { get; set; }
}
