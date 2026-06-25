using System;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class CategoriaDespesaDto
{
    public Guid Id { get; set; }
    public string Nome { get; set; } = null!;
    public string? Descricao { get; set; }
    public bool Ativa { get; set; }
}
