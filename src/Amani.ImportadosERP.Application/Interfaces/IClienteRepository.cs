using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Interfaces;

public interface IClienteRepository
{
    Task AdicionarAsync(Cliente cliente);
    Task<Cliente?> ObterPorIdAsync(Guid id);
    Task<Cliente?> ObterPorIdParaAtualizarAsync(Guid id);
    Task<List<Cliente>> ListarAsync(bool? ativo = null);
    Task SalvarAsync();
}
