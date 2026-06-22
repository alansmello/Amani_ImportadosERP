using System;
using Amani.ImportadosERP.Domain.Enums;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class VendaResultDto
{
    public Guid Id { get; set; }
    public decimal Lucro { get; set; }
    public FormaPagamento? FormaPagamento { get; set; }
    public string? StatusFinanceiro { get; set; }
    public Guid? ContaReceberId { get; set; }
    public decimal ValorBruto { get; set; }
    public decimal ValorLiquido { get; set; }
    public decimal? PercentualTaxaAplicado { get; set; }
    public Guid? DespesaOperadoraId { get; set; }
    public string? MensagemFinanceira { get; set; }
}
