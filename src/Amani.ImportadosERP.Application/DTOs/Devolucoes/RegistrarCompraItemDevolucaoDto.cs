namespace Amani.ImportadosERP.Application.DTOs.Devolucoes;

public sealed record RegistrarCompraItemDevolucaoDto(
    Guid OperacaoId,
    string Momento,
    Guid? CompraItemRecebimentoId,
    int Quantidade,
    string Motivo,
    DateTime DataDevolucao,
    string? Observacao);
