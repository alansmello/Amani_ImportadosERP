namespace Amani.ImportadosERP.Application.DTOs.Devolucoes;

public sealed record CompensarCompraItemDevolucaoDto(
    Guid OperacaoId,
    DateTime DataCompensacao,
    string Motivo,
    bool PresencaFisicaConfirmada);
