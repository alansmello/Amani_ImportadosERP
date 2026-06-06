using System;
using Amani.ImportadosERP.Domain.Common;

namespace Amani.ImportadosERP.Domain.Entities;

public enum TipoEventoFinanceiro
{
    SaldoInicialCaixa = 1
}

public sealed class EventoFinanceiro : BaseEntity
{
    private const string OrigemImplantacaoInicial = "ImplantacaoInicial";

    public TipoEventoFinanceiro Tipo { get; private set; }
    public decimal Valor { get; private set; }
    public DateTime Data { get; private set; }
    public string Origem { get; private set; }
    public string Descricao { get; private set; }

    private EventoFinanceiro()
    {
        Origem = null!;
        Descricao = null!;
    }

    private EventoFinanceiro(
        TipoEventoFinanceiro tipo,
        decimal valor,
        DateTime data,
        string origem,
        string? descricao)
    {
        if (valor < 0) throw new ArgumentException("Valor nao pode ser negativo.", nameof(valor));
        if (data == default) throw new ArgumentException("Data do evento financeiro e obrigatoria.", nameof(data));
        if (string.IsNullOrWhiteSpace(origem)) throw new ArgumentException("Origem e obrigatoria.", nameof(origem));

        Tipo = tipo;
        Valor = valor;
        Data = DateTime.SpecifyKind(data.Date, DateTimeKind.Utc);
        Origem = origem.Trim();
        Descricao = string.IsNullOrWhiteSpace(descricao)
            ? "Saldo inicial de caixa"
            : descricao.Trim();
    }

    public static EventoFinanceiro CriarSaldoInicialCaixa(
        decimal valor,
        DateTime data,
        string origem,
        string? descricao)
    {
        if (!string.Equals(origem, OrigemImplantacaoInicial, StringComparison.OrdinalIgnoreCase))
        {
            throw new ArgumentException("Origem do saldo inicial de caixa deve ser ImplantacaoInicial.", nameof(origem));
        }

        return new EventoFinanceiro(
            TipoEventoFinanceiro.SaldoInicialCaixa,
            valor,
            data,
            OrigemImplantacaoInicial,
            descricao);
    }
}
