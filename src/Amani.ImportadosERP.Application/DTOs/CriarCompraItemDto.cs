using System;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class CriarCompraItemDto
{
    public Guid ProdutoId { get; set; }
    public int Quantidade { get; set; }
    public decimal CustoUnitario { get; set; }
    public decimal Desconto { get; set; } = 0m;
    public decimal Acrescimo { get; set; } = 0m;
}
