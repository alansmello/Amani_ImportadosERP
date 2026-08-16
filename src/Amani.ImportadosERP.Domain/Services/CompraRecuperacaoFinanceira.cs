namespace Amani.ImportadosERP.Domain.Services;

public sealed record CompraOcorrenciaFinanceira(
    Guid CompraItemId,
    int QuantidadeComprada,
    int QuantidadeAfetada,
    decimal ValorTotalRateado);

public sealed record CompraResumoRecuperacaoFinanceira(
    decimal ValorBrutoAfetado,
    decimal ValorRecuperadoAssociado,
    decimal PrejuizoLiquidoNaoRecuperado);

public static class CompraRecuperacaoFinanceira
{
    public static decimal CalcularValorBrutoOcorrencia(CompraOcorrenciaFinanceira ocorrencia)
    {
        ArgumentNullException.ThrowIfNull(ocorrencia);
        if (ocorrencia.CompraItemId == Guid.Empty)
            throw new ArgumentException("CompraItemId e obrigatorio.", nameof(ocorrencia));
        if (ocorrencia.QuantidadeComprada <= 0)
            throw new ArgumentException("Quantidade comprada deve ser maior que zero.", nameof(ocorrencia));
        if (ocorrencia.QuantidadeAfetada < 0 || ocorrencia.QuantidadeAfetada > ocorrencia.QuantidadeComprada)
            throw new ArgumentException("Quantidade afetada deve estar entre zero e a quantidade comprada.", nameof(ocorrencia));
        if (ocorrencia.ValorTotalRateado < 0m)
            throw new ArgumentException("Valor rateado nao pode ser negativo.", nameof(ocorrencia));

        return ArredondarMoeda(ocorrencia.ValorTotalRateado * ocorrencia.QuantidadeAfetada / ocorrencia.QuantidadeComprada);
    }

    public static CompraResumoRecuperacaoFinanceira CalcularResumo(
        IEnumerable<CompraOcorrenciaFinanceira> ocorrencias,
        decimal valorRecuperadoAssociado)
    {
        ArgumentNullException.ThrowIfNull(ocorrencias);
        if (valorRecuperadoAssociado < 0m)
            throw new ArgumentException("Valor recuperado nao pode ser negativo.", nameof(valorRecuperadoAssociado));

        var valorBruto = ocorrencias.Sum(CalcularValorBrutoOcorrencia);
        var recuperado = ArredondarMoeda(valorRecuperadoAssociado);
        var prejuizo = ArredondarMoeda(Math.Max(0m, valorBruto - recuperado));

        return new CompraResumoRecuperacaoFinanceira(valorBruto, recuperado, prejuizo);
    }

    private static decimal ArredondarMoeda(decimal valor)
    {
        return decimal.Round(valor, 2, MidpointRounding.AwayFromZero);
    }
}
