using System;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Domain.Services;

public static class CompraPendenciaLogistica
{
    public static int Calcular(
        int quantidadeComprada,
        int quantidadeRecebidaAteT,
        int quantidadePerdidaAteT,
        int quantidadeDevolvidaAntesVigenteAteT)
    {
        if (quantidadeDevolvidaAntesVigenteAteT < 0)
        {
            throw new ArgumentException(
                "Quantidade devolvida vigente nao pode ser negativa",
                nameof(quantidadeDevolvidaAntesVigenteAteT));
        }

        return quantidadeComprada
            - quantidadeRecebidaAteT
            - quantidadePerdidaAteT
            - quantidadeDevolvidaAntesVigenteAteT;
    }

    public static bool PossuiPendenciaVigente(int pendenciaVigente)
    {
        return pendenciaVigente > 0;
    }

    public static bool DevolucaoAntesVigenteEm(
        CompraItemDevolucaoMomento momento,
        DateTime dataDevolucao,
        DateTime? dataCompensacao,
        DateTime referencia)
    {
        return momento == CompraItemDevolucaoMomento.AntesDoRecebimento
            && dataDevolucao <= referencia
            && (!dataCompensacao.HasValue || dataCompensacao.Value > referencia);
    }
}
