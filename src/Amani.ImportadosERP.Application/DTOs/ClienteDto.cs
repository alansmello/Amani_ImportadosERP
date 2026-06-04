using System;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class ClienteDto
{
    public Guid Id { get; set; }
    public string Nome { get; set; } = null!;
    public string? Email { get; set; }
    public string? Telefone { get; set; }
    public bool Ativo { get; set; }
}
