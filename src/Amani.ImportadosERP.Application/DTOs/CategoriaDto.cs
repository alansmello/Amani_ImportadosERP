using System;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class CategoriaDto
{
    public Guid Id { get; set; }
    public string Nome { get; set; } = null!;
}
