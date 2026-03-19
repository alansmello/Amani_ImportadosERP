using System;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class ContaReceberPorClienteDto
{
    public Guid ClienteId { get; set; }
    public string NomeCliente { get; set; } = null!;
    public decimal TotalAReceber { get; set; }
}
