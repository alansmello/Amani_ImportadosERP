using System;
using Amani.ImportadosERP.Domain.Common;

namespace Amani.ImportadosERP.Domain.Entities;

public sealed class PagamentoRecebido : BaseEntity
{
    public Guid ContaReceberId { get; private set; }
    public decimal Valor { get; private set; }
    public DateTime DataPagamento { get; private set; }

    protected PagamentoRecebido() { }

    public PagamentoRecebido(Guid contaReceberId, decimal valor)
    {
        if (contaReceberId == Guid.Empty) throw new ArgumentException("ContaReceberId é obrigatório", nameof(contaReceberId));
        if (valor <= 0) throw new ArgumentException("Valor inválido", nameof(valor));

        ContaReceberId = contaReceberId;
        Valor = valor;
        DataPagamento = DateTime.UtcNow;
    }
}
