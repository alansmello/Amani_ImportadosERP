using System;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class ProdutoPendenteRecebimentoDto
{
    public Guid CompraId { get; set; }
    public Guid ItemId { get; set; }
    public Guid ProdutoId { get; set; }
    public Guid FornecedorId { get; set; }
    public DateTime DataCompra { get; set; }
    public string StatusCompra { get; set; } = string.Empty;
    public int QuantidadeComprada { get; set; }
    public int QuantidadeRecebida { get; set; }
    public int QuantidadePerdida { get; set; }
    public int QuantidadeDevolvidaAntes { get; set; }
    public int QuantidadeDevolvidaDepois { get; set; }
    public int QuantidadeElegivelDevolucaoAntes { get; set; }
    public int QuantidadePendente { get; set; }
}
