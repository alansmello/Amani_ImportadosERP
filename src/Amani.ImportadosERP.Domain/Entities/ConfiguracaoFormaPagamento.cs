using System;
using Amani.ImportadosERP.Domain.Common;
using Amani.ImportadosERP.Domain.Enums;

namespace Amani.ImportadosERP.Domain.Entities;

public sealed class ConfiguracaoFormaPagamento : BaseEntity
{
    public FormaPagamento FormaPagamento { get; private set; }
    public decimal PercentualTaxa { get; private set; }
    public DateTime AtualizadoEm { get; private set; }

    protected ConfiguracaoFormaPagamento() { }

    public ConfiguracaoFormaPagamento(FormaPagamento formaPagamento, decimal percentualTaxa)
    {
        FormaPagamento = formaPagamento;
        AtualizarTaxa(percentualTaxa);
    }

    public void AtualizarTaxa(decimal percentualTaxa)
    {
        if (percentualTaxa < 0)
        {
            throw new ArgumentException("Percentual de taxa nao pode ser negativo", nameof(percentualTaxa));
        }

        PercentualTaxa = percentualTaxa;
        AtualizadoEm = DateTime.UtcNow;
        Touch();
    }
}
