using Amani.ImportadosERP.Domain.Common;

namespace Amani.ImportadosERP.Domain.Entities;

public sealed class CompraItemDevolucaoCompensacao : BaseEntity
{
    public Guid CompraItemDevolucaoId { get; private set; }
    public Guid? EstoqueMovimentacaoId { get; private set; }
    public DateTime DataCompensacao { get; private set; }
    public string Motivo { get; private set; }
    public bool PresencaFisicaConfirmada { get; private set; }
    public Guid OperacaoId { get; private set; }

    public CompraItemDevolucao? CompraItemDevolucao { get; private set; }
    public EstoqueMovimentacao? EstoqueMovimentacao { get; private set; }

    public CompraItemDevolucaoCompensacao(
        Guid compraItemDevolucaoId,
        DateTime dataCompensacao,
        string motivo,
        Guid operacaoId,
        bool presencaFisicaConfirmada = false,
        Guid? estoqueMovimentacaoId = null)
    {
        if (compraItemDevolucaoId == Guid.Empty) throw new ArgumentException("CompraItemDevolucaoId e obrigatorio", nameof(compraItemDevolucaoId));
        if (operacaoId == Guid.Empty) throw new ArgumentException("OperacaoId e obrigatorio", nameof(operacaoId));
        if (estoqueMovimentacaoId == Guid.Empty) throw new ArgumentException("EstoqueMovimentacaoId nao pode ser vazio", nameof(estoqueMovimentacaoId));

        Motivo = NormalizarTextoObrigatorio(motivo, 500, nameof(motivo));
        CompraItemDevolucaoId = compraItemDevolucaoId;
        EstoqueMovimentacaoId = estoqueMovimentacaoId;
        DataCompensacao = NormalizarData(dataCompensacao);
        PresencaFisicaConfirmada = presencaFisicaConfirmada;
        OperacaoId = operacaoId;
    }

    private CompraItemDevolucaoCompensacao()
    {
        Motivo = string.Empty;
    }

    private static DateTime NormalizarData(DateTime data)
    {
        var valor = data == default ? DateTime.UtcNow : data;
        return DateTime.SpecifyKind(valor.Date, DateTimeKind.Utc);
    }

    private static string NormalizarTextoObrigatorio(string texto, int tamanhoMaximo, string nomeParametro)
    {
        if (string.IsNullOrWhiteSpace(texto))
            throw new ArgumentException("Texto obrigatorio", nomeParametro);
        var normalizado = texto.Trim();
        if (normalizado.Length > tamanhoMaximo)
            throw new ArgumentException($"Texto nao pode exceder {tamanhoMaximo} caracteres", nomeParametro);
        return normalizado;
    }
}
