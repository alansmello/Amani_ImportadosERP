using System;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class ContaReceberListDto
{
    public Guid Id { get; set; }
    public Guid VendaId { get; set; }
    public decimal ValorTotal { get; set; }
    public decimal TotalPago { get; set; }
    public decimal Saldo { get; set; }
    public string Status { get; set; } = null!;
    public DateTime DataVencimento { get; set; }
}
