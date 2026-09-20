using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Domain.Services;
using Amani.ImportadosERP.Infra.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace Amani.ImportadosERP.Infra.Data.Queries;

internal static class CompraPendenciaLogisticaConsulta
{
    public static async Task<IReadOnlyDictionary<Guid, int>> ObterDevolucoesAntesVigentesPorItemAsync(
        AmaniDbContext db,
        IReadOnlyCollection<Guid> itemIds,
        DateTime dataReferencia)
    {
        if (itemIds.Count == 0)
        {
            return new Dictionary<Guid, int>();
        }

        return await db.CompraItemDevolucoes
            .AsNoTracking()
            .Include(d => d.Compensacao)
            .Where(d => itemIds.Contains(d.CompraItemId)
                && d.Momento == CompraItemDevolucaoMomento.AntesDoRecebimento
                && d.DataDevolucao <= dataReferencia
                && (d.Compensacao == null || d.Compensacao.DataCompensacao > dataReferencia))
            .GroupBy(d => d.CompraItemId)
            .Select(g => new
            {
                CompraItemId = g.Key,
                Quantidade = g.Sum(d => d.Quantidade)
            })
            .ToDictionaryAsync(g => g.CompraItemId, g => g.Quantidade);
    }

    public static int CalcularQuantidadePendente(
        CompraItem item,
        DateTime dataReferencia,
        int quantidadeDevolvidaAntesVigente)
    {
        var recebida = item.Recebimentos
            .Where(r => r.DataRecebimento <= dataReferencia)
            .Sum(r => r.Quantidade);
        var perdida = item.Perdas
            .Where(p => p.DataPerda <= dataReferencia)
            .Sum(p => p.Quantidade);

        return CompraPendenciaLogistica.Calcular(
            item.Quantidade,
            recebida,
            perdida,
            quantidadeDevolvidaAntesVigente);
    }
}
