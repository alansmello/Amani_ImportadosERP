using System.Linq;
using Amani.ImportadosERP.Application.DTOs.Response;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Mappers;

public static class VendaMapper
{
    public static VendaResponseDto ToResponse(Venda venda, decimal lucro)
    {
        if (venda == null) return null!;

        return new VendaResponseDto
        {
            Id = venda.Id,
            ClienteId = venda.ClienteId,
            DataVenda = venda.DataVenda,
            Desconto = venda.Desconto,
            Acrescimo = venda.Acrescimo,
            Total = venda.Total(),
            Lucro = lucro,
            FormaPagamento = venda.FormaPagamento,
            PercentualTaxaAplicado = venda.PercentualTaxaAplicado,
            Items = venda.Items.Select(i => new VendaItemResponseDto
            {
                Id = i.Id,
                ProdutoId = i.ProdutoId,
                ProdutoApresentacaoId = i.ProdutoApresentacaoId,
                ApresentacaoNome = i.ApresentacaoNomeSnapshot,
                FatorNumeradorAplicado = i.FatorNumeradorAplicado,
                FatorDenominadorAplicado = i.FatorDenominadorAplicado,
                FatorConversaoAplicado = i.FatorConversaoAplicado,
                QuantidadeConvertidaEstoque = i.QuantidadeConvertidaEstoque,
                Quantidade = i.Quantidade,
                PrecoUnitario = i.PrecoUnitario,
                Desconto = i.Desconto,
                Acrescimo = i.Acrescimo,
                ValorTotal = i.ValorTotal()
            }).ToList().AsReadOnly()
        };
    }
}
