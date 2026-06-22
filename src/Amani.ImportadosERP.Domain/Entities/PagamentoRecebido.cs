using System;
using Amani.ImportadosERP.Domain.Common;

namespace Amani.ImportadosERP.Domain.Entities;

public sealed class PagamentoRecebido : BaseEntity
{
    public Guid ContaReceberId { get; private set; }
    public decimal Valor { get; private set; }
    public decimal Desconto { get; private set; }
    public decimal ValorBrutoLiquidado { get; private set; }
    public DateTime DataPagamento { get; private set; }

    protected PagamentoRecebido() { }

    public PagamentoRecebido(Guid contaReceberId, decimal valor, decimal desconto = 0m, decimal? valorBrutoLiquidado = null)
    {
        if (contaReceberId == Guid.Empty) throw new ArgumentException("ContaReceberId é obrigatório", nameof(contaReceberId));
        if (valor <= 0) throw new ArgumentException("Valor inválido", nameof(valor));

        if (desconto < 0) throw new ArgumentException("Desconto nao pode ser negativo", nameof(desconto));

        var brutoLiquidado = valorBrutoLiquidado ?? valor + desconto;
        if (brutoLiquidado < valor)
        {
            throw new ArgumentException("Valor bruto liquidado nao pode ser menor que o valor recebido", nameof(valorBrutoLiquidado));
        }

        ContaReceberId = contaReceberId;
        Valor = valor;
        Desconto = desconto;
        ValorBrutoLiquidado = brutoLiquidado;
        DataPagamento = DateTime.UtcNow;
    }
}
