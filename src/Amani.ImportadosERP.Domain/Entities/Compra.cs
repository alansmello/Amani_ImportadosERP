using System;
using System.Collections.Generic;
using System.Linq;
using Amani.ImportadosERP.Domain.Common;

namespace Amani.ImportadosERP.Domain.Entities;

public sealed class Compra : BaseEntity
{
    public Guid FornecedorId { get; private set; }
    public DateTime DataCompra { get; private set; }
    public decimal Desconto { get; private set; }
    public decimal Acrescimo { get; private set; }

    private readonly List<CompraItem> _items = new();
    public IReadOnlyCollection<CompraItem> Items => _items.AsReadOnly();

    public Compra(Guid fornecedorId, DateTime dataCompra, decimal desconto = 0m, decimal acrescimo = 0m)
    {
        if (fornecedorId == Guid.Empty)
            throw new ArgumentException("FornecedorId é obrigatório", nameof(fornecedorId));
        if (desconto < 0) throw new ArgumentException("Desconto não pode ser negativo", nameof(desconto));
        if (acrescimo < 0) throw new ArgumentException("Acrescimo não pode ser negativo", nameof(acrescimo));

        FornecedorId = fornecedorId;
        DataCompra = dataCompra == default ? DateTime.UtcNow : dataCompra;
        Desconto = desconto;
        Acrescimo = acrescimo;
    }

    protected Compra() { }

    public void AdicionarItem(Guid produtoId, int quantidade, decimal custoUnitario, decimal desconto = 0m, decimal acrescimo = 0m)
    {
        var existente = _items.FirstOrDefault(i => i.ProdutoId == produtoId);

        if (existente != null)
        {
            throw new InvalidOperationException("Produto já adicionado na compra");
        }

        var item = new CompraItem(produtoId, quantidade, custoUnitario, desconto, acrescimo);
        item.SetCompra(Id);

        _items.Add(item);
    }

    public decimal Total() => _items.Sum(i => i.ValorTotal());
}
