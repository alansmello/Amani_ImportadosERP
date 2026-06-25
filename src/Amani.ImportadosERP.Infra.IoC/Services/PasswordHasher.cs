using Amani.ImportadosERP.Application.Interfaces;
using Microsoft.AspNetCore.Identity;
using AspNetPasswordHasher = Microsoft.AspNetCore.Identity.PasswordHasher<string>;

namespace Amani.ImportadosERP.Infra.IoC.Services;

public class PasswordHasher : IPasswordHasher
{
    private readonly AspNetPasswordHasher _hasher = new();

    public string Hash(string senha)
    {
        if (string.IsNullOrWhiteSpace(senha))
            throw new ArgumentException("Senha e obrigatoria", nameof(senha));

        return _hasher.HashPassword(string.Empty, senha);
    }

    public bool Verificar(string senhaHash, string senha)
    {
        if (string.IsNullOrWhiteSpace(senhaHash) || string.IsNullOrWhiteSpace(senha))
            return false;

        var result = _hasher.VerifyHashedPassword(string.Empty, senhaHash, senha);
        return result == PasswordVerificationResult.Success ||
               result == PasswordVerificationResult.SuccessRehashNeeded;
    }
}
