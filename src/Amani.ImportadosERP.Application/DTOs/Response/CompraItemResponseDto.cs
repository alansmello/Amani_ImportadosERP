using System;
using System.Collections.Generic;

namespace Amani.ImportadosERP.Application.DTOs.Response;

public sealed class CompraItemResponseDto
{
    public Guid Id { get; set; }
    public Guid ProdutoId { get; set; }
    public int Quantidade { get; set; }
    public int QuantidadeComprada { get; set; }
    public int QuantidadeRecebida { get; set; }
    public int QuantidadePerdida { get; set; }
    public int QuantidadeDevolvidaAntes { get; set; }
    public int QuantidadeDevolvidaDepois { get; set; }
    public int QuantidadeDevolvidaDepoisCompensada { get; set; }
    public string SituacaoLogisticaDevolucao { get; set; } = "SemDevolucao";
    public string DescricaoSituacaoLogisticaDevolucao { get; set; } = "Sem devolucao";
    public int QuantidadeElegivelDevolucaoAntes { get; set; }
    public int QuantidadePendente { get; set; }
    public IReadOnlyCollection<CompraItemRecebimentoElegivelDevolucaoDto> RecebimentosElegiveisDevolucao { get; set; } = new List<CompraItemRecebimentoElegivelDevolucaoDto>();
    public decimal CustoUnitario { get; set; }
    public decimal Desconto { get; set; }
    public decimal Acrescimo { get; set; }
    public decimal ValorTotal { get; set; }
}

public sealed class CompraItemRecebimentoElegivelDevolucaoDto
{
    public Guid RecebimentoId { get; set; }
    public DateTime DataRecebimento { get; set; }
    public int QuantidadeRecebida { get; set; }
    public int QuantidadeDevolvidaDepois { get; set; }
    public int QuantidadeElegivel { get; set; }
    public decimal ValorUnitario { get; set; }
}
