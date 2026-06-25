using System;
using Amani.ImportadosERP.Domain.Enums;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class DespesaListDto
{
    public Guid Id { get; set; }
    public DateTime DataCompetencia { get; set; }
    public decimal Valor { get; set; }
    public string Descricao { get; set; } = null!;
    public Guid CategoriaId { get; set; }
    public string CategoriaNome { get; set; } = null!;
    public bool CategoriaAtiva { get; set; }
    public FormaPagamento FormaPagamento { get; set; }
}
