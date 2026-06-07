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
    private const string OrigemSaldoInicial = "SaldoInicial";

    private readonly IProdutoRepository _produtoRepository;
    private readonly IEstoqueMovimentacaoRepository _estoqueMovimentacaoRepository;
    private readonly IEventoFinanceiroRepository _eventoFinanceiroRepository;
    private readonly IClienteRepository _clienteRepository;
    private readonly IContaReceberRepository _contaReceberRepository;

    public ImplantacaoService(
        IProdutoRepository produtoRepository,
        IEstoqueMovimentacaoRepository estoqueMovimentacaoRepository,
        IEventoFinanceiroRepository eventoFinanceiroRepository,
        IClienteRepository clienteRepository,
        IContaReceberRepository contaReceberRepository)
    {
        _produtoRepository = produtoRepository;
        _estoqueMovimentacaoRepository = estoqueMovimentacaoRepository;
        _eventoFinanceiroRepository = eventoFinanceiroRepository;
        _clienteRepository = clienteRepository;
        _contaReceberRepository = contaReceberRepository;
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

    public async Task<SaldoInicialCaixaResultadoDto> RegistrarSaldoInicialCaixaAsync(RegistrarSaldoInicialCaixaDto dto)
    {
        if (dto == null) throw new ArgumentNullException(nameof(dto));

        var eventoFinanceiro = EventoFinanceiro.CriarSaldoInicialCaixa(
            dto.Valor,
            dto.Data,
            dto.Origem,
            dto.Descricao);

        await _eventoFinanceiroRepository.AdicionarAsync(eventoFinanceiro);

        return new SaldoInicialCaixaResultadoDto
        {
            EventoFinanceiroId = eventoFinanceiro.Id,
            Valor = eventoFinanceiro.Valor,
            Data = eventoFinanceiro.Data,
            Origem = eventoFinanceiro.Origem
        };
    }

    public async Task<ContaReceberInicialResultadoDto> RegistrarContaReceberInicialAsync(RegistrarContaReceberInicialDto dto)
    {
        if (dto == null) throw new ArgumentNullException(nameof(dto));
        if (dto.ClienteId == Guid.Empty) throw new ArgumentException("ClienteId e obrigatorio.", nameof(dto));
        if (dto.Valor <= 0) throw new ArgumentException("Valor deve ser maior que zero.", nameof(dto));
        if (dto.DataVencimento == default) throw new ArgumentException("DataVencimento e obrigatoria.", nameof(dto));
        if (!OrigemContaReceberInicialValida(dto.Origem))
        {
            throw new ArgumentException("Origem da conta a receber inicial deve ser SaldoInicial ou ImplantacaoInicial.", nameof(dto));
        }

        var cliente = await _clienteRepository.ObterPorIdAsync(dto.ClienteId);
        if (cliente == null)
        {
            throw new ArgumentException($"Cliente informado nao existe: {dto.ClienteId}.");
        }

        var conta = ContaReceber.CriarInicial(
            dto.ClienteId,
            dto.Valor,
            dto.DataVencimento,
            dto.Origem);

        await _contaReceberRepository.AdicionarAsync(conta);

        return new ContaReceberInicialResultadoDto
        {
            ContaReceberId = conta.Id,
            ClienteId = conta.ClienteId!.Value,
            Valor = conta.Valor,
            DataVencimento = conta.DataVencimento,
            Origem = conta.Origem
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

    private static bool OrigemContaReceberInicialValida(string origem)
    {
        return string.Equals(origem, OrigemSaldoInicial, StringComparison.OrdinalIgnoreCase)
            || string.Equals(origem, OrigemImplantacaoInicial, StringComparison.OrdinalIgnoreCase);
    }
}
