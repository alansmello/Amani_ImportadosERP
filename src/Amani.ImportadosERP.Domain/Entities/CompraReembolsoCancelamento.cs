using Amani.ImportadosERP.Domain.Common;

namespace Amani.ImportadosERP.Domain.Entities;

public sealed class CompraReembolsoCancelamento : BaseEntity
{
    public Guid CompraReembolsoId { get; private set; }
    public DateTime DataCancelamento { get; private set; }
    public string Motivo { get; private set; }
    public Guid OperacaoId { get; private set; }

    public CompraReembolso? CompraReembolso { get; private set; }

    public CompraReembolsoCancelamento(
        Guid compraReembolsoId,
        DateTime dataCancelamento,
        string motivo,
        Guid operacaoId)
    {
        if (compraReembolsoId == Guid.Empty) throw new ArgumentException("CompraReembolsoId e obrigatorio", nameof(compraReembolsoId));
        if (operacaoId == Guid.Empty) throw new ArgumentException("OperacaoId e obrigatorio", nameof(operacaoId));

        CompraReembolsoId = compraReembolsoId;
        DataCancelamento = NormalizarData(dataCancelamento);
        Motivo = NormalizarTextoObrigatorio(motivo, 500, nameof(motivo));
        OperacaoId = operacaoId;
    }

    private CompraReembolsoCancelamento()
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
