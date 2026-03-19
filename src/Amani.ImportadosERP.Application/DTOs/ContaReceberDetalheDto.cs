using System;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class ContaReceberDetalheDto
{
    public Guid ContaId { get; set; }
    public Guid VendaId { get; set; }
    public decimal ValorTotal { get; set; }
    public decimal TotalPago { get; set; }
    public decimal Saldo { get; set; }
    public DateTime DataVencimento { get; set; }
}
