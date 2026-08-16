using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Domain.Services;

public sealed record CompraItemCalculoFinanceiro(
    Guid ItemId,
    int QuantidadeComprada,
    int QuantidadePendente,
    decimal CustoUnitario,
    decimal Desconto,
    decimal Acrescimo)
{
    public decimal ValorBruto => QuantidadeComprada * CustoUnitario;
    public decimal ValorLiquido => ValorBruto - Desconto + Acrescimo;

    public static CompraItemCalculoFinanceiro FromEntity(CompraItem item)
    {
        ArgumentNullException.ThrowIfNull(item);

        return new CompraItemCalculoFinanceiro(
            item.Id,
            item.Quantidade,
            item.QuantidadePendente,
            item.CustoUnitario,
            item.Desconto,
            item.Acrescimo);
    }
}

public sealed record CompraItemRateioFinanceiro(
    Guid ItemId,
    decimal Peso,
    decimal DescontoGeralRateado,
    decimal AcrescimoGeralRateado,
    decimal ValorTotalRateado,
    decimal ValorPendenteCusto);

public sealed record CompraCalculoFinanceiroResultado(
    decimal TotalItensLiquidos,
    decimal TotalCompra,
    decimal? ValorPendenteCusto,
    string? MotivoValorPendenteIndisponivel,
    IReadOnlyCollection<CompraItemRateioFinanceiro> Rateios)
{
    public bool ValorPendenteDisponivel => ValorPendenteCusto.HasValue;
}

public enum CompraSituacaoReembolso
{
    SemReembolso,
    Parcial,
    Integral
}

public sealed record CompraResumoReembolso(
    decimal TotalOriginal,
    decimal TotalReembolsado,
    decimal SaldoReembolsavel,
    decimal CustoFinanceiroLiquido,
    CompraSituacaoReembolso Situacao);

public static class CompraCalculoFinanceiro
{
    public const string MotivoBaseRateioInvalida =
        "O valor pendente ao custo nao pode ser calculado porque a base liquida dos itens nao permite o rateio dos ajustes gerais.";

    public static decimal CalcularTotal(
        IEnumerable<CompraItemCalculoFinanceiro> itens,
        decimal descontoGeral,
        decimal acrescimoGeral)
    {
        ValidarAjustesGerais(descontoGeral, acrescimoGeral);
        var itensMaterializados = MaterializarEValidar(itens);

        return itensMaterializados.Sum(item => item.ValorLiquido)
            - descontoGeral
            + acrescimoGeral;
    }

    public static CompraCalculoFinanceiroResultado Calcular(
        IEnumerable<CompraItemCalculoFinanceiro> itens,
        decimal descontoGeral,
        decimal acrescimoGeral)
    {
        ValidarAjustesGerais(descontoGeral, acrescimoGeral);
        var itensOrdenados = MaterializarEValidar(itens)
            .OrderBy(item => item.ItemId)
            .ToArray();

        var totalItensLiquidos = itensOrdenados.Sum(item => item.ValorLiquido);
        var totalCompra = totalItensLiquidos - descontoGeral + acrescimoGeral;

        if (itensOrdenados.Length == 0)
        {
            return new CompraCalculoFinanceiroResultado(
                totalItensLiquidos,
                totalCompra,
                0m,
                null,
                Array.Empty<CompraItemRateioFinanceiro>());
        }

        if (totalItensLiquidos <= 0m && (descontoGeral != 0m || acrescimoGeral != 0m))
        {
            return new CompraCalculoFinanceiroResultado(
                totalItensLiquidos,
                totalCompra,
                null,
                MotivoBaseRateioInvalida,
                Array.Empty<CompraItemRateioFinanceiro>());
        }

        var descontosRateados = RatearAjuste(itensOrdenados, totalItensLiquidos, descontoGeral);
        var acrescimosRateados = RatearAjuste(itensOrdenados, totalItensLiquidos, acrescimoGeral);
        var rateios = new List<CompraItemRateioFinanceiro>(itensOrdenados.Length);

        for (var indice = 0; indice < itensOrdenados.Length; indice++)
        {
            var item = itensOrdenados[indice];
            var peso = totalItensLiquidos == 0m ? 0m : item.ValorLiquido / totalItensLiquidos;
            var valorTotalRateado = item.ValorLiquido
                - descontosRateados[indice]
                + acrescimosRateados[indice];
            var valorPendente = ArredondarMoeda(
                valorTotalRateado * item.QuantidadePendente / item.QuantidadeComprada);

            rateios.Add(new CompraItemRateioFinanceiro(
                item.ItemId,
                peso,
                descontosRateados[indice],
                acrescimosRateados[indice],
                valorTotalRateado,
                valorPendente));
        }

        return new CompraCalculoFinanceiroResultado(
            totalItensLiquidos,
            totalCompra,
            rateios.Sum(rateio => rateio.ValorPendenteCusto),
            null,
            rateios.AsReadOnly());
    }

    public static CompraResumoReembolso CalcularResumoReembolso(
        decimal totalOriginal,
        decimal totalCreditos,
        decimal totalCancelamentos)
    {
        if (totalOriginal < 0m)
            throw new ArgumentException("Total original nao pode ser negativo.", nameof(totalOriginal));
        if (totalCreditos < 0m)
            throw new ArgumentException("Total de creditos nao pode ser negativo.", nameof(totalCreditos));
        if (totalCancelamentos < 0m)
            throw new ArgumentException("Total de cancelamentos nao pode ser negativo.", nameof(totalCancelamentos));

        var totalReembolsado = ArredondarMoeda(Math.Max(0m, totalCreditos - totalCancelamentos));
        if (totalReembolsado > totalOriginal)
        {
            totalReembolsado = totalOriginal;
        }

        var saldo = ArredondarMoeda(Math.Max(0m, totalOriginal - totalReembolsado));
        var situacao = totalReembolsado <= 0m
            ? CompraSituacaoReembolso.SemReembolso
            : saldo <= 0m ? CompraSituacaoReembolso.Integral : CompraSituacaoReembolso.Parcial;

        return new CompraResumoReembolso(
            ArredondarMoeda(totalOriginal),
            totalReembolsado,
            saldo,
            saldo,
            situacao);
    }

    private static decimal[] RatearAjuste(
        IReadOnlyList<CompraItemCalculoFinanceiro> itens,
        decimal totalItensLiquidos,
        decimal ajuste)
    {
        var parcelas = new decimal[itens.Count];
        if (ajuste == 0m || itens.Count == 0)
        {
            return parcelas;
        }

        decimal acumulado = 0m;
        for (var indice = 0; indice < itens.Count - 1; indice++)
        {
            parcelas[indice] = ArredondarMoeda(ajuste * itens[indice].ValorLiquido / totalItensLiquidos);
            acumulado += parcelas[indice];
        }

        parcelas[^1] = ajuste - acumulado;
        return parcelas;
    }

    private static CompraItemCalculoFinanceiro[] MaterializarEValidar(
        IEnumerable<CompraItemCalculoFinanceiro> itens)
    {
        ArgumentNullException.ThrowIfNull(itens);
        var materializados = itens.ToArray();

        if (materializados.Select(item => item.ItemId).Distinct().Count() != materializados.Length)
        {
            throw new ArgumentException("Os itens da compra devem possuir identificadores unicos.", nameof(itens));
        }

        foreach (var item in materializados)
        {
            if (item.ItemId == Guid.Empty)
                throw new ArgumentException("ItemId e obrigatorio.", nameof(itens));
            if (item.QuantidadeComprada <= 0)
                throw new ArgumentException("Quantidade comprada deve ser maior que zero.", nameof(itens));
            if (item.QuantidadePendente < 0 || item.QuantidadePendente > item.QuantidadeComprada)
                throw new ArgumentException("Quantidade pendente deve estar entre zero e a quantidade comprada.", nameof(itens));
            if (item.CustoUnitario < 0m || item.Desconto < 0m || item.Acrescimo < 0m)
                throw new ArgumentException("Valores comerciais do item nao podem ser negativos.", nameof(itens));
        }

        return materializados;
    }

    private static void ValidarAjustesGerais(decimal descontoGeral, decimal acrescimoGeral)
    {
        if (descontoGeral < 0m)
            throw new ArgumentException("Desconto geral nao pode ser negativo.", nameof(descontoGeral));
        if (acrescimoGeral < 0m)
            throw new ArgumentException("Acrescimo geral nao pode ser negativo.", nameof(acrescimoGeral));
    }

    private static decimal ArredondarMoeda(decimal valor)
    {
        return decimal.Round(valor, 2, MidpointRounding.AwayFromZero);
    }
}
