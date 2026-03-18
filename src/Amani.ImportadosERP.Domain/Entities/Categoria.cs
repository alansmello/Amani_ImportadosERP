using System;
using Amani.ImportadosERP.Domain.Common;

namespace Amani.ImportadosERP.Domain.Entities;

public sealed class Categoria : BaseEntity
{
    public string Nome { get; private set; }

    public Categoria(string nome)
    {
        if (string.IsNullOrWhiteSpace(nome)) throw new ArgumentException("Nome é obrigatório", nameof(nome));
        Nome = nome.Trim();
    }

    protected Categoria() { }

    public void AtualizarNome(string nome)
    {
        if (string.IsNullOrWhiteSpace(nome)) throw new ArgumentException("Nome é obrigatório", nameof(nome));
        Nome = nome.Trim();
        Touch();
    }
}
