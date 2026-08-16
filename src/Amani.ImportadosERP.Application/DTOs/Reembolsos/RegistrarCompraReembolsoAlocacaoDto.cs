namespace Amani.ImportadosERP.Application.DTOs.Reembolsos;

public sealed record RegistrarCompraReembolsoAlocacaoDto(
    Guid CompraItemId,
    Guid? CompraItemPerdaId,
    Guid? CompraItemDevolucaoId,
    decimal Valor);
