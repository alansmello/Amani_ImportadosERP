using System;
using MediatR;

namespace Amani.ImportadosERP.Application.Commands;

public sealed class AtualizarCategoriaDespesaCommand : IRequest
{
    public Guid Id { get; set; }
    public string Nome { get; set; } = null!;
    public string? Descricao { get; set; }
}
