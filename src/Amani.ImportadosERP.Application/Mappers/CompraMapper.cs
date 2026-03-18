using System.Linq;
using Amani.ImportadosERP.Application.DTOs.Response;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Mappers;

public static class CompraMapper
{
    public static CompraResponseDto ToResponse(Compra compra)
    {
        if (compra == null) return null!;

        return new CompraResponseDto
        {
            Id = compra.Id,
            FornecedorId = compra.FornecedorId,
            DataCompra = compra.DataCompra,
            Desconto = compra.Desconto,
            Acrescimo = compra.Acrescimo,
            Total = compra.Total(),
            Items = compra.Items.Select(i => new CompraItemResponseDto
            {
                Id = i.Id,
                ProdutoId = i.ProdutoId,
                Quantidade = i.Quantidade,
                CustoUnitario = i.CustoUnitario,
                Desconto = i.Desconto,
                Acrescimo = i.Acrescimo,
                ValorTotal = i.ValorTotal()
            }).ToList().AsReadOnly()
        };
    }
}
