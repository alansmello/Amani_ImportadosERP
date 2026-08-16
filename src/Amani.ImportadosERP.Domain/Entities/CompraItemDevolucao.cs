using Amani.ImportadosERP.Domain.Common;

namespace Amani.ImportadosERP.Domain.Entities;

public enum CompraItemDevolucaoMomento
{
    AntesDoRecebimento,
    DepoisDoRecebimento
}

public enum CompraItemDevolucaoMotivo
{
    ProdutoFalsificado,
    Avaria,
    ProdutoIncorreto,
    DesistenciaRecusa,
    Outro
}

public sealed class CompraItemDevolucao : BaseEntity
{
    public Guid CompraId { get; private set; }
    public Guid CompraItemId { get; private set; }
    public Guid? CompraItemRecebimentoId { get; private set; }
    public Guid? EstoqueMovimentacaoId { get; private set; }
    public CompraItemDevolucaoMomento Momento { get; private set; }
    public int Quantidade { get; private set; }
    public CompraItemDevolucaoMotivo Motivo { get; private set; }
    public DateTime DataDevolucao { get; private set; }
    public string? Observacao { get; private set; }
    public Guid OperacaoId { get; private set; }

    public Compra? Compra { get; private set; }
    public CompraItem? CompraItem { get; private set; }
    public CompraItemRecebimento? CompraItemRecebimento { get; private set; }
    public EstoqueMovimentacao? EstoqueMovimentacao { get; private set; }
    public CompraItemDevolucaoCompensacao? Compensacao { get; private set; }

    public CompraItemDevolucao(
        Guid compraId,
        Guid compraItemId,
        CompraItemDevolucaoMomento momento,
        int quantidade,
        CompraItemDevolucaoMotivo motivo,
        DateTime dataDevolucao,
        Guid operacaoId,
        Guid? compraItemRecebimentoId = null,
        Guid? estoqueMovimentacaoId = null,
        string? observacao = null)
    {
        if (compraId == Guid.Empty) throw new ArgumentException("CompraId e obrigatorio", nameof(compraId));
        if (compraItemId == Guid.Empty) throw new ArgumentException("CompraItemId e obrigatorio", nameof(compraItemId));
        if (operacaoId == Guid.Empty) throw new ArgumentException("OperacaoId e obrigatorio", nameof(operacaoId));
        if (quantidade <= 0) throw new ArgumentException("Quantidade deve ser maior que zero", nameof(quantidade));
        if (compraItemRecebimentoId == Guid.Empty) throw new ArgumentException("CompraItemRecebimentoId nao pode ser vazio", nameof(compraItemRecebimentoId));
        if (estoqueMovimentacaoId == Guid.Empty) throw new ArgumentException("EstoqueMovimentacaoId nao pode ser vazio", nameof(estoqueMovimentacaoId));

        var observacaoNormalizada = NormalizarTextoOpcional(observacao, 500, nameof(observacao));
        if (motivo == CompraItemDevolucaoMotivo.Outro && string.IsNullOrWhiteSpace(observacaoNormalizada))
        {
            throw new ArgumentException("Observacao e obrigatoria quando o motivo for Outro", nameof(observacao));
        }

        if (momento == CompraItemDevolucaoMomento.AntesDoRecebimento)
        {
            if (compraItemRecebimentoId.HasValue)
                throw new ArgumentException("Recebimento deve ser nulo antes do recebimento", nameof(compraItemRecebimentoId));
            if (estoqueMovimentacaoId.HasValue)
                throw new ArgumentException("Movimentacao de estoque deve ser nula antes do recebimento", nameof(estoqueMovimentacaoId));
        }
        else
        {
            if (!compraItemRecebimentoId.HasValue)
                throw new ArgumentException("Recebimento e obrigatorio depois do recebimento", nameof(compraItemRecebimentoId));
            if (!estoqueMovimentacaoId.HasValue)
                throw new ArgumentException("Movimentacao de estoque e obrigatoria depois do recebimento", nameof(estoqueMovimentacaoId));
        }

        CompraId = compraId;
        CompraItemId = compraItemId;
        CompraItemRecebimentoId = compraItemRecebimentoId;
        EstoqueMovimentacaoId = estoqueMovimentacaoId;
        Momento = momento;
        Quantidade = quantidade;
        Motivo = motivo;
        DataDevolucao = NormalizarData(dataDevolucao);
        Observacao = observacaoNormalizada;
        OperacaoId = operacaoId;
    }

    private CompraItemDevolucao() { }

    private static DateTime NormalizarData(DateTime data)
    {
        var valor = data == default ? DateTime.UtcNow : data;
        return DateTime.SpecifyKind(valor.Date, DateTimeKind.Utc);
    }

    private static string? NormalizarTextoOpcional(string? texto, int tamanhoMaximo, string nomeParametro)
    {
        if (string.IsNullOrWhiteSpace(texto)) return null;
        var normalizado = texto.Trim();
        if (normalizado.Length > tamanhoMaximo)
            throw new ArgumentException($"Texto nao pode exceder {tamanhoMaximo} caracteres", nomeParametro);
        return normalizado;
    }
}
