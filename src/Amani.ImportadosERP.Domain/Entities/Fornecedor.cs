using System;
using Amani.ImportadosERP.Domain.Common;

namespace Amani.ImportadosERP.Domain.Entities;

public sealed class Fornecedor : BaseEntity
{
    public string Nome { get; private set; }

    public Fornecedor(string nome)
    {
        if (string.IsNullOrWhiteSpace(nome)) throw new ArgumentException("Nome é obrigatório", nameof(nome));
        Nome = nome.Trim();
    }

    protected Fornecedor() { }

    public void AtualizarNome(string nome)
    {
        if (string.IsNullOrWhiteSpace(nome)) throw new ArgumentException("Nome é obrigatório", nameof(nome));
        Nome = nome.Trim();
        Touch();
    }
}
