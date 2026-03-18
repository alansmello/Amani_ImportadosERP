using System;
using System.Collections.Generic;
using System.Linq;
using Amani.ImportadosERP.Domain.Common;

namespace Amani.ImportadosERP.Domain.Entities;

public sealed class Venda : BaseEntity
{
    public Guid ClienteId { get; private set; }
    public DateTime DataVenda { get; private set; }
    public decimal Desconto { get; private set; }
    public decimal Acrescimo { get; private set; }

    private readonly List<VendaItem> _items = new();
    public IReadOnlyCollection<VendaItem> Items => _items.AsReadOnly();

    public Venda(Guid clienteId, DateTime dataVenda, decimal desconto = 0m, decimal acrescimo = 0m)
    {
        if (clienteId == Guid.Empty) throw new ArgumentException("ClienteId é obrigatório", nameof(clienteId));
        ClienteId = clienteId;
        DataVenda = dataVenda == default ? DateTime.UtcNow : dataVenda;
        if (desconto < 0) throw new ArgumentException("Desconto não pode ser negativo", nameof(desconto));
        if (acrescimo < 0) throw new ArgumentException("Acrescimo não pode ser negativo", nameof(acrescimo));
        Desconto = desconto;
        Acrescimo = acrescimo;
    }

    protected Venda() { }

    public void AdicionarItem(VendaItem item)
    {
        if (item == null) throw new ArgumentNullException(nameof(item));
        _items.Add(item);
        Touch();
    }

    public void AdicionarItem(Guid produtoId, int quantidade, decimal precoUnitario, decimal desconto = 0m, decimal acrescimo = 0m)
    {
        var existente = _items.FirstOrDefault(i => i.ProdutoId == produtoId);
        if (existente != null) throw new InvalidOperationException("Produto já adicionado na venda");

        var item = new VendaItem(produtoId, quantidade, precoUnitario, desconto, acrescimo);
        _items.Add(item);
        Touch();
    }

    public decimal Total() => _items.Sum(i => i.ValorTotal()) - Desconto + Acrescimo;
}
