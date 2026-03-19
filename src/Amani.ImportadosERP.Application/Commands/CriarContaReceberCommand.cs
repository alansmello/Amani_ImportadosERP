using System;
using MediatR;

namespace Amani.ImportadosERP.Application.Commands;

public sealed class CriarContaReceberCommand : IRequest<Guid>
{
    public Guid VendaId { get; set; }
    public decimal Valor { get; set; }
    public DateTime DataVencimento { get; set; }
}
