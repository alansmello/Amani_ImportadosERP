using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Queries.Handlers;

public sealed class ObterMovimentacoesProdutoQueryHandler
    : IRequestHandler<ObterMovimentacoesProdutoQuery, EstoqueProdutoMovimentacoesDto>
{
    private const int LimitePadrao = 50;
    private const int LimiteMaximo = 200;

    private readonly IProdutoRepository _produtoRepository;
    private readonly IEstoqueConsultaRepository _estoqueConsultaRepository;

    public ObterMovimentacoesProdutoQueryHandler(
        IProdutoRepository produtoRepository,
        IEstoqueConsultaRepository estoqueConsultaRepository)
    {
        _produtoRepository = produtoRepository;
        _estoqueConsultaRepository = estoqueConsultaRepository;
    }

    public async Task<EstoqueProdutoMovimentacoesDto> Handle(
        ObterMovimentacoesProdutoQuery request,
        CancellationToken cancellationToken)
    {
        if (request.ProdutoId == Guid.Empty)
        {
            throw new ArgumentException("ProdutoId e obrigatorio", nameof(request.ProdutoId));
        }

        var dataInicio = NormalizarInicio(request.DataInicio);
        var dataFim = NormalizarFim(request.DataFim);

        if (dataInicio.HasValue && dataFim.HasValue && dataInicio.Value > dataFim.Value)
        {
            throw new ArgumentException("DataInicio nao pode ser posterior a DataFim");
        }

        var tipo = NormalizarTipo(request.Tipo);
        var limite = NormalizarLimite(request.Limite);

        var produto = await _produtoRepository.ObterPorIdAsync(request.ProdutoId)
            ?? throw new KeyNotFoundException("Produto nao encontrado");

        var saldoAtual = await _estoqueConsultaRepository.ObterSaldoAsync(request.ProdutoId);
        var totalMovimentacoes = await _estoqueConsultaRepository.ContarMovimentacoesAsync(
            request.ProdutoId,
            dataInicio,
            dataFim,
            tipo);
        var movimentacoes = await _estoqueConsultaRepository.ObterMovimentacoesAsync(
            request.ProdutoId,
            dataInicio,
            dataFim,
            tipo,
            limite);

        return new EstoqueProdutoMovimentacoesDto
        {
            ProdutoId = produto.Id,
            NomeProduto = produto.Nome,
            SaldoAtual = saldoAtual,
            TotalMovimentacoes = totalMovimentacoes,
            Movimentacoes = movimentacoes
                .Select(MapearMovimentacao)
                .ToList()
        };
    }

    private static DateTime? NormalizarInicio(DateTime? dataInicio)
    {
        if (!dataInicio.HasValue)
        {
            return null;
        }

        return DateTime.SpecifyKind(dataInicio.Value.Date, DateTimeKind.Utc);
    }

    private static DateTime? NormalizarFim(DateTime? dataFim)
    {
        if (!dataFim.HasValue)
        {
            return null;
        }

        return DateTime.SpecifyKind(
            dataFim.Value.Date.AddHours(23).AddMinutes(59).AddSeconds(59),
            DateTimeKind.Utc);
    }

    private static TipoMovimentacao? NormalizarTipo(string? tipo)
    {
        if (string.IsNullOrWhiteSpace(tipo))
        {
            return null;
        }

        if (!Enum.TryParse<TipoMovimentacao>(tipo.Trim(), ignoreCase: true, out var tipoMovimentacao))
        {
            throw new ArgumentException("Tipo de movimentacao invalido", nameof(tipo));
        }

        return tipoMovimentacao;
    }

    private static int NormalizarLimite(int? limite)
    {
        if (!limite.HasValue)
        {
            return LimitePadrao;
        }

        if (limite.Value <= 0)
        {
            throw new ArgumentException("Limite deve ser maior que zero", nameof(limite));
        }

        return Math.Min(limite.Value, LimiteMaximo);
    }

    private static EstoqueMovimentacaoItemDto MapearMovimentacao(EstoqueMovimentacaoItemDto movimentacao)
    {
        return new EstoqueMovimentacaoItemDto
        {
            Id = movimentacao.Id,
            Data = movimentacao.Data,
            Tipo = movimentacao.Tipo,
            Quantidade = movimentacao.Quantidade,
            Origem = movimentacao.Origem,
            CompraId = movimentacao.CompraId,
            CompraItemId = movimentacao.CompraItemId,
            VendaId = movimentacao.VendaId,
            ValorUnitario = movimentacao.ValorUnitario
        };
    }
}
