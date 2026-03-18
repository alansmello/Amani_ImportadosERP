using System;
using Amani.ImportadosERP.Domain.Common;

namespace Amani.ImportadosERP.Domain.Entities;

public sealed class VendaItem : BaseEntity
{
    public Guid ProdutoId { get; private set; }
    public int Quantidade { get; private set; }
    public decimal PrecoUnitario { get; private set; }
    public decimal Desconto { get; private set; }
    public decimal Acrescimo { get; private set; }
    public Guid VendaId { get; private set; }
    public Venda? Venda { get; private set; }

    public VendaItem(Guid produtoId, int quantidade, decimal precoUnitario, decimal desconto = 0m, decimal acrescimo = 0m)
    {
        if (produtoId == Guid.Empty) throw new ArgumentException("ProdutoId é obrigatório", nameof(produtoId));
        if (quantidade <= 0) throw new ArgumentException("Quantidade deve ser maior que zero", nameof(quantidade));
        if (precoUnitario < 0) throw new ArgumentException("PrecoUnitario não pode ser negativo", nameof(precoUnitario));
        if (desconto < 0) throw new ArgumentException("Desconto não pode ser negativo", nameof(desconto));
        if (acrescimo < 0) throw new ArgumentException("Acrescimo não pode ser negativo", nameof(acrescimo));

        ProdutoId = produtoId;
        Quantidade = quantidade;
        PrecoUnitario = precoUnitario;
        Desconto = desconto;
        Acrescimo = acrescimo;
    }

    protected VendaItem() { }

    public decimal ValorTotal()
    {
        var valorBase = Quantidade * PrecoUnitario;
        return valorBase - Desconto + Acrescimo;
    }

    internal void SetVenda(Guid vendaId)
    {
        VendaId = vendaId;
    }
}
