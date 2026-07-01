using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Services;

public class ProdutoService
{
    private readonly IProdutoRepository _produtoRepository;
    private readonly ICategoriaRepository _categoriaRepository;
    private readonly IFornecedorRepository _fornecedorRepository;
    private readonly IFeatureSettings _features;

    public ProdutoService(
        IProdutoRepository produtoRepository,
        ICategoriaRepository categoriaRepository,
        IFornecedorRepository fornecedorRepository,
        IFeatureSettings features)
    {
        _produtoRepository = produtoRepository;
        _categoriaRepository = categoriaRepository;
        _fornecedorRepository = fornecedorRepository;
        _features = features;
    }

    public async Task<ProdutoDto> CreateAsync(CriarProdutoDto dto)
    {
        await ValidarReferenciasAsync(dto.CategoriaId, dto.FornecedorId);

        var produto = new Produto(dto.Nome, dto.PrecoVenda, dto.Custo, dto.CategoriaId, dto.FornecedorId);
        await _produtoRepository.AdicionarAsync(produto);
        return ToDto(produto);
    }

    public async Task<ProdutoDto?> ObterPorIdAsync(Guid id)
    {
        var produto = await _produtoRepository.ObterPorIdAsync(id);
        return produto == null ? null : ToDto(produto);
    }

    public async Task<List<ProdutoDto>> ListarAsync()
    {
        var produtos = await _produtoRepository.ListarAsync();
        return produtos.Select(ToDto).ToList();
    }

    public async Task<bool> AtualizarAsync(Guid id, AtualizarProdutoDto dto)
    {
        var produto = await _produtoRepository.ObterPorIdParaAtualizarAsync(id);
        if (produto == null) return false;

        await ValidarReferenciasAsync(dto.CategoriaId, dto.FornecedorId);

        produto.Atualizar(dto.Nome, dto.PrecoVenda, dto.Custo, dto.CategoriaId, dto.FornecedorId);
        await _produtoRepository.SalvarAsync();
        return true;
    }

    private async Task ValidarReferenciasAsync(Guid categoriaId, Guid? fornecedorId)
    {
        var categoria = await _categoriaRepository.ObterPorIdAsync(categoriaId);
        if (categoria == null)
            throw new ArgumentException("Categoria informada não existe.", nameof(categoriaId));

        if (fornecedorId.HasValue)
        {
            var fornecedor = await _fornecedorRepository.ObterPorIdAsync(fornecedorId.Value);
            if (fornecedor == null)
                throw new ArgumentException("Fornecedor informado não existe.", nameof(fornecedorId));
        }
    }

    private ProdutoDto ToDto(Produto produto)
    {
        return new ProdutoDto
        {
            Id = produto.Id,
            Nome = produto.Nome,
            PrecoVenda = produto.PrecoVenda,
            Custo = produto.Custo,
            CategoriaId = produto.CategoriaId,
            FornecedorId = produto.FornecedorId,
            ApresentacoesFracionadasHabilitadas = _features.ApresentacoesFracionadasEnabled,
            Apresentacoes = _features.ApresentacoesFracionadasEnabled
                ? produto.Apresentacoes.Select(ProdutoApresentacaoService.Mapear).ToList()
                : Array.Empty<ProdutoApresentacaoDto>()
        };
    }
}
