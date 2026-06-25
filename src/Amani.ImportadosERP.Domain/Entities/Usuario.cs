using System;
using Amani.ImportadosERP.Domain.Common;

namespace Amani.ImportadosERP.Domain.Entities;

public sealed class Usuario : BaseEntity
{
    public string Login { get; private set; } = string.Empty;
    public string LoginNormalizado { get; private set; } = string.Empty;
    public string NomeExibicao { get; private set; } = string.Empty;
    public string SenhaHash { get; private set; } = string.Empty;
    public bool Ativo { get; private set; }
    public string OrigemProvisionamento { get; private set; } = string.Empty;
    public DateTime? UltimoLoginEm { get; private set; }

    public Usuario(
        string login,
        string nomeExibicao,
        string senhaHash,
        string origemProvisionamento)
    {
        if (string.IsNullOrWhiteSpace(login)) throw new ArgumentException("Login e obrigatorio", nameof(login));
        if (string.IsNullOrWhiteSpace(nomeExibicao)) throw new ArgumentException("Nome de exibicao e obrigatorio", nameof(nomeExibicao));
        if (string.IsNullOrWhiteSpace(senhaHash)) throw new ArgumentException("Hash da senha e obrigatorio", nameof(senhaHash));
        if (string.IsNullOrWhiteSpace(origemProvisionamento)) throw new ArgumentException("Origem de provisionamento e obrigatoria", nameof(origemProvisionamento));

        Login = login.Trim();
        LoginNormalizado = NormalizarLogin(login);
        NomeExibicao = nomeExibicao.Trim();
        SenhaHash = senhaHash;
        OrigemProvisionamento = origemProvisionamento.Trim();
        Ativo = true;
    }

    protected Usuario() { }

    public static string NormalizarLogin(string login)
    {
        return string.IsNullOrWhiteSpace(login)
            ? string.Empty
            : login.Trim().ToUpperInvariant();
    }

    public void RegistrarLoginBemSucedido(DateTime dataHoraUtc)
    {
        UltimoLoginEm = dataHoraUtc;
        Touch();
    }

    public void AtualizarSenhaHash(string senhaHash)
    {
        if (string.IsNullOrWhiteSpace(senhaHash)) throw new ArgumentException("Hash da senha e obrigatorio", nameof(senhaHash));
        SenhaHash = senhaHash;
        Touch();
    }

    public void Inativar()
    {
        if (!Ativo) return;
        Ativo = false;
        Touch();
    }
}
