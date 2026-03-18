using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.DTOs.Response;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Application.Mappers;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Services;

public class VendaService
{
    private readonly IVendaRepository _vendaRepository;
    private readonly IEstoqueMovimentacaoRepository _estoqueRepository;
    private readonly IEstoqueConsultaRepository _estoqueConsulta;
    private readonly ICustoProdutoRepository _custoRepository;

    public VendaService(IVendaRepository vendaRepository, IEstoqueMovimentacaoRepository estoqueRepository, IEstoqueConsultaRepository estoqueConsulta, ICustoProdutoRepository custoRepository)
    {
        _vendaRepository = vendaRepository;
        _estoqueRepository = estoqueRepository;
        _estoqueConsulta = estoqueConsulta;
        _custoRepository = custoRepository;
    }

    public async Task<VendaResultDto> CreateAsync(CriarVendaDto dto)
    {
        var venda = new Venda(dto.ClienteId, dto.DataVenda ?? DateTime.UtcNow, dto.Desconto, dto.Acrescimo);

        foreach (var item in dto.Items)
        {
            var saldo = await _estoqueConsulta.ObterSaldoAsync(item.ProdutoId);
            if (saldo < item.Quantidade)
            {
                throw new InvalidOperationException($"Estoque insuficiente para o produto {item.ProdutoId}. Saldo: {saldo}, solicitado: {item.Quantidade}");
            }

            venda.AdicionarItem(item.ProdutoId, item.Quantidade, item.PrecoUnitario, item.Desconto, item.Acrescimo);
        }

        var movimentacoes = BuildMovimentacoes(venda);

        // Persist venda and related stock movements as a single logical operation.
        // For true atomicity the repositories should expose a UnitOfWork/transaction;
        // this method is prepared for that future change.
        await SaveVendaAndMovementsAsync(venda, movimentacoes);

        // Calcular lucro por item usando custo médio
        decimal lucroTotal = 0m;
        foreach (var item in venda.Items)
        {
            var custoMedio = await _custoRepository.ObterCustoMedioAsync(item.ProdutoId);
            var lucroItem = (item.PrecoUnitario - custoMedio) * item.Quantidade;
            lucroTotal += lucroItem;
        }

        return new VendaResultDto { Id = venda.Id, Lucro = lucroTotal };
    }

    private IEnumerable<EstoqueMovimentacao> BuildMovimentacoes(Venda venda)
    {
        return venda.Items.Select(i => new EstoqueMovimentacao(i.ProdutoId, i.Quantidade, TipoMovimentacao.Saida, null, venda.Id));
    }

    private async Task SaveVendaAndMovementsAsync(Venda venda, IEnumerable<EstoqueMovimentacao> movimentacoes)
    {
        // Persist the aggregate root first
        await _vendaRepository.AdicionarAsync(venda);

        // Then persist movements in batch if any. Repositories handle persistence details.
        var list = movimentacoes as IList<EstoqueMovimentacao> ?? movimentacoes.ToList();
        if (list.Count > 0)
        {
            await _estoqueRepository.AdicionarRangeAsync(list);
        }
    }

    public async Task<VendaResponseDto?> ObterPorIdAsync(Guid id)
    {
        var venda = await _vendaRepository.ObterPorIdAsync(id);
        if (venda == null) return null;

        // Calcular lucro para retornar no DTO
        decimal lucroTotal = 0m;
        foreach (var item in venda.Items)
        {
            var custoMedio = await _custoRepository.ObterCustoMedioAsync(item.ProdutoId);
            var lucroItem = (item.PrecoUnitario - custoMedio) * item.Quantidade;
            lucroTotal += lucroItem;
        }

        return VendaMapper.ToResponse(venda, lucroTotal);
    }
}
