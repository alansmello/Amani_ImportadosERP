using System;
using System.Collections.Generic;
using System.Linq;
using Amani.ImportadosERP.Domain.Common;
using Amani.ImportadosERP.Domain.Services;

namespace Amani.ImportadosERP.Domain.Entities;

public sealed class Compra : BaseEntity
{
    public Guid FornecedorId { get; private set; }
    public DateTime DataCompra { get; private set; }
    public decimal Desconto { get; private set; }
    public decimal Acrescimo { get; private set; }
    public CompraStatus Status { get; private set; }

    private readonly List<CompraItem> _items = new();
    public IReadOnlyCollection<CompraItem> Items => _items.AsReadOnly();

    private readonly List<CompraItemRecebimento> _recebimentos = new();
    public IReadOnlyCollection<CompraItemRecebimento> Recebimentos => _recebimentos.AsReadOnly();

    private readonly List<CompraItemPerda> _perdas = new();
    public IReadOnlyCollection<CompraItemPerda> Perdas => _perdas.AsReadOnly();

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
        Status = CompraStatus.EmTransito;
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

    public CompraItemRecebimento RegistrarRecebimentoItem(
        Guid compraItemId,
        int quantidade,
        DateTime? dataRecebimento = null,
        Guid? estoqueMovimentacaoId = null,
        string? observacao = null)
    {
        GarantirQueAceitaEventosLogisticos("recebimento");

        var item = ObterItem(compraItemId);
        var recebimento = item.RegistrarRecebimento(
            Id,
            quantidade,
            dataRecebimento,
            estoqueMovimentacaoId,
            observacao);

        _recebimentos.Add(recebimento);
        RecalcularStatusOperacional();
        Touch();

        return recebimento;
    }

    public CompraItemPerda RegistrarPerdaItem(
        Guid compraItemId,
        int quantidade,
        CompraItemPerdaMotivo motivo,
        DateTime? dataPerda = null,
        string? observacao = null)
    {
        GarantirQueAceitaEventosLogisticos("perda");

        var item = ObterItem(compraItemId);
        var perda = item.RegistrarPerda(Id, quantidade, motivo, dataPerda, observacao);

        _perdas.Add(perda);
        RecalcularStatusOperacional();
        Touch();

        return perda;
    }

    public decimal Total()
    {
        return CompraCalculoFinanceiro.CalcularTotal(
            _items.Select(CompraItemCalculoFinanceiro.FromEntity),
            Desconto,
            Acrescimo);
    }

    private CompraItem ObterItem(Guid compraItemId)
    {
        if (compraItemId == Guid.Empty)
        {
            throw new ArgumentException("CompraItemId e obrigatorio", nameof(compraItemId));
        }

        return _items.FirstOrDefault(i => i.Id == compraItemId)
            ?? throw new InvalidOperationException("Item nao pertence a compra informada");
    }

    private void GarantirQueAceitaEventosLogisticos(string evento)
    {
        if (Status == CompraStatus.Cancelada || Status == CompraStatus.Finalizada)
        {
            throw new InvalidOperationException($"Compra {Status} nao aceita registro de {evento}");
        }
    }

    private void RecalcularStatusOperacional()
    {
        if (!_items.Any())
        {
            Status = CompraStatus.EmTransito;
            return;
        }

        var possuiPendencia = _items.Any(i => i.QuantidadePendente > 0);
        var possuiRecebimento = _items.Any(i => i.QuantidadeRecebida > 0);
        var possuiPerda = _items.Any(i => i.QuantidadePerdida > 0);

        if (!possuiPendencia)
        {
            Status = possuiPerda ? CompraStatus.Finalizada : CompraStatus.Recebida;
            return;
        }

        Status = possuiRecebimento
            ? CompraStatus.ParcialmenteRecebida
            : CompraStatus.EmTransito;
    }
}

public enum CompraStatus
{
    Criada,
    EmTransito,
    ParcialmenteRecebida,
    Recebida,
    Finalizada,
    Cancelada
}
