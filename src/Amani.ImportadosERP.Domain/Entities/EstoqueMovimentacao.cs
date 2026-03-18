using System;
using Amani.ImportadosERP.Domain.Common;

namespace Amani.ImportadosERP.Domain.Entities;

public enum TipoMovimentacao
{
    Entrada,
    Saida
}

public sealed class EstoqueMovimentacao : BaseEntity
{
    public Guid ProdutoId { get; private set; }
    public int Quantidade { get; private set; }
    public TipoMovimentacao Tipo { get; private set; }
    public Guid? CompraId { get; private set; }
    public Guid? VendaId { get; private set; }
    public DateTime Data { get; private set; }
    public decimal? ValorUnitario { get; private set; }

    public EstoqueMovimentacao(Guid produtoId, int quantidade, TipoMovimentacao tipo, Guid? compraId = null, Guid? vendaId = null, decimal? valorUnitario = null)
    {
        if (produtoId == Guid.Empty) throw new ArgumentException("ProdutoId é obrigatório", nameof(produtoId));
        if (quantidade == 0) throw new ArgumentException("Quantidade não pode ser zero", nameof(quantidade));
        if (tipo == TipoMovimentacao.Entrada && vendaId != null) throw new ArgumentException("Movimentação de entrada não pode referenciar VendaId");
        if (tipo == TipoMovimentacao.Saida && compraId != null) throw new ArgumentException("Movimentação de saída não pode referenciar CompraId");

        ProdutoId = produtoId;
        Quantidade = quantidade;
        Tipo = tipo;
        CompraId = compraId;
        VendaId = vendaId;
        Data = DateTime.UtcNow;
        if (valorUnitario != null && valorUnitario < 0) throw new ArgumentException("ValorUnitario não pode ser negativo", nameof(valorUnitario));
        ValorUnitario = valorUnitario;
    }

    protected EstoqueMovimentacao() { }
}
