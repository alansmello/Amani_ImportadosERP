using System;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class PagamentoDetalheDto
{
    public Guid Id { get; set; }
    public decimal Valor { get; set; }
    public decimal Desconto { get; set; }
    public decimal ValorBrutoLiquidado { get; set; }
    public DateTime DataPagamento { get; set; }
}
