using System;
using System.Collections.Generic;

namespace Amani.ImportadosERP.Application.DTOs.Response;

public sealed class VendaItemResponseDto
{
    public Guid Id { get; set; }
    public Guid ProdutoId { get; set; }
    public Guid? ProdutoApresentacaoId { get; set; }
    public string? ApresentacaoNome { get; set; }
    public long? FatorNumeradorAplicado { get; set; }
    public long? FatorDenominadorAplicado { get; set; }
    public decimal? FatorConversaoAplicado { get; set; }
    public decimal? QuantidadeConvertidaEstoque { get; set; }
    public int Quantidade { get; set; }
    public decimal PrecoUnitario { get; set; }
    public decimal Desconto { get; set; }
    public decimal Acrescimo { get; set; }
    public decimal ValorTotal { get; set; }
}
