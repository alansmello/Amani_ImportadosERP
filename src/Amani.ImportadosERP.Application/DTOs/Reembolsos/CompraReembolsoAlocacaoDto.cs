namespace Amani.ImportadosERP.Application.DTOs.Reembolsos;

public sealed record CompraReembolsoAlocacaoDto(
    Guid Id,
    Guid CompraReembolsoId,
    Guid CompraItemId,
    Guid? CompraItemPerdaId,
    Guid? CompraItemDevolucaoId,
    decimal Valor,
    DateTime CriadoEm);
