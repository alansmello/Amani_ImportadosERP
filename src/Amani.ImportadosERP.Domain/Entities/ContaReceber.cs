using System;
using System.Collections.Generic;
using Amani.ImportadosERP.Domain.Common;

namespace Amani.ImportadosERP.Domain.Entities;

public sealed class ContaReceber : BaseEntity
{
    public Guid VendaId { get; private set; }
    public decimal Valor { get; private set; }
    public DateTime DataVencimento { get; private set; }
    public ICollection<PagamentoRecebido> Pagamentos { get; private set; }

    protected ContaReceber()
    {
        Pagamentos = new List<PagamentoRecebido>();
    }

    public ContaReceber(Guid vendaId, decimal valor, DateTime dataVencimento)
    {
        if (vendaId == Guid.Empty) throw new ArgumentException("VendaId é obrigatório", nameof(vendaId));
        if (valor <= 0) throw new ArgumentException("Valor inválido", nameof(valor));
        if (dataVencimento == default) throw new ArgumentException("DataVencimento é obrigatória", nameof(dataVencimento));

        VendaId = vendaId;
        Valor = valor;
        DataVencimento = dataVencimento;
        Pagamentos = new List<PagamentoRecebido>();
    }

    public void Atualizar(decimal valor, DateTime dataVencimento)
    {
        if (valor <= 0) throw new Exception("Valor inválido");
        if (dataVencimento == default) throw new Exception("Data de vencimento inválida");

        Valor = valor;
        DataVencimento = dataVencimento;
        Touch();
    }
}
