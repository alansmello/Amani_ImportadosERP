using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Mappers;

public static class CompraPerdaMapper
{
    public static PerdaCompraItemDto ToDto(CompraItemPerda perda)
    {
        return new PerdaCompraItemDto
        {
            Id = perda.Id,
            CompraId = perda.CompraId,
            ItemId = perda.CompraItemId,
            ProdutoId = perda.ProdutoId,
            Quantidade = perda.Quantidade,
            Motivo = perda.Motivo.ToString(),
            DataPerda = perda.DataPerda,
            Observacao = perda.Observacao
        };
    }
}
