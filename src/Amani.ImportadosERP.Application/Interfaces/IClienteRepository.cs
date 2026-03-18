using System;
using System.Threading.Tasks;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Interfaces;

public interface IClienteRepository
{
    Task AdicionarAsync(Cliente cliente);
    Task<Cliente?> ObterPorIdAsync(Guid id);
}
