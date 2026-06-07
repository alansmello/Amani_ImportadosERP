using System;
using System.Collections.Generic;

namespace Amani.ImportadosERP.Application.DTOs.Response;

public sealed class CompraResponseDto
{
    public Guid Id { get; set; }
    public Guid FornecedorId { get; set; }
    public DateTime DataCompra { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal Desconto { get; set; }
    public decimal Acrescimo { get; set; }
    public decimal Total { get; set; }
    public IReadOnlyCollection<CompraItemResponseDto> Items { get; set; } = new List<CompraItemResponseDto>();
}
