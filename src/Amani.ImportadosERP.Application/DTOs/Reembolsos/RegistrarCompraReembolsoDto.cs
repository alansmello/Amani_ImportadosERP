namespace Amani.ImportadosERP.Application.DTOs.Reembolsos;

public sealed record RegistrarCompraReembolsoDto(
    Guid OperacaoId,
    decimal Valor,
    DateTime DataReembolso,
    string? ReferenciaExterna,
    string? Observacao,
    IReadOnlyCollection<RegistrarCompraReembolsoAlocacaoDto>? Alocacoes);
