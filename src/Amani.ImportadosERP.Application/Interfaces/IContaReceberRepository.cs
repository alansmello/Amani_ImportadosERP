using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Interfaces;

public interface IContaReceberRepository
{
    Task AdicionarAsync(ContaReceber conta);
    Task RemoverAsync(ContaReceber conta);
    Task<ContaReceber?> ObterPorIdAsync(Guid id);
    Task<List<ContaReceber>> ObterPorVendaIdAsync(Guid vendaId);
    Task<List<ContaReceber>> ObterTodasAsync();
    Task<List<ContaReceberPorClienteDto>> ObterEmAbertoPorClienteAsync();
    Task<List<ContaReceberDetalheDto>> ObterEmAbertoDetalhePorClienteAsync(Guid clienteId);
    Task SalvarAsync();

    Task AdicionarPagamentoAsync(PagamentoRecebido pagamento);
}
