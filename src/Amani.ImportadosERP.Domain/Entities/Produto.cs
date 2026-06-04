using System;
using Amani.ImportadosERP.Domain.Common;

namespace Amani.ImportadosERP.Domain.Entities;

public sealed class Produto : BaseEntity
{
    public string Nome { get; private set; }
    public decimal PrecoVenda { get; private set; }
    public decimal Custo { get; private set; }
    public Guid CategoriaId { get; private set; }
    public Guid? FornecedorId { get; private set; }

    public Produto(string nome, decimal precoVenda, decimal custo, Guid categoriaId, Guid? fornecedorId = null)
    {
        if (string.IsNullOrWhiteSpace(nome)) throw new ArgumentException("Nome é obrigatório", nameof(nome));
        if (precoVenda < 0) throw new ArgumentException("PrecoVenda não pode ser negativo", nameof(precoVenda));
        if (custo < 0) throw new ArgumentException("Custo não pode ser negativo", nameof(custo));
        if (categoriaId == Guid.Empty) throw new ArgumentException("CategoriaId é obrigatório", nameof(categoriaId));

        Nome = nome.Trim();
        PrecoVenda = precoVenda;
        Custo = custo;
        CategoriaId = categoriaId;
        FornecedorId = fornecedorId;
    }

    protected Produto() { }

    public void Atualizar(string nome, decimal precoVenda, decimal custo, Guid categoriaId, Guid? fornecedorId)
    {
        if (string.IsNullOrWhiteSpace(nome)) throw new ArgumentException("Nome é obrigatório", nameof(nome));
        if (precoVenda < 0) throw new ArgumentException("PrecoVenda não pode ser negativo", nameof(precoVenda));
        if (custo < 0) throw new ArgumentException("Custo não pode ser negativo", nameof(custo));
        if (categoriaId == Guid.Empty) throw new ArgumentException("CategoriaId é obrigatório", nameof(categoriaId));
        if (fornecedorId.HasValue && fornecedorId.Value == Guid.Empty) throw new ArgumentException("FornecedorId inválido", nameof(fornecedorId));

        Nome = nome.Trim();
        PrecoVenda = precoVenda;
        Custo = custo;
        CategoriaId = categoriaId;
        FornecedorId = fornecedorId;
        Touch();
    }

    public void AtualizarPrecoVenda(decimal novoPreco)
    {
        if (novoPreco < 0) throw new ArgumentException("PrecoVenda não pode ser negativo", nameof(novoPreco));
        PrecoVenda = novoPreco;
        Touch();
    }

    public void AtualizarCusto(decimal novoCusto)
    {
        if (novoCusto < 0) throw new ArgumentException("Custo não pode ser negativo", nameof(novoCusto));
        Custo = novoCusto;
        Touch();
    }

    public void AssociarFornecedor(Guid fornecedorId)
    {
        if (fornecedorId == Guid.Empty) throw new ArgumentException("FornecedorId inválido", nameof(fornecedorId));
        FornecedorId = fornecedorId;
        Touch();
    }

    public void AlterarCategoria(Guid categoriaId)
    {
        if (categoriaId == Guid.Empty) throw new ArgumentException("CategoriaId inválido", nameof(categoriaId));
        CategoriaId = categoriaId;
        Touch();
    }
}
