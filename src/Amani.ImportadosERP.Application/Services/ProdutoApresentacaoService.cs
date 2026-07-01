using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Services;

public sealed class ProdutoApresentacaoService
{
    private readonly IProdutoRepository _produtoRepository;
    private readonly IProdutoApresentacaoRepository _repository;
    private readonly IFeatureSettings _features;

    public ProdutoApresentacaoService(
        IProdutoRepository produtoRepository,
        IProdutoApresentacaoRepository repository,
        IFeatureSettings features)
    {
        _produtoRepository = produtoRepository;
        _repository = repository;
        _features = features;
    }

    public async Task<ProdutoApresentacaoDto> CriarAsync(Guid produtoId, CriarProdutoApresentacaoDto dto)
    {
        ValidarFeature();
        if (await _produtoRepository.ObterPorIdAsync(produtoId) == null)
            throw new KeyNotFoundException("Produto não encontrado");
        if (await _repository.NomeExisteAsync(produtoId, dto.Nome))
            throw new ArgumentException("Já existe uma apresentação com este nome para o produto");

        var apresentacao = new ProdutoApresentacao(
            produtoId, dto.Nome, dto.FatorNumerador, dto.FatorDenominador,
            dto.PermiteCompra, dto.PermiteVenda, dto.PrecoVenda, dto.Ativo);
        await _repository.AdicionarAsync(apresentacao);
        return Mapear(apresentacao);
    }

    public async Task<IReadOnlyCollection<ProdutoApresentacaoDto>> ListarAsync(Guid produtoId, bool apenasAtivas = false)
    {
        if (!_features.ApresentacoesFracionadasEnabled)
            return Array.Empty<ProdutoApresentacaoDto>();

        var itens = await _repository.ListarPorProdutoAsync(produtoId, apenasAtivas);
        return itens.Select(Mapear).ToList();
    }

    public async Task<bool> AtualizarAsync(Guid produtoId, Guid id, AtualizarProdutoApresentacaoDto dto)
    {
        ValidarFeature();
        var apresentacao = await _repository.ObterPorIdParaAtualizarAsync(id);
        if (apresentacao == null || apresentacao.ProdutoId != produtoId) return false;
        if (await _repository.NomeExisteAsync(produtoId, dto.Nome, id))
            throw new ArgumentException("Já existe uma apresentação com este nome para o produto");

        apresentacao.Atualizar(dto.Nome, dto.FatorNumerador, dto.FatorDenominador,
            dto.PermiteCompra, dto.PermiteVenda, dto.PrecoVenda, dto.Ativo);
        await _repository.SalvarAsync();
        return true;
    }

    public async Task<bool> DesativarAsync(Guid produtoId, Guid id)
    {
        ValidarFeature();
        var apresentacao = await _repository.ObterPorIdParaAtualizarAsync(id);
        if (apresentacao == null || apresentacao.ProdutoId != produtoId) return false;
        apresentacao.Desativar();
        await _repository.SalvarAsync();
        return true;
    }

    public static ProdutoApresentacaoDto Mapear(ProdutoApresentacao a) => new()
    {
        Id = a.Id,
        ProdutoId = a.ProdutoId,
        Nome = a.Nome,
        FatorNumerador = a.FatorNumerador,
        FatorDenominador = a.FatorDenominador,
        FatorCalculado = a.FatorCalculado(),
        PermiteCompra = a.PermiteCompra,
        PermiteVenda = a.PermiteVenda,
        PrecoVenda = a.PrecoVenda,
        Ativo = a.Ativo,
        CreatedAt = a.CreatedAt,
        UpdatedAt = a.UpdatedAt
    };

    private void ValidarFeature()
    {
        if (!_features.ApresentacoesFracionadasEnabled)
            throw new InvalidOperationException("Apresentações fracionadas estão desabilitadas");
    }
}
