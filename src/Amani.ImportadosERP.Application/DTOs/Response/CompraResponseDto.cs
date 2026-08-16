using System;
using System.Collections.Generic;

namespace Amani.ImportadosERP.Application.DTOs.Response;

public sealed class CompraResponseDto
{
    public Guid Id { get; set; }
    public Guid FornecedorId { get; set; }
    public DateTime DataCompra { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal Desconto { get; set; }
    public decimal Acrescimo { get; set; }
    public decimal Total { get; set; }
    public decimal TotalReembolsadoLiquido { get; set; }
    public decimal SaldoReembolsavel { get; set; }
    public decimal CustoFinanceiroLiquido { get; set; }
    public string SituacaoReembolso { get; set; } = "SemReembolso";
    public bool PossuiDevolucao { get; set; }
    public int QuantidadeDevolvidaAntes { get; set; }
    public int QuantidadeDevolvidaDepois { get; set; }
    public int QuantidadeDevolvidaDepoisCompensada { get; set; }
    public string SituacaoLogisticaDevolucao { get; set; } = "SemDevolucao";
    public string DescricaoSituacaoLogisticaDevolucao { get; set; } = "Sem devolucao";
    public IReadOnlyCollection<CompraItemResponseDto> Items { get; set; } = new List<CompraItemResponseDto>();
}
