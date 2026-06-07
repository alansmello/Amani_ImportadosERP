using System;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class ContaReceberInicialResultadoDto
{
    public Guid ContaReceberId { get; set; }
    public Guid ClienteId { get; set; }
    public decimal Valor { get; set; }
    public DateTime DataVencimento { get; set; }
    public string Origem { get; set; } = null!;
}
