using System;
using Amani.ImportadosERP.Domain.Enums;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class ConfiguracaoFormaPagamentoDto
{
    public FormaPagamento FormaPagamento { get; set; }
    public decimal PercentualTaxa { get; set; }
    public DateTime AtualizadoEm { get; set; }
}
