using System;
using System.Collections.Generic;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class CriarVendaDto
{
    public Guid ClienteId { get; set; }
    public DateTime? DataVenda { get; set; }
    public decimal Desconto { get; set; } = 0m;
    public decimal Acrescimo { get; set; } = 0m;
    public List<CriarVendaItemDto> Items { get; set; } = new();
}
