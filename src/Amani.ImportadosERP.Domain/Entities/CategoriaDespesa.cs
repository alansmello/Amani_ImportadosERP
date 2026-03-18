using System;
using Amani.ImportadosERP.Domain.Common;

namespace Amani.ImportadosERP.Domain.Entities;

public sealed class CategoriaDespesa : BaseEntity
{
    public string Nome { get; private set; }

    public CategoriaDespesa(string nome)
    {
        if (string.IsNullOrWhiteSpace(nome)) throw new ArgumentException("Nome é obrigatório", nameof(nome));
        Nome = nome.Trim();
    }

    protected CategoriaDespesa() { }

    public void AtualizarNome(string nome)
    {
        if (string.IsNullOrWhiteSpace(nome)) throw new ArgumentException("Nome é obrigatório", nameof(nome));
        Nome = nome.Trim();
        Touch();
    }
}
