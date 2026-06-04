using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Services;

public class FornecedorService
{
    private readonly IFornecedorRepository _fornecedorRepository;

    public FornecedorService(IFornecedorRepository fornecedorRepository)
    {
        _fornecedorRepository = fornecedorRepository;
    }

    public async Task<FornecedorDto> CreateAsync(CriarFornecedorDto dto)
    {
        var fornecedor = new Fornecedor(dto.Nome);
        await _fornecedorRepository.AdicionarAsync(fornecedor);
        return ToDto(fornecedor);
    }

    public async Task<FornecedorDto?> ObterPorIdAsync(Guid id)
    {
        var fornecedor = await _fornecedorRepository.ObterPorIdAsync(id);
        return fornecedor == null ? null : ToDto(fornecedor);
    }

    public async Task<List<FornecedorDto>> ListarAsync()
    {
        var fornecedores = await _fornecedorRepository.ListarAsync();
        return fornecedores.Select(ToDto).ToList();
    }

    public async Task<bool> AtualizarAsync(Guid id, AtualizarFornecedorDto dto)
    {
        var fornecedor = await _fornecedorRepository.ObterPorIdParaAtualizarAsync(id);
        if (fornecedor == null) return false;

        fornecedor.AtualizarNome(dto.Nome);
        await _fornecedorRepository.SalvarAsync();
        return true;
    }

    private static FornecedorDto ToDto(Fornecedor fornecedor)
    {
        return new FornecedorDto
        {
            Id = fornecedor.Id,
            Nome = fornecedor.Nome
        };
    }
}
