using System;
using Amani.ImportadosERP.Domain.Common;

namespace Amani.ImportadosERP.Domain.Entities;

public sealed class ProdutoApresentacao : BaseEntity
{
    public Guid ProdutoId { get; private set; }
    public string Nome { get; private set; } = string.Empty;
    public long FatorNumerador { get; private set; }
    public long FatorDenominador { get; private set; }
    public bool PermiteCompra { get; private set; }
    public bool PermiteVenda { get; private set; }
    public decimal? PrecoVenda { get; private set; }
    public bool Ativo { get; private set; }
    public Produto Produto { get; private set; } = null!;

    public ProdutoApresentacao(
        Guid produtoId,
        string nome,
        long fatorNumerador,
        long fatorDenominador,
        bool permiteCompra,
        bool permiteVenda,
        decimal? precoVenda,
        bool ativo = true)
    {
        Validar(produtoId, nome, fatorNumerador, fatorDenominador, permiteCompra, precoVenda);
        var fator = new QuantidadeRacional(fatorNumerador, fatorDenominador);

        ProdutoId = produtoId;
        Nome = nome.Trim();
        FatorNumerador = fator.NumeradorInt64();
        FatorDenominador = fator.DenominadorInt64();
        PermiteCompra = false;
        PermiteVenda = permiteVenda;
        PrecoVenda = precoVenda;
        Ativo = ativo;
    }

    private ProdutoApresentacao() { }

    public decimal FatorCalculado() => new QuantidadeRacional(FatorNumerador, FatorDenominador).ParaDecimal();

    public void Atualizar(
        string nome,
        long fatorNumerador,
        long fatorDenominador,
        bool permiteCompra,
        bool permiteVenda,
        decimal? precoVenda,
        bool ativo)
    {
        Validar(ProdutoId, nome, fatorNumerador, fatorDenominador, permiteCompra, precoVenda);
        var fator = new QuantidadeRacional(fatorNumerador, fatorDenominador);

        Nome = nome.Trim();
        FatorNumerador = fator.NumeradorInt64();
        FatorDenominador = fator.DenominadorInt64();
        PermiteCompra = false;
        PermiteVenda = permiteVenda;
        PrecoVenda = precoVenda;
        Ativo = ativo;
        Touch();
    }

    public void Desativar()
    {
        Ativo = false;
        Touch();
    }

    private static void Validar(Guid produtoId, string nome, long numerador, long denominador, bool permiteCompra, decimal? precoVenda)
    {
        if (produtoId == Guid.Empty) throw new ArgumentException("ProdutoId é obrigatório", nameof(produtoId));
        if (string.IsNullOrWhiteSpace(nome)) throw new ArgumentException("Nome é obrigatório", nameof(nome));
        if (nome.Trim().Length > 100) throw new ArgumentException("Nome deve possuir no máximo 100 caracteres", nameof(nome));
        if (numerador <= 0) throw new ArgumentException("FatorNumerador deve ser maior que zero", nameof(numerador));
        if (denominador <= 0) throw new ArgumentException("FatorDenominador deve ser maior que zero", nameof(denominador));
        if (numerador > int.MaxValue || denominador > int.MaxValue)
            throw new ArgumentException("Numerador e denominador devem ser menores ou iguais a 2147483647");
        if (numerador > denominador) throw new ArgumentException("O fator de estoque deve ser menor ou igual a 1");
        if (permiteCompra) throw new ArgumentException("Compra por apresentação não está disponível nesta versão", nameof(permiteCompra));
        if (precoVenda < 0) throw new ArgumentException("PrecoVenda não pode ser negativo", nameof(precoVenda));
    }
}
