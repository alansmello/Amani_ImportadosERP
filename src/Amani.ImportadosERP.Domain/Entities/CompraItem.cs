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

    public void ValidarRecebimento(int quantidade)
    {
        ValidarQuantidadePendente(quantidade, "recebimento");
    }

    public CompraItemRecebimento RegistrarRecebimento(
        Guid compraId,
        int quantidade,
        DateTime? dataRecebimento = null,
        Guid? estoqueMovimentacaoId = null,
        string? observacao = null)
    {
        ValidarCompra(compraId);
        ValidarRecebimento(quantidade);

        var recebimento = new CompraItemRecebimento(
            compraId,
            Id,
            ProdutoId,
            quantidade,
            CustoUnitario,
            dataRecebimento,
            CompraItemRecebimentoOrigem.Operacional,
            estoqueMovimentacaoId,
            observacao);

        _recebimentos.Add(recebimento);
        Touch();

        return recebimento;
    }

    public void ValidarPerda(int quantidade)
    {
        ValidarQuantidadePendente(quantidade, "perda");
    }

    public CompraItemPerda RegistrarPerda(
        Guid compraId,
        int quantidade,
        CompraItemPerdaMotivo motivo,
        DateTime? dataPerda = null,
        string? observacao = null)
    {
        ValidarCompra(compraId);
        ValidarPerda(quantidade);

        var perda = new CompraItemPerda(
            compraId,
            Id,
            ProdutoId,
            quantidade,
            motivo,
            dataPerda,
            observacao);

        _perdas.Add(perda);
        Touch();

        return perda;
    }

    private void ValidarCompra(Guid compraId)
    {
        if (compraId == Guid.Empty)
        {
            throw new ArgumentException("CompraId e obrigatorio", nameof(compraId));
        }

        if (CompraId != Guid.Empty && CompraId != compraId)
        {
            throw new InvalidOperationException("Item nao pertence a compra informada");
        }
    }

    private void ValidarQuantidadePendente(int quantidade, string operacao)
    {
        if (quantidade <= 0)
        {
            throw new ArgumentException($"Quantidade de {operacao} deve ser maior que zero", nameof(quantidade));
        }

        if (quantidade > QuantidadePendente)
        {
            throw new InvalidOperationException($"Quantidade de {operacao} nao pode exceder a quantidade pendente");
        }
    }

    protected CompraItem() { }
}
