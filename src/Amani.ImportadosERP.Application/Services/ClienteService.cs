using System;
using System.Threading.Tasks;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Services;

public class ClienteService
{
    private readonly IClienteRepository _clienteRepository;

    public ClienteService(IClienteRepository clienteRepository)
    {
        _clienteRepository = clienteRepository;
    }

    public async Task<Guid> CreateAsync(CriarClienteDto dto)
    {
        var cliente = new Cliente(dto.Nome, dto.Email, dto.Telefone);
        await _clienteRepository.AdicionarAsync(cliente);
        return cliente.Id;
    }

    public async Task<Cliente?> ObterPorIdAsync(Guid id)
    {
        return await _clienteRepository.ObterPorIdAsync(id);
    }
}
