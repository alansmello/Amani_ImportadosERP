namespace Amani.ImportadosERP.Application.DTOs.Devolucoes;

public sealed record CompraItemDevolucaoListDto(
    IReadOnlyCollection<CompraItemDevolucaoDto> Items,
    int QuantidadeVigenteAntesRecebimento,
    int QuantidadeVigenteDepoisRecebimento,
    decimal ValorComercialBrutoVigente);
