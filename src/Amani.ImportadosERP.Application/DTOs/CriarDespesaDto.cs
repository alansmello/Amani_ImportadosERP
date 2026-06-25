using System;
using Amani.ImportadosERP.Domain.Enums;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class CriarDespesaDto
{
    public string Descricao { get; set; } = null!;
    public decimal Valor { get; set; }
    public DateTime? DataCompetencia { get; set; }
    public Guid CategoriaDespesaId { get; set; }
    public FormaPagamento FormaPagamento { get; set; }
}
