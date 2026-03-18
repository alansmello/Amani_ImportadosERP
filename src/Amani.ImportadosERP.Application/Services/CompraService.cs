using System;
using System.Threading.Tasks;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.DTOs.Response;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Application.Mappers;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Services;

public class CompraService
{
    private readonly ICompraRepository _compraRepository;
    private readonly IEstoqueMovimentacaoRepository _estoqueRepository;

    public CompraService(ICompraRepository compraRepository, IEstoqueMovimentacaoRepository estoqueRepository)
    {
        _compraRepository = compraRepository;
        _estoqueRepository = estoqueRepository;
    }

    public async Task<Guid> CreateAsync(CriarCompraDto dto)
    {
        var compra = new Compra(dto.FornecedorId, dto.DataCompra ?? DateTime.UtcNow, dto.Desconto, dto.Acrescimo);

        foreach (var item in dto.Items)
        {
            compra.AdicionarItem(item.ProdutoId, item.Quantidade, item.CustoUnitario, item.Desconto, item.Acrescimo);
        }

        await _compraRepository.AdicionarAsync(compra);

        // Registrar movimentações de estoque (Entrada) para cada item — em lote
        var movimentacoes = new System.Collections.Generic.List<EstoqueMovimentacao>();
        foreach (var item in compra.Items)
        {
            movimentacoes.Add(new EstoqueMovimentacao(item.ProdutoId, item.Quantidade, TipoMovimentacao.Entrada, compra.Id, null, item.CustoUnitario));
        }

        if (movimentacoes.Count > 0)
        {
            await _estoqueRepository.AdicionarRangeAsync(movimentacoes);
        }

        return compra.Id;
    }

    public async Task<CompraResponseDto?> ObterPorIdAsync(Guid id)
    {
        var compra = await _compraRepository.ObterPorIdAsync(id);
        return compra == null ? null : CompraMapper.ToResponse(compra);
    }
}
