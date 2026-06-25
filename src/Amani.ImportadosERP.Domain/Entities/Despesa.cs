using System;
using Amani.ImportadosERP.Domain.Common;
using Amani.ImportadosERP.Domain.Enums;

namespace Amani.ImportadosERP.Domain.Entities;

public sealed class Despesa : BaseEntity
{
    public string Descricao { get; private set; }
    public decimal Valor { get; private set; }
    public DateTime DataCompetencia { get; private set; }
    public Guid CategoriaDespesaId { get; private set; }
    public FormaPagamento FormaPagamento { get; private set; }
    public CategoriaDespesa? CategoriaDespesa { get; private set; }

    public Despesa(
        string descricao,
        decimal valor,
        DateTime dataCompetencia,
        Guid categoriaDespesaId,
        FormaPagamento formaPagamento)
    {
        if (string.IsNullOrWhiteSpace(descricao))
            throw new ArgumentException("Descricao e obrigatoria", nameof(descricao));

        if (valor <= 0)
            throw new ArgumentException("Valor deve ser maior que zero", nameof(valor));

        if (categoriaDespesaId == Guid.Empty)
            throw new ArgumentException("CategoriaDespesaId e obrigatorio", nameof(categoriaDespesaId));

        if (!FormaPagamentoValidaParaDespesa(formaPagamento))
            throw new ArgumentException("Forma de pagamento invalida para despesa", nameof(formaPagamento));

        Descricao = descricao.Trim();
        Valor = valor;
        DataCompetencia = NormalizarDataCompetencia(dataCompetencia);
        CategoriaDespesaId = categoriaDespesaId;
        FormaPagamento = formaPagamento;
    }

    protected Despesa()
    {
        Descricao = string.Empty;
    }

    public void AtualizarDescricao(string descricao)
    {
        if (string.IsNullOrWhiteSpace(descricao))
            throw new ArgumentException("Descricao e obrigatoria", nameof(descricao));

        Descricao = descricao.Trim();
        Touch();
    }

    public static bool FormaPagamentoValidaParaDespesa(FormaPagamento formaPagamento)
    {
        return formaPagamento is FormaPagamento.Dinheiro
            or FormaPagamento.PIX
            or FormaPagamento.CartaoDebito
            or FormaPagamento.CartaoCredito;
    }

    private static DateTime NormalizarDataCompetencia(DateTime dataCompetencia)
    {
        var data = dataCompetencia == default ? DateTime.UtcNow : dataCompetencia;
        return new DateTime(data.Year, data.Month, data.Day, 0, 0, 0, DateTimeKind.Utc);
    }
}
