namespace Amani.ImportadosERP.Application.Interfaces;

public interface IPasswordHasher
{
    string Hash(string senha);
    bool Verificar(string senhaHash, string senha);
}
