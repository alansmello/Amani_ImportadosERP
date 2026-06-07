using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Mappers;

public static class CompraRecebimentoMapper
{
    public static RecebimentoCompraItemDto ToDto(CompraItemRecebimento recebimento)
    {
        return new RecebimentoCompraItemDto
        {
            Id = recebimento.Id,
            CompraId = recebimento.CompraId,
            ItemId = recebimento.CompraItemId,
            ProdutoId = recebimento.ProdutoId,
            Quantidade = recebimento.Quantidade,
            ValorUnitario = recebimento.ValorUnitario,
            Origem = recebimento.Origem.ToString(),
            DataRecebimento = recebimento.DataRecebimento,
            EstoqueMovimentacaoId = recebimento.EstoqueMovimentacaoId,
            Observacao = recebimento.Observacao
        };
    }
}
