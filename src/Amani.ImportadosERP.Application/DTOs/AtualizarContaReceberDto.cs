using System;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class AtualizarContaReceberDto
{
    public decimal Valor { get; set; }
    public DateTime DataVencimento { get; set; }
}
