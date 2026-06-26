using System;
using MediatR;

namespace Amani.ImportadosERP.Application.Commands;

public sealed class ReativarCategoriaDespesaCommand : IRequest
{
    public Guid Id { get; set; }
}
