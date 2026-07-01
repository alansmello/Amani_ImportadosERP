using System;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class VendaItemApresentacaoDto
{
    public Guid? ProdutoApresentacaoId { get; set; }
    public string? ApresentacaoNome { get; set; }
    public long? FatorNumeradorAplicado { get; set; }
    public long? FatorDenominadorAplicado { get; set; }
    public decimal? FatorConversaoAplicado { get; set; }
    public decimal? QuantidadeConvertidaEstoque { get; set; }
}
