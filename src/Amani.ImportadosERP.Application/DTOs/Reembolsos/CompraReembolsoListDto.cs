namespace Amani.ImportadosERP.Application.DTOs.Reembolsos;

public sealed record CompraReembolsoListDto(
    IReadOnlyCollection<CompraReembolsoDto> Items,
    decimal ValorTotalCompra,
    decimal TotalReembolsadoLiquido,
    decimal SaldoReembolsavel,
    string SituacaoReembolso);
