using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.DTOs.Response;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Application.Mappers;
using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Domain.Enums;

namespace Amani.ImportadosERP.Application.Services;

public class VendaService
{
    private readonly IVendaRepository _vendaRepository;
    private readonly IEstoqueMovimentacaoRepository _estoqueRepository;
    private readonly IEstoqueConsultaRepository _estoqueConsulta;
    private readonly ICustoProdutoRepository _custoRepository;
    private readonly IContaReceberRepository _contaReceberRepository;
    private readonly IConfiguracaoFormaPagamentoRepository _configuracaoFormaPagamentoRepository;
    private readonly IDespesaOperadoraRepository _despesaOperadoraRepository;
    private readonly IUnitOfWork _unitOfWork;

    public VendaService(
        IVendaRepository vendaRepository,
        IEstoqueMovimentacaoRepository estoqueRepository,
        IEstoqueConsultaRepository estoqueConsulta,
        ICustoProdutoRepository custoRepository,
        IContaReceberRepository contaReceberRepository,
        IConfiguracaoFormaPagamentoRepository configuracaoFormaPagamentoRepository,
        IDespesaOperadoraRepository despesaOperadoraRepository,
        IUnitOfWork unitOfWork)
    {
        _vendaRepository = vendaRepository;
        _estoqueRepository = estoqueRepository;
        _estoqueConsulta = estoqueConsulta;
        _custoRepository = custoRepository;
        _contaReceberRepository = contaReceberRepository;
        _configuracaoFormaPagamentoRepository = configuracaoFormaPagamentoRepository;
        _despesaOperadoraRepository = despesaOperadoraRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<VendaResultDto> CreateAsync(CriarVendaDto dto)
    {
        if (!dto.FormaPagamento.HasValue)
        {
            throw new InvalidOperationException("Forma de pagamento obrigatoria");
        }

        var formaPagamento = dto.FormaPagamento.Value;
        ValidarOverrideParaForma(formaPagamento, dto.PercentualTaxaOverride);
        var percentualTaxa = await ResolverPercentualTaxaAsync(formaPagamento, dto.PercentualTaxaOverride);
        var venda = new Venda(
            dto.ClienteId,
            dto.DataVenda ?? DateTime.UtcNow,
            dto.Desconto,
            dto.Acrescimo,
            formaPagamento,
            EhCartaoDebito(formaPagamento) ? percentualTaxa : null);

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
        var valorBruto = venda.Total();
        var valorLiquido = CalcularValorLiquido(valorBruto, formaPagamento, percentualTaxa);
        var contaReceber = new ContaReceber(venda.Id, venda.ClienteId, valorBruto, ObterVencimentoInicial(venda));
        PagamentoRecebido? pagamentoInicial = CriarPagamentoInicial(contaReceber.Id, formaPagamento, valorBruto, valorLiquido);
        DespesaOperadora? despesaOperadora = CriarDespesaOperadora(venda, formaPagamento, valorBruto, valorLiquido, percentualTaxa);

        await _unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            await SaveVendaAndMovementsAsync(venda, movimentacoes);
            await _contaReceberRepository.AdicionarAsync(contaReceber);

            if (pagamentoInicial != null)
            {
                await _contaReceberRepository.AdicionarPagamentoAsync(pagamentoInicial);
            }

            if (despesaOperadora != null)
            {
                await _despesaOperadoraRepository.AdicionarAsync(despesaOperadora);
            }
        });

        decimal lucroTotal = 0m;
        foreach (var item in venda.Items)
        {
            var custoMedio = await _custoRepository.ObterCustoMedioAsync(item.ProdutoId);
            lucroTotal += item.ValorTotal() - custoMedio * item.Quantidade;
        }

        return new VendaResultDto
        {
            Id = venda.Id,
            Lucro = lucroTotal,
            FormaPagamento = formaPagamento,
            StatusFinanceiro = pagamentoInicial != null ? "Pago" : "Pendente",
            ContaReceberId = contaReceber.Id,
            ValorBruto = valorBruto,
            ValorLiquido = valorLiquido,
            PercentualTaxaAplicado = EhCartaoDebito(formaPagamento) ? percentualTaxa : null,
            DespesaOperadoraId = despesaOperadora?.Id,
            MensagemFinanceira = pagamentoInicial != null
                ? "Recebido imediatamente"
                : "Conta a receber gerada"
        };
    }

    private async Task<decimal> ResolverPercentualTaxaAsync(FormaPagamento formaPagamento, decimal? percentualTaxaOverride)
    {
        if (!EhCartaoDebito(formaPagamento))
        {
            return 0m;
        }

        if (percentualTaxaOverride.HasValue)
        {
            ValidarTaxaDebito(percentualTaxaOverride.Value);
            return percentualTaxaOverride.Value;
        }

        var configuracao = await _configuracaoFormaPagamentoRepository.ObterPorFormaAsync(formaPagamento);
        var percentualConfigurado = configuracao?.PercentualTaxa ?? 0m;
        ValidarTaxaDebito(percentualConfigurado);
        return percentualConfigurado;
    }

    private static void ValidarOverrideParaForma(FormaPagamento formaPagamento, decimal? percentualTaxaOverride)
    {
        if (!percentualTaxaOverride.HasValue)
        {
            return;
        }

        if (!EhCartaoDebito(formaPagamento))
        {
            throw new InvalidOperationException("Taxa invalida para esta forma de pagamento");
        }

        ValidarTaxaDebito(percentualTaxaOverride.Value);
    }

    private static void ValidarTaxaDebito(decimal percentualTaxa)
    {
        if (percentualTaxa < 0 || percentualTaxa >= 100)
        {
            throw new InvalidOperationException("Taxa de debito invalida");
        }
    }

    private static bool EhCartaoDebito(FormaPagamento formaPagamento)
    {
        return formaPagamento == FormaPagamento.CartaoDebito;
    }

    private static decimal CalcularValorLiquido(decimal valorBruto, FormaPagamento formaPagamento, decimal percentualTaxa)
    {
        if (formaPagamento != FormaPagamento.CartaoDebito)
        {
            return valorBruto;
        }

        var valorLiquido = decimal.Round(valorBruto * (1 - percentualTaxa / 100), 2, MidpointRounding.AwayFromZero);
        if (valorLiquido <= 0)
        {
            throw new InvalidOperationException("Taxa invalida");
        }

        return valorLiquido;
    }

    private static DateTime ObterVencimentoInicial(Venda venda)
    {
        return venda.FormaPagamento switch
        {
            FormaPagamento.CartaoCredito => ProximoDiaUtil(venda.DataVenda),
            _ => venda.DataVenda
        };
    }

    private static DateTime ProximoDiaUtil(DateTime data)
    {
        var proximoDia = data.Date.AddDays(1);
        while (proximoDia.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday)
        {
            proximoDia = proximoDia.AddDays(1);
        }

        return DateTime.SpecifyKind(proximoDia, DateTimeKind.Utc);
    }

    private static PagamentoRecebido? CriarPagamentoInicial(Guid contaReceberId, FormaPagamento formaPagamento, decimal valorBruto, decimal valorLiquido)
    {
        return formaPagamento switch
        {
            FormaPagamento.Dinheiro or FormaPagamento.PIX => new PagamentoRecebido(contaReceberId, valorBruto, 0m, valorBruto),
            FormaPagamento.CartaoDebito => new PagamentoRecebido(contaReceberId, valorLiquido, 0m, valorBruto),
            _ => null
        };
    }

    private static DespesaOperadora? CriarDespesaOperadora(Venda venda, FormaPagamento formaPagamento, decimal valorBruto, decimal valorLiquido, decimal percentualTaxa)
    {
        if (formaPagamento != FormaPagamento.CartaoDebito || valorLiquido >= valorBruto)
        {
            return null;
        }

        return new DespesaOperadora(venda.Id, formaPagamento, valorBruto, valorLiquido, percentualTaxa);
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

        decimal lucroTotal = 0m;
        foreach (var item in venda.Items)
        {
            var custoMedio = await _custoRepository.ObterCustoMedioAsync(item.ProdutoId);
            lucroTotal += item.ValorTotal() - custoMedio * item.Quantidade;
        }

        return VendaMapper.ToResponse(venda, lucroTotal);
    }
}
