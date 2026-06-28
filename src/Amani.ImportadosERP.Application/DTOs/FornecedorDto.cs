using System;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class FornecedorDto
{
    public Guid Id { get; set; }
    public string Nome { get; set; } = null!;
    public string? Telefone { get; set; }
}
