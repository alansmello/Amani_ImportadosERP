using System;
using System.Collections.Generic;
using Amani.ImportadosERP.Domain.Common;

namespace Amani.ImportadosERP.Domain.Entities;

public sealed class ContaReceber : BaseEntity
{
    public Guid? VendaId { get; private set; }
    public Guid? ClienteId { get; private set; }
    public decimal Valor { get; private set; }
    public DateTime DataVencimento { get; private set; }
    public string Origem { get; private set; }
    public ICollection<PagamentoRecebido> Pagamentos { get; private set; }

    private ContaReceber()
    {
        Origem = null!;
        Pagamentos = new List<PagamentoRecebido>();
    }

    public ContaReceber(Guid vendaId, Guid clienteId, decimal valor, DateTime dataVencimento)
    {
        if (vendaId == Guid.Empty) throw new ArgumentException("VendaId e obrigatorio", nameof(vendaId));
        if (clienteId == Guid.Empty) throw new ArgumentException("ClienteId e obrigatorio", nameof(clienteId));
        if (valor <= 0) throw new ArgumentException("Valor invalido", nameof(valor));
        if (dataVencimento == default) throw new ArgumentException("DataVencimento e obrigatoria", nameof(dataVencimento));

        VendaId = vendaId;
        ClienteId = clienteId;
        Valor = valor;
        DataVencimento = DateTime.SpecifyKind(dataVencimento.Date, DateTimeKind.Utc);
        Origem = "Venda";
        Pagamentos = new List<PagamentoRecebido>();
    }

    public static ContaReceber CriarManual(Guid clienteId, decimal valor, DateTime dataVencimento)
    {
        if (clienteId == Guid.Empty) throw new ArgumentException("ClienteId e obrigatorio", nameof(clienteId));
        if (valor <= 0) throw new ArgumentException("Valor invalido", nameof(valor));
        if (dataVencimento == default) throw new ArgumentException("DataVencimento e obrigatoria", nameof(dataVencimento));

        var conta = new ContaReceber();
        conta.VendaId = null;
        conta.ClienteId = clienteId;
        conta.Valor = valor;
        conta.DataVencimento = DateTime.SpecifyKind(dataVencimento.Date, DateTimeKind.Utc);
        conta.Origem = "Manual";
        conta.Pagamentos = new List<PagamentoRecebido>();
        return conta;
    }

    private ContaReceber(Guid clienteId, decimal valor, DateTime dataVencimento, string origem)
    {
        if (clienteId == Guid.Empty) throw new ArgumentException("ClienteId e obrigatorio", nameof(clienteId));
        if (valor <= 0) throw new ArgumentException("Valor invalido", nameof(valor));
        if (dataVencimento == default) throw new ArgumentException("DataVencimento e obrigatoria", nameof(dataVencimento));
        if (!OrigemInicialValida(origem))
        {
            throw new ArgumentException("Origem deve ser SaldoInicial ou ImplantacaoInicial", nameof(origem));
        }

        VendaId = null;
        ClienteId = clienteId;
        Valor = valor;
        DataVencimento = DateTime.SpecifyKind(dataVencimento.Date, DateTimeKind.Utc);
        Origem = NormalizarOrigemInicial(origem);
        Pagamentos = new List<PagamentoRecebido>();
    }

    public static ContaReceber CriarInicial(Guid clienteId, decimal valor, DateTime dataVencimento, string origem)
    {
        return new ContaReceber(clienteId, valor, dataVencimento, origem);
    }

    public void Atualizar(decimal valor, DateTime dataVencimento)
    {
        if (valor <= 0) throw new Exception("Valor invalido");
        if (dataVencimento == default) throw new Exception("Data de vencimento invalida");

        Valor = valor;
        DataVencimento = dataVencimento;
        Touch();
    }

    private static bool OrigemInicialValida(string origem)
    {
        return string.Equals(origem, "SaldoInicial", StringComparison.OrdinalIgnoreCase)
            || string.Equals(origem, "ImplantacaoInicial", StringComparison.OrdinalIgnoreCase);
    }

    private static string NormalizarOrigemInicial(string origem)
    {
        return string.Equals(origem, "SaldoInicial", StringComparison.OrdinalIgnoreCase)
            ? "SaldoInicial"
            : "ImplantacaoInicial";
    }
}
