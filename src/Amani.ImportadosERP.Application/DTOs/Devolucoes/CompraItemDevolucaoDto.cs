namespace Amani.ImportadosERP.Application.DTOs.Devolucoes;

public sealed record CompraItemDevolucaoDto(
    Guid Id,
    Guid CompraId,
    Guid CompraItemId,
    Guid? CompraItemRecebimentoId,
    Guid? EstoqueMovimentacaoId,
    string Momento,
    int Quantidade,
    int QuantidadeCompensada,
    int QuantidadeVigente,
    string Motivo,
    DateTime DataDevolucao,
    string? Observacao,
    decimal ValorComercialBruto,
    decimal ValorCustoEstoque,
    bool Compensada,
    DateTime CriadoEm);
