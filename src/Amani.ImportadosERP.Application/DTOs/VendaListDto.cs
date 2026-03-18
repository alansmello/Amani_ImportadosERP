using System;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class VendaListDto
{
    public Guid Id { get; set; }
    public Guid ClienteId { get; set; }
    public DateTime DataVenda { get; set; }
    public decimal TotalVenda { get; set; }
    public decimal Lucro { get; set; }
}
