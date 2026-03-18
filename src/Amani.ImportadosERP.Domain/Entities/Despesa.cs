using System;
using Amani.ImportadosERP.Domain.Common;

namespace Amani.ImportadosERP.Domain.Entities;

public sealed class Despesa : BaseEntity
{
    public string Descricao { get; private set; }
    public decimal Valor { get; private set; }
    public DateTime Data { get; private set; }
    public Guid CategoriaDespesaId { get; private set; }

    public Despesa(string descricao, decimal valor, DateTime data, Guid categoriaDespesaId)
    {
        if (string.IsNullOrWhiteSpace(descricao)) throw new ArgumentException("Descricao é obrigatória", nameof(descricao));
        if (valor < 0) throw new ArgumentException("Valor não pode ser negativo", nameof(valor));
        if (categoriaDespesaId == Guid.Empty) throw new ArgumentException("CategoriaDespesaId é obrigatório", nameof(categoriaDespesaId));

        Descricao = descricao.Trim();
        Valor = valor;
        Data = data == default ? DateTime.UtcNow : data;
        CategoriaDespesaId = categoriaDespesaId;
    }

    protected Despesa() { }

    public void AtualizarDescricao(string descricao)
    {
        if (string.IsNullOrWhiteSpace(descricao)) throw new ArgumentException("Descricao é obrigatória", nameof(descricao));
        Descricao = descricao.Trim();
        Touch();
    }
}
