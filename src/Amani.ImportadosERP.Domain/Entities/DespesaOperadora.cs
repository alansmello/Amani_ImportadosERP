using System;
using Amani.ImportadosERP.Domain.Common;
using Amani.ImportadosERP.Domain.Enums;

namespace Amani.ImportadosERP.Domain.Entities;

public sealed class DespesaOperadora : BaseEntity
{
    public Guid VendaId { get; private set; }
    public FormaPagamento FormaPagamento { get; private set; }
    public decimal ValorBruto { get; private set; }
    public decimal ValorLiquido { get; private set; }
    public decimal PercentualTaxa { get; private set; }
    public DateTime DataRegistro { get; private set; }

    public Venda? Venda { get; private set; }

    public decimal ValorTaxa => ValorBruto - ValorLiquido;

    protected DespesaOperadora() { }

    public DespesaOperadora(
        Guid vendaId,
        FormaPagamento formaPagamento,
        decimal valorBruto,
        decimal valorLiquido,
        decimal percentualTaxa)
    {
        if (vendaId == Guid.Empty) throw new ArgumentException("VendaId e obrigatorio", nameof(vendaId));
        if (formaPagamento is not FormaPagamento.CartaoDebito and not FormaPagamento.CartaoCredito)
        {
            throw new ArgumentException("Despesa de operadora so pode ser registrada para cartao", nameof(formaPagamento));
        }
        if (valorBruto <= 0) throw new ArgumentException("Valor bruto deve ser maior que zero", nameof(valorBruto));
        if (valorLiquido <= 0) throw new ArgumentException("Valor liquido deve ser maior que zero", nameof(valorLiquido));
        if (valorLiquido > valorBruto) throw new ArgumentException("Valor liquido nao pode exceder o valor bruto", nameof(valorLiquido));
        if (percentualTaxa < 0) throw new ArgumentException("Percentual de taxa nao pode ser negativo", nameof(percentualTaxa));

        VendaId = vendaId;
        FormaPagamento = formaPagamento;
        ValorBruto = valorBruto;
        ValorLiquido = valorLiquido;
        PercentualTaxa = percentualTaxa;
        DataRegistro = DateTime.UtcNow;
    }
}
