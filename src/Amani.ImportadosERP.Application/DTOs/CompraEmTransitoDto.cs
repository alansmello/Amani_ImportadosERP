using System;
using System.Collections.Generic;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class CompraEmTransitoDto
{
    public Guid CompraId { get; set; }
    public Guid FornecedorId { get; set; }
    public DateTime DataCompra { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal TotalCompra { get; set; }
    public decimal? ValorPendenteCusto { get; set; }
    public string? MotivoValorPendenteIndisponivel { get; set; }
    public IReadOnlyCollection<CompraEmTransitoItemDto> Itens { get; set; } = new List<CompraEmTransitoItemDto>();
}

public sealed class CompraEmTransitoItemDto
{
    public Guid ItemId { get; set; }
    public Guid ProdutoId { get; set; }
    public int QuantidadeComprada { get; set; }
    public int QuantidadeRecebida { get; set; }
    public int QuantidadePerdida { get; set; }
    public int QuantidadeDevolvidaAntes { get; set; }
    public int QuantidadeDevolvidaDepois { get; set; }
    public int QuantidadeElegivelDevolucaoAntes { get; set; }
    public int QuantidadePendente { get; set; }
}
