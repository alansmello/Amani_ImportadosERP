using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Infra.Data.Context;

namespace Amani.ImportadosERP.Infra.Data.Repositories;

public class ContaReceberRepository : IContaReceberRepository
{
    private readonly AmaniDbContext _context;

    public ContaReceberRepository(AmaniDbContext context)
    {
        _context = context;
    }

    public async Task AdicionarAsync(ContaReceber conta)
    {
        if (conta == null) throw new ArgumentNullException(nameof(conta));

        await _context.ContasReceber.AddAsync(conta);
        await _context.SaveChangesAsync();
    }

    public Task RemoverAsync(ContaReceber conta)
    {
        if (conta == null) throw new ArgumentNullException(nameof(conta));
        _context.ContasReceber.Remove(conta);
        return Task.CompletedTask;
    }

    public async Task<ContaReceber?> ObterPorIdAsync(Guid id)
    {
        if (id == Guid.Empty) return null;

        return await _context.ContasReceber
            .Include(c => c.Pagamentos)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<List<ContaReceber>> ObterPorVendaIdAsync(Guid vendaId)
    {
        if (vendaId == Guid.Empty) return new List<ContaReceber>();

        return await _context.ContasReceber
            .Include(c => c.Pagamentos)
            .Where(c => c.VendaId == vendaId)
            .ToListAsync();
    }

    public async Task<List<ContaReceber>> ObterTodasAsync()
    {
        return await _context.ContasReceber
            .Include(c => c.Pagamentos)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<List<ContaReceberPorClienteDto>> ObterEmAbertoPorClienteAsync()
    {
        var contas = await _context.ContasReceber
            .AsNoTracking()
            .Include(c => c.Pagamentos)
            .ToListAsync();

        if (!contas.Any()) return new List<ContaReceberPorClienteDto>();

        var vendas = await _context.Vendas
            .AsNoTracking()
            .ToDictionaryAsync(v => v.Id, v => v.ClienteId);

        var clientes = await _context.Clientes
            .AsNoTracking()
            .Select(c => new { c.Id, c.Nome })
            .ToDictionaryAsync(c => c.Id);

        return contas
            .Select(c =>
            {
                var saldo = c.Valor - c.Pagamentos.Sum(p => p.ValorBrutoLiquidado);
                var clienteId = ResolverClienteId(c, vendas);
                if (!clienteId.HasValue) return null;

                var nomeCliente = clientes.TryGetValue(clienteId.Value, out var cliente)
                    ? cliente.Nome
                    : "Cliente nao informado";

                return new
                {
                    ClienteId = clienteId.Value,
                    NomeCliente = nomeCliente,
                    Saldo = saldo
                };
            })
            .Where(x => x != null && x.Saldo > 0)
            .GroupBy(x => new { x!.ClienteId, x.NomeCliente })
            .Select(g => new ContaReceberPorClienteDto
            {
                ClienteId = g.Key.ClienteId,
                NomeCliente = g.Key.NomeCliente,
                TotalAReceber = g.Sum(x => x!.Saldo)
            })
            .OrderByDescending(x => x.TotalAReceber)
            .ToList();
    }

    public async Task<List<ContaReceberDetalheDto>> ObterEmAbertoDetalhePorClienteAsync(Guid clienteId)
    {
        if (clienteId == Guid.Empty) return new List<ContaReceberDetalheDto>();

        var vendasDoCliente = await _context.Vendas
            .AsNoTracking()
            .Where(v => v.ClienteId == clienteId)
            .Select(v => new { v.Id, v.FormaPagamento })
            .ToListAsync();

        var vendaIds = vendasDoCliente.Select(v => v.Id).ToList();
        var formaPagamentoPorVenda = vendasDoCliente
            .ToDictionary(v => v.Id, v => v.FormaPagamento.ToString());

        var contas = await _context.ContasReceber
            .AsNoTracking()
            .Include(c => c.Pagamentos)
            .Where(c => c.ClienteId == clienteId || (c.VendaId.HasValue && vendaIds.Contains(c.VendaId.Value)))
            .ToListAsync();

        return contas
            .Select(c =>
            {
                var totalPago = c.Pagamentos.Sum(p => p.ValorBrutoLiquidado);
                var saldo = c.Valor - totalPago;
                var formaPagamento = c.VendaId.HasValue
                    && formaPagamentoPorVenda.TryGetValue(c.VendaId.Value, out var forma)
                        ? forma
                        : null;

                return new ContaReceberDetalheDto
                {
                    ContaId = c.Id,
                    VendaId = c.VendaId,
                    ClienteId = c.ClienteId,
                    Origem = c.Origem,
                    FormaPagamento = formaPagamento,
                    ValorTotal = c.Valor,
                    TotalPago = totalPago,
                    Saldo = saldo,
                    DataVencimento = c.DataVencimento,
                    Status = saldo <= 0 ? "Pago" : "Pendente",
                    Pagamentos = c.Pagamentos
                        .Select(p => new PagamentoDetalheDto
                        {
                            Id = p.Id,
                            Valor = p.Valor,
                            Desconto = p.Desconto,
                            ValorBrutoLiquidado = p.ValorBrutoLiquidado,
                            DataPagamento = p.DataPagamento
                        })
                        .ToList()
                };
            })
            .Where(x => x.Saldo > 0)
            .OrderBy(x => x.DataVencimento)
            .ToList();
    }

    public async Task SalvarAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task AdicionarPagamentoAsync(PagamentoRecebido pagamento)
    {
        await _context.PagamentosRecebidos.AddAsync(pagamento);
        await _context.SaveChangesAsync();
    }

    private static Guid? ResolverClienteId(ContaReceber conta, IReadOnlyDictionary<Guid, Guid> vendas)
    {
        if (conta.ClienteId.HasValue) return conta.ClienteId.Value;
        if (!conta.VendaId.HasValue) return null;

        return vendas.TryGetValue(conta.VendaId.Value, out var venda)
            ? venda
            : null;
    }
}
