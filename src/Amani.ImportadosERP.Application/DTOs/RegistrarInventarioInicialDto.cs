using System;
using System.Collections.Generic;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class RegistrarInventarioInicialDto
{
    public DateTime Data { get; set; }
    public string Origem { get; set; } = null!;
    public List<RegistrarInventarioInicialItemDto> Itens { get; set; } = new();
}
