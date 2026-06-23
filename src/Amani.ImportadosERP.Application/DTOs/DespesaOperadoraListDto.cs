using System;
using Amani.ImportadosERP.Domain.Enums;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class DespesaOperadoraListDto
{
    public Guid Id { get; set; }
    public Guid VendaId { get; set; }
    public FormaPagamento FormaPagamento { get; set; }
    public decimal ValorBruto { get; set; }
    public decimal ValorLiquido { get; set; }
    public decimal PercentualTaxa { get; set; }
    public decimal ValorTaxa { get; set; }
    public DateTime DataRegistro { get; set; }
}
