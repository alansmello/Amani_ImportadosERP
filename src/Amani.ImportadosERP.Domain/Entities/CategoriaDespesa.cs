using System;
using Amani.ImportadosERP.Domain.Common;

namespace Amani.ImportadosERP.Domain.Entities;

public sealed class CategoriaDespesa : BaseEntity
{
    public string Nome { get; private set; }
    public string NomeNormalizado { get; private set; }
    public string? Descricao { get; private set; }
    public bool Ativa { get; private set; }

    public CategoriaDespesa(string nome, string? descricao = null)
    {
        Nome = NormalizarNomeObrigatorio(nome);
        NomeNormalizado = NormalizarNomeParaComparacao(Nome);
        Descricao = NormalizarDescricao(descricao);
        Ativa = true;
    }

    protected CategoriaDespesa()
    {
        Nome = string.Empty;
        NomeNormalizado = string.Empty;
        Ativa = true;
    }

    public void Atualizar(string nome, string? descricao = null)
    {
        Nome = NormalizarNomeObrigatorio(nome);
        NomeNormalizado = NormalizarNomeParaComparacao(Nome);
        Descricao = NormalizarDescricao(descricao);
        Touch();
    }

    public void AtualizarNome(string nome)
    {
        Atualizar(nome, Descricao);
    }

    public void Inativar()
    {
        if (!Ativa) return;
        Ativa = false;
        Touch();
    }

    public void Reativar()
    {
        if (Ativa) return;
        Ativa = true;
        Touch();
    }

    private static string NormalizarNomeObrigatorio(string nome)
    {
        if (string.IsNullOrWhiteSpace(nome))
            throw new ArgumentException("Nome e obrigatorio", nameof(nome));

        return nome.Trim();
    }

    public static string NormalizarNomeParaComparacao(string nome)
    {
        return NormalizarNomeObrigatorio(nome).ToUpperInvariant();
    }

    private static string? NormalizarDescricao(string? descricao)
    {
        return string.IsNullOrWhiteSpace(descricao) ? null : descricao.Trim();
    }
}
