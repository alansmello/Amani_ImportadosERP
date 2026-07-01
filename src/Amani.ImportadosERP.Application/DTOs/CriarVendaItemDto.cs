using System;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class CriarVendaItemDto
{
    public Guid ProdutoId { get; set; }
    public Guid? ProdutoApresentacaoId { get; set; }
    public int Quantidade { get; set; }
    public decimal PrecoUnitario { get; set; }
    public decimal Desconto { get; set; } = 0m;
    public decimal Acrescimo { get; set; } = 0m;
}
