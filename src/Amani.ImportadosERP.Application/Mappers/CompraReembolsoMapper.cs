using Amani.ImportadosERP.Application.DTOs.Reembolsos;
using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Domain.Services;

namespace Amani.ImportadosERP.Application.Mappers;

public static class CompraReembolsoMapper
{
    public static CompraReembolsoDto ToDto(CompraReembolso reembolso)
    {
        ArgumentNullException.ThrowIfNull(reembolso);

        return new CompraReembolsoDto(
            reembolso.Id,
            reembolso.CompraId,
            reembolso.Valor,
            reembolso.ValorAlocado,
            reembolso.ValorNaoAlocado,
            reembolso.DataReembolso,
            reembolso.ReferenciaExterna,
            reembolso.Cancelamento != null,
            reembolso.CreatedAt,
            reembolso.Alocacoes.Select(ToDto).ToArray());
    }

    public static CompraReembolsoAlocacaoDto ToDto(CompraReembolsoAlocacao alocacao)
    {
        ArgumentNullException.ThrowIfNull(alocacao);

        return new CompraReembolsoAlocacaoDto(
            alocacao.Id,
            alocacao.CompraReembolsoId,
            alocacao.CompraItemId,
            alocacao.CompraItemPerdaId,
            alocacao.CompraItemDevolucaoId,
            alocacao.Valor,
            alocacao.CreatedAt);
    }

    public static CompraReembolsoListDto ToListDto(
        IEnumerable<CompraReembolso> reembolsos,
        CompraResumoReembolso resumo)
    {
        ArgumentNullException.ThrowIfNull(reembolsos);
        ArgumentNullException.ThrowIfNull(resumo);

        return new CompraReembolsoListDto(
            reembolsos.Select(ToDto).ToArray(),
            resumo.TotalOriginal,
            resumo.TotalReembolsado,
            resumo.SaldoReembolsavel,
            resumo.Situacao.ToString());
    }
}
