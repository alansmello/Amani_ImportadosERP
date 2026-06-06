using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Services;

public class ImplantacaoService
{
    private const string OrigemImplantacaoInicial = "ImplantacaoInicial";

    private readonly IProdutoRepository _produtoRepository;
    private readonly IEstoqueMovimentacaoRepository _estoqueMovimentacaoRepository;

    public ImplantacaoService(
        IProdutoRepository produtoRepository,
        IEstoqueMovimentacaoRepository estoqueMovimentacaoRepository)
    {
        _produtoRepository = produtoRepository;
        _estoqueMovimentacaoRepository = estoqueMovimentacaoRepository;
    }

    public async Task<InventarioInicialResultadoDto> RegistrarInventarioInicialAsync(RegistrarInventarioInicialDto dto)
    {
        if (dto == null) throw new ArgumentNullException(nameof(dto));
        if (dto.Data == default) throw new ArgumentException("Data do inventario inicial e obrigatoria.", nameof(dto));
        if (!string.Equals(dto.Origem, OrigemImplantacaoInicial, StringComparison.OrdinalIgnoreCase))
            throw new ArgumentException("Origem do inventario inicial deve ser ImplantacaoInicial.", nameof(dto));
        if (dto.Itens == null || dto.Itens.Count == 0)
            throw new ArgumentException("Inventario inicial deve possuir ao menos um item.", nameof(dto));

        ValidarItensDuplicados(dto.Itens);

        var movimentacoes = new List<EstoqueMovimentacao>();

        foreach (var item in dto.Itens)
        {
            await ValidarItemAsync(item);

            movimentacoes.Add(new EstoqueMovimentacao(
                item.ProdutoId,
                item.Quantidade,
                TipoMovimentacao.InventarioInicial,
                valorUnitario: item.ValorUnitario,
                data: dto.Data));
        }

        await _estoqueMovimentacaoRepository.AdicionarRangeAsync(movimentacoes);

        return new InventarioInicialResultadoDto
        {
            Data = DateTime.SpecifyKind(dto.Data.Date, DateTimeKind.Utc),
            Origem = OrigemImplantacaoInicial,
            QuantidadeItens = movimentacoes.Count,
            MovimentacoesIds = movimentacoes.Select(m => m.Id).ToList()
        };
    }

    private static void ValidarItensDuplicados(IEnumerable<RegistrarInventarioInicialItemDto> itens)
    {
        var produtoDuplicado = itens
            .GroupBy(i => i.ProdutoId)
            .FirstOrDefault(g => g.Key != Guid.Empty && g.Count() > 1);

        if (produtoDuplicado != null)
        {
            throw new ArgumentException($"Produto duplicado no inventario inicial: {produtoDuplicado.Key}.");
        }
    }

    private async Task ValidarItemAsync(RegistrarInventarioInicialItemDto item)
    {
        if (item.ProdutoId == Guid.Empty) throw new ArgumentException("ProdutoId e obrigatorio.", nameof(item));
        if (item.Quantidade <= 0) throw new ArgumentException("Quantidade deve ser maior que zero.", nameof(item));
        if (item.ValorUnitario.HasValue && item.ValorUnitario.Value < 0)
            throw new ArgumentException("ValorUnitario nao pode ser negativo.", nameof(item));

        var produto = await _produtoRepository.ObterPorIdAsync(item.ProdutoId);
        if (produto == null)
        {
            throw new ArgumentException($"Produto informado nao existe: {item.ProdutoId}.");
        }
    }
}
