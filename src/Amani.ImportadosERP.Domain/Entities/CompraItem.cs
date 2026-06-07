using System;
using System.Collections.Generic;
using System.Linq;
using Amani.ImportadosERP.Domain.Common;

namespace Amani.ImportadosERP.Domain.Entities;

public sealed class CompraItem : BaseEntity
{
    public Guid ProdutoId { get; private set; }
    public Guid CompraId { get; private set; }

    public int Quantidade { get; private set; }
    public decimal CustoUnitario { get; private set; }
    public decimal Desconto { get; private set; }
    public decimal Acrescimo { get; private set; }

    public Compra Compra { get; private set; }

    private readonly List<CompraItemRecebimento> _recebimentos = new();
    public IReadOnlyCollection<CompraItemRecebimento> Recebimentos => _recebimentos.AsReadOnly();

    private readonly List<CompraItemPerda> _perdas = new();
    public IReadOnlyCollection<CompraItemPerda> Perdas => _perdas.AsReadOnly();

    public int QuantidadeRecebida => _recebimentos.Sum(r => r.Quantidade);
    public int QuantidadePerdida => _perdas.Sum(p => p.Quantidade);
    public int QuantidadePendente => Quantidade - QuantidadeRecebida - QuantidadePerdida;

    public CompraItem(Guid produtoId, int quantidade, decimal custoUnitario, decimal desconto = 0m, decimal acrescimo = 0m)
    {
        if (produtoId == Guid.Empty) throw new ArgumentException("ProdutoId é obrigatório", nameof(produtoId));
        if (quantidade <= 0) throw new ArgumentException("Quantidade deve ser maior que zero", nameof(quantidade));
        if (custoUnitario < 0) throw new ArgumentException("CustoUnitario não pode ser negativo", nameof(custoUnitario));
        if (desconto < 0) throw new ArgumentException("Desconto não pode ser negativo", nameof(desconto));
        if (acrescimo < 0) throw new ArgumentException("Acrescimo não pode ser negativo", nameof(acrescimo));

        ProdutoId = produtoId;
        Quantidade = quantidade;
        CustoUnitario = custoUnitario;
        Desconto = desconto;
        Acrescimo = acrescimo;
    }

    internal void SetCompra(Guid compraId)
    {
        CompraId = compraId;
    }

    public decimal ValorTotal()
    {
        var valorBase = Quantidade * CustoUnitario;
        return valorBase - Desconto + Acrescimo;
    }

    protected CompraItem() { }
}
