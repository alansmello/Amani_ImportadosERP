namespace Amani.ImportadosERP.Application.DTOs.Reembolsos;

public sealed record CancelarCompraReembolsoDto(
    Guid OperacaoId,
    DateTime DataCancelamento,
    string Motivo);
