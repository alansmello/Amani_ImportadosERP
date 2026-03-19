using System;
using MediatR;

namespace Amani.ImportadosERP.Application.Commands;

public sealed class AtualizarContaReceberCommand : IRequest<Unit>
{
    public Guid Id { get; set; }
    public decimal Valor { get; set; }
    public DateTime DataVencimento { get; set; }
}
