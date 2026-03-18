using System;
using System.Threading.Tasks;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Services;

public class ProdutoService
{
    private readonly IProdutoRepository _produtoRepository;

    public ProdutoService(IProdutoRepository produtoRepository)
    {
        _produtoRepository = produtoRepository;
    }

    public async Task<Guid> CreateAsync(CriarProdutoDto dto)
    {
        var produto = new Produto(dto.Nome, dto.PrecoVenda, dto.Custo, dto.CategoriaId, dto.FornecedorId);
        await _produtoRepository.AdicionarAsync(produto);
        return produto.Id;
    }

    public async Task<Produto?> ObterPorIdAsync(Guid id)
    {
        return await _produtoRepository.ObterPorIdAsync(id);
    }
}
