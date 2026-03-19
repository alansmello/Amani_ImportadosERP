using System;
using MediatR;

namespace Amani.ImportadosERP.Application.Commands;

public sealed class ExcluirContaReceberCommand : IRequest<Unit>
{
    public Guid Id { get; set; }
}
