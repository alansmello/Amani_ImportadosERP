using System;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class RegistrarInventarioInicialItemDto
{
    public Guid ProdutoId { get; set; }
    public int Quantidade { get; set; }
    public decimal? ValorUnitario { get; set; }
}
