using System;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class RecebimentoCompraItemDto
{
    public Guid Id { get; set; }
    public Guid CompraId { get; set; }
    public Guid ItemId { get; set; }
    public Guid ProdutoId { get; set; }
    public int Quantidade { get; set; }
    public decimal ValorUnitario { get; set; }
    public string Origem { get; set; } = string.Empty;
    public DateTime DataRecebimento { get; set; }
    public Guid? EstoqueMovimentacaoId { get; set; }
    public string? Observacao { get; set; }
}
