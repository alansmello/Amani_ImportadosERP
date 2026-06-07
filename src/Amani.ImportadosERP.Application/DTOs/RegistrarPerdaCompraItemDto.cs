using System;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class RegistrarPerdaCompraItemDto
{
    public int Quantidade { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public DateTime? DataPerda { get; set; }
    public string? Observacao { get; set; }
}
