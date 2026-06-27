using System;
using MediatR;

namespace Amani.ImportadosERP.Application.Commands;

public sealed class RegistrarPagamentoCommand : IRequest<Unit>
{
    public Guid ContaReceberId { get; set; }
    public decimal Valor { get; set; }
    public decimal Desconto { get; set; } = 0m;
    public decimal? ValorBrutoLiquidado { get; set; }
}
