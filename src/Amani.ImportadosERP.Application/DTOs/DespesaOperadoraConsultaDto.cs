using System.Collections.Generic;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class DespesaOperadoraConsultaDto
{
    public List<DespesaOperadoraListDto> Itens { get; set; } = new();
    public DespesaOperadoraResumoDto Resumo { get; set; } = new();
}
