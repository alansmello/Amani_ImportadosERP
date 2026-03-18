using System;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class DespesaListDto
{
    public Guid Id { get; set; }
    public DateTime Data { get; set; }
    public decimal Valor { get; set; }
    public string Descricao { get; set; } = null!;
    public Guid CategoriaId { get; set; }
}
