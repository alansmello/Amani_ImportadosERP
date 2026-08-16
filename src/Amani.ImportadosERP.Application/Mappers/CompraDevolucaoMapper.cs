using Amani.ImportadosERP.Application.DTOs.Devolucoes;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Mappers;

public static class CompraDevolucaoMapper
{
    public static CompraItemDevolucaoDto ToDto(
        CompraItemDevolucao devolucao,
        decimal valorComercialBruto = 0m,
        decimal valorCustoEstoque = 0m)
    {
        ArgumentNullException.ThrowIfNull(devolucao);
        var compensada = devolucao.Compensacao != null;
        var quantidadeCompensada = compensada ? devolucao.Quantidade : 0;

        return new CompraItemDevolucaoDto(
            devolucao.Id,
            devolucao.CompraId,
            devolucao.CompraItemId,
            devolucao.CompraItemRecebimentoId,
            devolucao.EstoqueMovimentacaoId,
            devolucao.Momento.ToString(),
            devolucao.Quantidade,
            quantidadeCompensada,
            devolucao.Quantidade - quantidadeCompensada,
            devolucao.Motivo.ToString(),
            devolucao.DataDevolucao,
            devolucao.Observacao,
            valorComercialBruto,
            valorCustoEstoque,
            compensada,
            devolucao.CreatedAt);
    }

    public static CompraItemDevolucaoListDto ToListDto(
        IEnumerable<CompraItemDevolucao> devolucoes,
        int quantidadeVigenteAntesRecebimento,
        int quantidadeVigenteDepoisRecebimento,
        decimal valorComercialBrutoVigente)
    {
        ArgumentNullException.ThrowIfNull(devolucoes);
        return new CompraItemDevolucaoListDto(
            devolucoes.Select(d => ToDto(d)).ToArray(),
            quantidadeVigenteAntesRecebimento,
            quantidadeVigenteDepoisRecebimento,
            valorComercialBrutoVigente);
    }
}
