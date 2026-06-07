using System;
using Amani.ImportadosERP.Domain.Common;

namespace Amani.ImportadosERP.Domain.Entities;

public enum CompraItemPerdaMotivo
{
    Perda,
    Extravio,
    Avaria
}

public sealed class CompraItemPerda : BaseEntity
{
    public Guid CompraId { get; private set; }
    public Guid CompraItemId { get; private set; }
    public Guid ProdutoId { get; private set; }
    public int Quantidade { get; private set; }
    public CompraItemPerdaMotivo Motivo { get; private set; }
    public DateTime DataPerda { get; private set; }
    public string? Observacao { get; private set; }

    public Compra Compra { get; private set; } = null!;
    public CompraItem CompraItem { get; private set; } = null!;

    public CompraItemPerda(
        Guid compraId,
        Guid compraItemId,
        Guid produtoId,
        int quantidade,
        CompraItemPerdaMotivo motivo,
        DateTime? dataPerda = null,
        string? observacao = null)
    {
        if (compraId == Guid.Empty) throw new ArgumentException("CompraId e obrigatorio", nameof(compraId));
        if (compraItemId == Guid.Empty) throw new ArgumentException("CompraItemId e obrigatorio", nameof(compraItemId));
        if (produtoId == Guid.Empty) throw new ArgumentException("ProdutoId e obrigatorio", nameof(produtoId));
        if (quantidade <= 0) throw new ArgumentException("Quantidade deve ser maior que zero", nameof(quantidade));

        CompraId = compraId;
        CompraItemId = compraItemId;
        ProdutoId = produtoId;
        Quantidade = quantidade;
        Motivo = motivo;
        DataPerda = NormalizeData(dataPerda);
        Observacao = string.IsNullOrWhiteSpace(observacao) ? null : observacao.Trim();
    }

    protected CompraItemPerda() { }

    private static DateTime NormalizeData(DateTime? data)
    {
        if (data == null || data == default)
        {
            return DateTime.UtcNow;
        }

        return DateTime.SpecifyKind(data.Value.Date, DateTimeKind.Utc);
    }
}
