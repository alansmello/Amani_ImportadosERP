using System;
using Amani.ImportadosERP.Domain.Common;

namespace Amani.ImportadosERP.Domain.Entities;

public enum TipoMovimentacao
{
    Entrada,
    Saida,
    InventarioInicial
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

    public EstoqueMovimentacao(
        Guid produtoId,
        int quantidade,
        TipoMovimentacao tipo,
        Guid? compraId = null,
        Guid? vendaId = null,
        decimal? valorUnitario = null,
        DateTime? data = null)
    {
        if (produtoId == Guid.Empty) throw new ArgumentException("ProdutoId e obrigatorio", nameof(produtoId));
        if (quantidade == 0) throw new ArgumentException("Quantidade nao pode ser zero", nameof(quantidade));
        if (tipo == TipoMovimentacao.Entrada && vendaId != null) throw new ArgumentException("Movimentacao de entrada nao pode referenciar VendaId");
        if (tipo == TipoMovimentacao.Saida && compraId != null) throw new ArgumentException("Movimentacao de saida nao pode referenciar CompraId");
        if (tipo == TipoMovimentacao.InventarioInicial && compraId != null) throw new ArgumentException("Inventario inicial nao pode referenciar CompraId");
        if (tipo == TipoMovimentacao.InventarioInicial && vendaId != null) throw new ArgumentException("Inventario inicial nao pode referenciar VendaId");
        if (tipo == TipoMovimentacao.InventarioInicial && quantidade <= 0) throw new ArgumentException("Quantidade do inventario inicial deve ser maior que zero", nameof(quantidade));
        if (valorUnitario != null && valorUnitario < 0) throw new ArgumentException("ValorUnitario nao pode ser negativo", nameof(valorUnitario));

        ProdutoId = produtoId;
        Quantidade = quantidade;
        Tipo = tipo;
        CompraId = compraId;
        VendaId = vendaId;
        Data = NormalizeData(data);
        ValorUnitario = valorUnitario;
    }

    protected EstoqueMovimentacao() { }

    private static DateTime NormalizeData(DateTime? data)
    {
        if (data == null || data == default)
        {
            return DateTime.UtcNow;
        }

        return DateTime.SpecifyKind(data.Value.Date, DateTimeKind.Utc);
    }
}
