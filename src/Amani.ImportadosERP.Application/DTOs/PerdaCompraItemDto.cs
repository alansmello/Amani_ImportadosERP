using System;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class PerdaCompraItemDto
{
    public Guid Id { get; set; }
    public Guid CompraId { get; set; }
    public Guid ItemId { get; set; }
    public Guid ProdutoId { get; set; }
    public int Quantidade { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public DateTime DataPerda { get; set; }
    public string? Observacao { get; set; }
}
