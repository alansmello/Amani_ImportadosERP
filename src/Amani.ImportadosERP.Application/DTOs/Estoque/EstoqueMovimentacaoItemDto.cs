using System;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class EstoqueMovimentacaoItemDto
{
    public Guid Id { get; set; }
    public DateTime Data { get; set; }
    public string Tipo { get; set; } = string.Empty;
    public int Quantidade { get; set; }
    public string Origem { get; set; } = string.Empty;
    public Guid? CompraId { get; set; }
    public Guid? CompraItemId { get; set; }
    public Guid? VendaId { get; set; }
    public decimal? ValorUnitario { get; set; }
}
