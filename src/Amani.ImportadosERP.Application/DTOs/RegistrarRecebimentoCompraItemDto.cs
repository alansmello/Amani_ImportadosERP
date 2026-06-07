using System;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class RegistrarRecebimentoCompraItemDto
{
    public int Quantidade { get; set; }
    public DateTime? DataRecebimento { get; set; }
    public string? Observacao { get; set; }
}
