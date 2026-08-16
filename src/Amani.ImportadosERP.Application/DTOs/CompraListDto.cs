using System;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class CompraListDto
{
    public Guid Id { get; set; }
    public Guid FornecedorId { get; set; }
    public DateTime DataCompra { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal TotalCompra { get; set; }
    public decimal TotalReembolsadoLiquido { get; set; }
    public decimal CustoFinanceiroLiquido { get; set; }
    public string SituacaoReembolso { get; set; } = "SemReembolso";
    public bool PossuiDevolucao { get; set; }
    public int QuantidadeDevolvidaAntes { get; set; }
    public int QuantidadeDevolvidaDepois { get; set; }
    public int QuantidadeDevolvidaDepoisCompensada { get; set; }
    public string SituacaoLogisticaDevolucao { get; set; } = "SemDevolucao";
    public string DescricaoSituacaoLogisticaDevolucao { get; set; } = "Sem devolucao";
}
