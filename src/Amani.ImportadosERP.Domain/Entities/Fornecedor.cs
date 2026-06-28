using System;
using Amani.ImportadosERP.Domain.Common;

namespace Amani.ImportadosERP.Domain.Entities;

public sealed class Fornecedor : BaseEntity
{
    public const int TelefoneMaxLength = 50;

    public string Nome { get; private set; }
    public string? Telefone { get; private set; }

    public Fornecedor(string nome, string? telefone = null)
    {
        Nome = NormalizarNome(nome);
        Telefone = NormalizarTelefone(telefone);
    }

    protected Fornecedor() { }

    public void Atualizar(string nome, string? telefone)
    {
        var nomeNormalizado = NormalizarNome(nome);
        var telefoneNormalizado = NormalizarTelefone(telefone);

        Nome = nomeNormalizado;
        Telefone = telefoneNormalizado;
        Touch();
    }

    private static string NormalizarNome(string nome)
    {
        if (string.IsNullOrWhiteSpace(nome))
            throw new ArgumentException("Nome é obrigatório", nameof(nome));

        return nome.Trim();
    }

    private static string? NormalizarTelefone(string? telefone)
    {
        if (string.IsNullOrWhiteSpace(telefone)) return null;

        var telefoneNormalizado = telefone.Trim();
        if (telefoneNormalizado.Length > TelefoneMaxLength)
            throw new ArgumentException(
                $"Telefone deve ter no máximo {TelefoneMaxLength} caracteres",
                nameof(telefone));

        return telefoneNormalizado;
    }
}
