using Amani.ImportadosERP.Domain.Common;

namespace Amani.ImportadosERP.Domain.Entities;

public sealed class CompraReembolsoAlocacao : BaseEntity
{
    public Guid CompraReembolsoId { get; private set; }
    public Guid CompraItemId { get; private set; }
    public Guid? CompraItemPerdaId { get; private set; }
    public Guid? CompraItemDevolucaoId { get; private set; }
    public decimal Valor { get; private set; }

    public CompraReembolso? CompraReembolso { get; private set; }
    public CompraItem? CompraItem { get; private set; }
    public CompraItemPerda? CompraItemPerda { get; private set; }
    public CompraItemDevolucao? CompraItemDevolucao { get; private set; }

    public CompraReembolsoAlocacao(
        Guid compraReembolsoId,
        Guid compraItemId,
        decimal valor,
        Guid? compraItemPerdaId = null,
        Guid? compraItemDevolucaoId = null)
    {
        if (compraReembolsoId == Guid.Empty) throw new ArgumentException("CompraReembolsoId e obrigatorio", nameof(compraReembolsoId));
        if (compraItemId == Guid.Empty) throw new ArgumentException("CompraItemId e obrigatorio", nameof(compraItemId));
        if (compraItemPerdaId == Guid.Empty) throw new ArgumentException("CompraItemPerdaId nao pode ser vazio", nameof(compraItemPerdaId));
        if (compraItemDevolucaoId == Guid.Empty) throw new ArgumentException("CompraItemDevolucaoId nao pode ser vazio", nameof(compraItemDevolucaoId));
        if (compraItemPerdaId.HasValue && compraItemDevolucaoId.HasValue)
            throw new ArgumentException("Alocacao pode referenciar perda ou devolucao, nao ambas");
        if (valor <= 0m) throw new ArgumentException("Valor deve ser maior que zero", nameof(valor));

        CompraReembolsoId = compraReembolsoId;
        CompraItemId = compraItemId;
        CompraItemPerdaId = compraItemPerdaId;
        CompraItemDevolucaoId = compraItemDevolucaoId;
        Valor = decimal.Round(valor, 2, MidpointRounding.AwayFromZero);
    }

    private CompraReembolsoAlocacao() { }
}
