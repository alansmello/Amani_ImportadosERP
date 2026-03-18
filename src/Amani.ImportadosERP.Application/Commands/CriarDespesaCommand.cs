using System;
using MediatR;

namespace Amani.ImportadosERP.Application.Commands;

public sealed class CriarDespesaCommand : IRequest<Guid>
{
    public DateTime Data { get; set; }
    public decimal Valor { get; set; }
    public string Descricao { get; set; } = null!;
    public Guid CategoriaDespesaId { get; set; }
}
