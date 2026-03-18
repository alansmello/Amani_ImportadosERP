using System;
using System.Collections.Generic;

namespace Amani.ImportadosERP.Application.DTOs.Response;

public sealed class CompraItemResponseDto
{
    public Guid Id { get; set; }
    public Guid ProdutoId { get; set; }
    public int Quantidade { get; set; }
    public decimal CustoUnitario { get; set; }
    public decimal Desconto { get; set; }
    public decimal Acrescimo { get; set; }
    public decimal ValorTotal { get; set; }
}
