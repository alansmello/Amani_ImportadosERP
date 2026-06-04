using System;
using Amani.ImportadosERP.Domain.Common;

namespace Amani.ImportadosERP.Domain.Entities;

public sealed class Cliente : BaseEntity
{
    public string Nome { get; private set; }
    public string? Email { get; private set; }
    public string? Telefone { get; private set; }
    public bool Ativo { get; private set; }

    public Cliente(string nome, string? email = null, string? telefone = null)
    {
        if (string.IsNullOrWhiteSpace(nome)) throw new ArgumentException("Nome e obrigatorio", nameof(nome));
        Nome = nome.Trim();
        Email = string.IsNullOrWhiteSpace(email) ? null : email.Trim();
        Telefone = string.IsNullOrWhiteSpace(telefone) ? null : telefone.Trim();
        Ativo = true;
    }

    protected Cliente() { }

    public void Atualizar(string nome, string? email, string? telefone)
    {
        if (string.IsNullOrWhiteSpace(nome)) throw new ArgumentException("Nome e obrigatorio", nameof(nome));
        Nome = nome.Trim();
        Email = string.IsNullOrWhiteSpace(email) ? null : email.Trim();
        Telefone = string.IsNullOrWhiteSpace(telefone) ? null : telefone.Trim();
        Touch();
    }

    public void AtualizarContato(string? email, string? telefone)
    {
        Email = string.IsNullOrWhiteSpace(email) ? null : email.Trim();
        Telefone = string.IsNullOrWhiteSpace(telefone) ? null : telefone.Trim();
        Touch();
    }

    public void Inativar()
    {
        if (!Ativo) return;
        Ativo = false;
        Touch();
    }
}
