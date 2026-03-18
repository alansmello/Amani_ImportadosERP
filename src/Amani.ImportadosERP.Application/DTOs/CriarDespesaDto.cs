using System;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class CriarDespesaDto
{
    public string Descricao { get; set; } = null!;
    public decimal Valor { get; set; }
    public DateTime? Data { get; set; }
    public Guid CategoriaDespesaId { get; set; }
}
