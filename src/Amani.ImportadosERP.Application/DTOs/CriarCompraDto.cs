using System;
using System.Collections.Generic;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class CriarCompraDto
{
    public Guid FornecedorId { get; set; }
    public DateTime? DataCompra { get; set; }
    public decimal Desconto { get; set; } = 0m;
    public decimal Acrescimo { get; set; } = 0m;
    public List<CriarCompraItemDto> Items { get; set; } = new();
}
