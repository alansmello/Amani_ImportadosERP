using System;
using System.Collections.Generic;
using System.Linq;
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

    public async Task<ClienteDto> CreateAsync(CriarClienteDto dto)
    {
        var cliente = new Cliente(dto.Nome, dto.Email, dto.Telefone);
        await _clienteRepository.AdicionarAsync(cliente);
        return ToDto(cliente);
    }

    public async Task<ClienteDto?> ObterPorIdAsync(Guid id)
    {
        var cliente = await _clienteRepository.ObterPorIdAsync(id);
        return cliente == null ? null : ToDto(cliente);
    }

    public async Task<List<ClienteDto>> ListarAsync(bool? ativo = null)
    {
        var clientes = await _clienteRepository.ListarAsync(ativo);
        return clientes.Select(ToDto).ToList();
    }

    public async Task<bool> AtualizarAsync(Guid id, AtualizarClienteDto dto)
    {
        var cliente = await _clienteRepository.ObterPorIdParaAtualizarAsync(id);
        if (cliente == null) return false;

        cliente.Atualizar(dto.Nome, dto.Email, dto.Telefone);
        await _clienteRepository.SalvarAsync();
        return true;
    }

    public async Task<bool> InativarAsync(Guid id)
    {
        var cliente = await _clienteRepository.ObterPorIdParaAtualizarAsync(id);
        if (cliente == null) return false;

        cliente.Inativar();
        await _clienteRepository.SalvarAsync();
        return true;
    }

    private static ClienteDto ToDto(Cliente cliente)
    {
        return new ClienteDto
        {
            Id = cliente.Id,
            Nome = cliente.Nome,
            Email = cliente.Email,
            Telefone = cliente.Telefone,
            Ativo = cliente.Ativo
        };
    }
}
