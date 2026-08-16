namespace Amani.ImportadosERP.Application.DTOs.Reembolsos;

public sealed record CompraReembolsoDto(
    Guid Id,
    Guid CompraId,
    decimal Valor,
    decimal ValorAlocado,
    decimal ValorNaoAlocado,
    DateTime DataReembolso,
    string? ReferenciaExterna,
    bool Cancelado,
    DateTime CriadoEm,
    IReadOnlyCollection<CompraReembolsoAlocacaoDto> Alocacoes);
