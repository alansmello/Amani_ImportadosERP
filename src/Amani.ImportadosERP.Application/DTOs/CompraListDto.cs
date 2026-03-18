using System;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class CompraListDto
{
    public Guid Id { get; set; }
    public Guid FornecedorId { get; set; }
    public DateTime DataCompra { get; set; }
    public decimal TotalCompra { get; set; }
}
