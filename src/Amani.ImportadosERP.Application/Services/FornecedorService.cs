using System;
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

    public async Task<Guid> CreateAsync(CriarFornecedorDto dto)
    {
        var fornecedor = new Fornecedor(dto.Nome);
        await _fornecedorRepository.AdicionarAsync(fornecedor);
        return fornecedor.Id;
    }

    public async Task<Fornecedor?> ObterPorIdAsync(Guid id)
    {
        return await _fornecedorRepository.ObterPorIdAsync(id);
    }
}
