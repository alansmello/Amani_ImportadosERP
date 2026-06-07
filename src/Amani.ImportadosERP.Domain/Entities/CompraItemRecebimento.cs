using System;
using Amani.ImportadosERP.Domain.Common;

namespace Amani.ImportadosERP.Domain.Entities;

public enum CompraItemRecebimentoOrigem
{
    Operacional,
    LegadoMigrado
}

public sealed class CompraItemRecebimento : BaseEntity
{
    public Guid CompraId { get; private set; }
    public Guid CompraItemId { get; private set; }
    public Guid ProdutoId { get; private set; }
    public int Quantidade { get; private set; }
    public decimal ValorUnitario { get; private set; }
    public DateTime DataRecebimento { get; private set; }
    public Guid? EstoqueMovimentacaoId { get; private set; }
    public CompraItemRecebimentoOrigem Origem { get; private set; }
    public string? Observacao { get; private set; }

    public Compra Compra { get; private set; } = null!;
    public CompraItem CompraItem { get; private set; } = null!;
    public EstoqueMovimentacao? EstoqueMovimentacao { get; private set; }

    public CompraItemRecebimento(
        Guid compraId,
        Guid compraItemId,
        Guid produtoId,
        int quantidade,
        decimal valorUnitario,
        DateTime? dataRecebimento = null,
        CompraItemRecebimentoOrigem origem = CompraItemRecebimentoOrigem.Operacional,
        Guid? estoqueMovimentacaoId = null,
        string? observacao = null)
    {
        if (compraId == Guid.Empty) throw new ArgumentException("CompraId e obrigatorio", nameof(compraId));
        if (compraItemId == Guid.Empty) throw new ArgumentException("CompraItemId e obrigatorio", nameof(compraItemId));
        if (produtoId == Guid.Empty) throw new ArgumentException("ProdutoId e obrigatorio", nameof(produtoId));
        if (quantidade <= 0) throw new ArgumentException("Quantidade deve ser maior que zero", nameof(quantidade));
        if (valorUnitario < 0) throw new ArgumentException("ValorUnitario nao pode ser negativo", nameof(valorUnitario));
        if (estoqueMovimentacaoId == Guid.Empty) throw new ArgumentException("EstoqueMovimentacaoId nao pode ser vazio", nameof(estoqueMovimentacaoId));

        CompraId = compraId;
        CompraItemId = compraItemId;
        ProdutoId = produtoId;
        Quantidade = quantidade;
        ValorUnitario = valorUnitario;
        DataRecebimento = NormalizeData(dataRecebimento);
        EstoqueMovimentacaoId = estoqueMovimentacaoId;
        Origem = origem;
        Observacao = string.IsNullOrWhiteSpace(observacao) ? null : observacao.Trim();
    }

    protected CompraItemRecebimento() { }

    private static DateTime NormalizeData(DateTime? data)
    {
        if (data == null || data == default)
        {
            return DateTime.UtcNow;
        }

        return DateTime.SpecifyKind(data.Value.Date, DateTimeKind.Utc);
    }
}
