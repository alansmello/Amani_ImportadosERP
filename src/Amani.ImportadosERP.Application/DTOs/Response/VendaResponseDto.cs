using System;
using System.Collections.Generic;

namespace Amani.ImportadosERP.Application.DTOs.Response;

public sealed class VendaResponseDto
{
    public Guid Id { get; set; }
    public Guid ClienteId { get; set; }
    public DateTime DataVenda { get; set; }
    public decimal Desconto { get; set; }
    public decimal Acrescimo { get; set; }
    public decimal Total { get; set; }
    public decimal Lucro { get; set; }
    public IReadOnlyCollection<VendaItemResponseDto> Items { get; set; } = new List<VendaItemResponseDto>();
}
