using System;
using Amani.ImportadosERP.Domain.Common;

namespace Amani.ImportadosERP.Domain.Entities;

public sealed class Cliente : BaseEntity
{
    public string Nome { get; private set; }
    public string? Email { get; private set; }
    public string? Telefone { get; private set; }

    public Cliente(string nome, string? email = null, string? telefone = null)
    {
        if (string.IsNullOrWhiteSpace(nome)) throw new ArgumentException("Nome é obrigatório", nameof(nome));
        Nome = nome.Trim();
        Email = string.IsNullOrWhiteSpace(email) ? null : email.Trim();
        Telefone = string.IsNullOrWhiteSpace(telefone) ? null : telefone.Trim();
    }

    // EF / serializer
    protected Cliente() { }

    public void AtualizarContato(string? email, string? telefone)
    {
        Email = string.IsNullOrWhiteSpace(email) ? null : email.Trim();
        Telefone = string.IsNullOrWhiteSpace(telefone) ? null : telefone.Trim();
        Touch();
    }
}
