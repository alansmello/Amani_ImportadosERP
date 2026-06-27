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
        if (FormaPagamento != FormaPagamento.CartaoDebito)
        {
            if (percentualTaxa != 0)
            {
                throw new ArgumentException("Somente cartao de debito possui taxa configuravel", nameof(percentualTaxa));
            }

            PercentualTaxa = 0;
            AtualizadoEm = DateTime.UtcNow;
            Touch();
            return;
        }

        if (percentualTaxa < 0 || percentualTaxa >= 100)
        {
            throw new ArgumentException("Percentual de taxa invalido para cartao de debito", nameof(percentualTaxa));
        }

        PercentualTaxa = percentualTaxa;
        AtualizadoEm = DateTime.UtcNow;
        Touch();
    }
}
