using System;
using System.Collections.Generic;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class EstoqueProdutoMovimentacoesDto
{
    public Guid ProdutoId { get; set; }
    public string NomeProduto { get; set; } = string.Empty;
    public int SaldoAtual { get; set; }
    public int TotalMovimentacoes { get; set; }
    public IReadOnlyCollection<EstoqueMovimentacaoItemDto> Movimentacoes { get; set; } = new List<EstoqueMovimentacaoItemDto>();
}
