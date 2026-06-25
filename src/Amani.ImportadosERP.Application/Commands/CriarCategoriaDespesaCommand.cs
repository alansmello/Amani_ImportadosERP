using System;
using MediatR;

namespace Amani.ImportadosERP.Application.Commands;

public sealed class CriarCategoriaDespesaCommand : IRequest<Guid>
{
    public string Nome { get; set; } = null!;
    public string? Descricao { get; set; }
}
