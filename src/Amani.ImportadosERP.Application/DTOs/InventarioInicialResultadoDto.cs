using System;
using System.Collections.Generic;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class InventarioInicialResultadoDto
{
    public DateTime Data { get; set; }
    public string Origem { get; set; } = null!;
    public int QuantidadeItens { get; set; }
    public List<Guid> MovimentacoesIds { get; set; } = new();
}
