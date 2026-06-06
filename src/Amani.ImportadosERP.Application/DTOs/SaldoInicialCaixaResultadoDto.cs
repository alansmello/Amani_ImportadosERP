using System;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class SaldoInicialCaixaResultadoDto
{
    public Guid EventoFinanceiroId { get; set; }
    public decimal Valor { get; set; }
    public DateTime Data { get; set; }
    public string Origem { get; set; } = null!;
}
