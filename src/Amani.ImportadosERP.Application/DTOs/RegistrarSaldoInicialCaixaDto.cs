using System;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class RegistrarSaldoInicialCaixaDto
{
    public decimal Valor { get; set; }
    public DateTime Data { get; set; }
    public string Origem { get; set; } = null!;
    public string? Descricao { get; set; }
}
