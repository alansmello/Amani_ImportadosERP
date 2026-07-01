using System;
using Amani.ImportadosERP.Domain.Common;

namespace Amani.ImportadosERP.Domain.Entities;

public sealed class VendaItem : BaseEntity
{
    public Guid ProdutoId { get; private set; }
    public int Quantidade { get; private set; }
    public decimal PrecoUnitario { get; private set; }
    public decimal Desconto { get; private set; }
    public decimal Acrescimo { get; private set; }
    public Guid VendaId { get; private set; }
    public Venda? Venda { get; private set; }
    public Guid? ProdutoApresentacaoId { get; private set; }
    public string? ApresentacaoNomeSnapshot { get; private set; }
    public long? FatorNumeradorAplicado { get; private set; }
    public long? FatorDenominadorAplicado { get; private set; }
    public decimal? FatorConversaoAplicado { get; private set; }
    public decimal? QuantidadeConvertidaEstoque { get; private set; }
    public ProdutoApresentacao? ProdutoApresentacao { get; private set; }

    public VendaItem(Guid produtoId, int quantidade, decimal precoUnitario, decimal desconto = 0m, decimal acrescimo = 0m)
    {
        if (produtoId == Guid.Empty) throw new ArgumentException("ProdutoId é obrigatório", nameof(produtoId));
        if (quantidade <= 0) throw new ArgumentException("Quantidade deve ser maior que zero", nameof(quantidade));
        if (precoUnitario < 0) throw new ArgumentException("PrecoUnitario não pode ser negativo", nameof(precoUnitario));
        if (desconto < 0) throw new ArgumentException("Desconto não pode ser negativo", nameof(desconto));
        if (acrescimo < 0) throw new ArgumentException("Acrescimo não pode ser negativo", nameof(acrescimo));

        ProdutoId = produtoId;
        Quantidade = quantidade;
        PrecoUnitario = precoUnitario;
        Desconto = desconto;
        Acrescimo = acrescimo;
    }

    public VendaItem(
        Guid produtoId,
        int quantidade,
        decimal precoUnitario,
        Guid produtoApresentacaoId,
        string apresentacaoNome,
        long fatorNumerador,
        long fatorDenominador,
        decimal desconto = 0m,
        decimal acrescimo = 0m)
        : this(produtoId, quantidade, precoUnitario, desconto, acrescimo)
    {
        if (produtoApresentacaoId == Guid.Empty) throw new ArgumentException("ProdutoApresentacaoId é obrigatório", nameof(produtoApresentacaoId));
        if (string.IsNullOrWhiteSpace(apresentacaoNome)) throw new ArgumentException("Nome da apresentação é obrigatório", nameof(apresentacaoNome));
        if (fatorNumerador <= 0 || fatorDenominador <= 0 || fatorNumerador > fatorDenominador)
            throw new ArgumentException("Fator de conversão inválido");

        var fator = new QuantidadeRacional(fatorNumerador, fatorDenominador);
        var convertida = fator.Multiplicar(quantidade);

        ProdutoApresentacaoId = produtoApresentacaoId;
        ApresentacaoNomeSnapshot = apresentacaoNome.Trim();
        FatorNumeradorAplicado = fator.NumeradorInt64();
        FatorDenominadorAplicado = fator.DenominadorInt64();
        FatorConversaoAplicado = fator.ParaDecimal();
        QuantidadeConvertidaEstoque = convertida.ParaDecimal();
    }

    protected VendaItem() { }

    public decimal ValorTotal()
    {
        var valorBase = Quantidade * PrecoUnitario;
        return valorBase - Desconto + Acrescimo;
    }

    public QuantidadeRacional ObterQuantidadeEstoqueExata()
    {
        return FatorNumeradorAplicado.HasValue && FatorDenominadorAplicado.HasValue
            ? new QuantidadeRacional(FatorNumeradorAplicado.Value, FatorDenominadorAplicado.Value).Multiplicar(Quantidade)
            : new QuantidadeRacional(Quantidade, 1);
    }

    internal void SetVenda(Guid vendaId)
    {
        VendaId = vendaId;
    }
}
