using System;
using System.Threading.Tasks;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Interfaces;

public interface IUsuarioRepository
{
    Task AdicionarAsync(Usuario usuario);
    Task<Usuario?> ObterPorIdAsync(Guid id);
    Task<Usuario?> ObterPorLoginNormalizadoAsync(string loginNormalizado);
    Task SalvarAsync();
}
