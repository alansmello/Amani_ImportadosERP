using Amani.ImportadosERP.Domain.Common;

namespace Amani.ImportadosERP.Domain.Entities;

public sealed class CompraReembolso : BaseEntity
{
    private readonly List<CompraReembolsoAlocacao> _alocacoes = new();

    public Guid CompraId { get; private set; }
    public decimal Valor { get; private set; }
    public DateTime DataReembolso { get; private set; }
    public string? ReferenciaExterna { get; private set; }
    public string? Observacao { get; private set; }
    public Guid OperacaoId { get; private set; }

    public Compra? Compra { get; private set; }
    public CompraReembolsoCancelamento? Cancelamento { get; private set; }
    public IReadOnlyCollection<CompraReembolsoAlocacao> Alocacoes => _alocacoes.AsReadOnly();

    public decimal ValorAlocado => _alocacoes.Sum(a => a.Valor);
    public decimal ValorNaoAlocado => Valor - ValorAlocado;

    public CompraReembolso(
        Guid compraId,
        decimal valor,
        DateTime dataReembolso,
        Guid operacaoId,
        string? referenciaExterna = null,
        string? observacao = null)
    {
        if (compraId == Guid.Empty) throw new ArgumentException("CompraId e obrigatorio", nameof(compraId));
        if (operacaoId == Guid.Empty) throw new ArgumentException("OperacaoId e obrigatorio", nameof(operacaoId));
        if (valor <= 0m) throw new ArgumentException("Valor deve ser maior que zero", nameof(valor));

        CompraId = compraId;
        Valor = decimal.Round(valor, 2, MidpointRounding.AwayFromZero);
        DataReembolso = NormalizarData(dataReembolso);
        OperacaoId = operacaoId;
        ReferenciaExterna = NormalizarTextoOpcional(referenciaExterna, 100, nameof(referenciaExterna));
        Observacao = NormalizarTextoOpcional(observacao, 500, nameof(observacao));
    }

    private CompraReembolso() { }

    public void AdicionarAlocacao(CompraReembolsoAlocacao alocacao)
    {
        ArgumentNullException.ThrowIfNull(alocacao);
        if (alocacao.CompraReembolsoId != Id)
            throw new InvalidOperationException("Alocacao nao pertence ao reembolso");
        if (ValorAlocado + alocacao.Valor > Valor)
            throw new InvalidOperationException("Soma das alocacoes nao pode exceder o valor do reembolso");

        _alocacoes.Add(alocacao);
    }

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
