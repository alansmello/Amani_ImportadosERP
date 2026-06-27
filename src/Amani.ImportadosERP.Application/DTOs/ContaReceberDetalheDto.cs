using System;
using System.Collections.Generic;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class ContaReceberDetalheDto
{
    public Guid ContaId { get; set; }
    public Guid? VendaId { get; set; }
    public Guid? ClienteId { get; set; }
    public string Origem { get; set; } = null!;
    public string? FormaPagamento { get; set; }
    public decimal ValorTotal { get; set; }
    public decimal TotalPago { get; set; }
    public decimal Saldo { get; set; }
    public DateTime DataVencimento { get; set; }
    public string Status { get; set; } = null!;
    public List<PagamentoDetalheDto> Pagamentos { get; set; } = new();
}
