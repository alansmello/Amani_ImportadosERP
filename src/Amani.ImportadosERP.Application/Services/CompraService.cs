using System;
using System.Collections.Generic;
using System.Linq;
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
    private readonly ICompraItemRecebimentoRepository _recebimentoRepository;
    private readonly ICompraItemPerdaRepository _perdaRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CompraService(
        ICompraRepository compraRepository,
        IEstoqueMovimentacaoRepository estoqueRepository,
        ICompraItemRecebimentoRepository recebimentoRepository,
        ICompraItemPerdaRepository perdaRepository,
        IUnitOfWork unitOfWork)
    {
        _compraRepository = compraRepository;
        _estoqueRepository = estoqueRepository;
        _recebimentoRepository = recebimentoRepository;
        _perdaRepository = perdaRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> CreateAsync(CriarCompraDto dto)
    {
        if (dto == null) throw new ArgumentNullException(nameof(dto));

        var compra = new Compra(dto.FornecedorId, dto.DataCompra ?? DateTime.UtcNow, dto.Desconto, dto.Acrescimo);

        foreach (var item in dto.Items)
        {
            compra.AdicionarItem(item.ProdutoId, item.Quantidade, item.CustoUnitario, item.Desconto, item.Acrescimo);
        }

        await _compraRepository.AdicionarAsync(compra);

        return compra.Id;
    }

    public async Task<CompraResponseDto?> ObterPorIdAsync(Guid id)
    {
        var compra = await _compraRepository.ObterPorIdAsync(id);
        return compra == null ? null : CompraMapper.ToResponse(compra);
    }

    public async Task<RecebimentoCompraItemDto> RegistrarRecebimentoItemAsync(
        Guid compraId,
        Guid itemId,
        RegistrarRecebimentoCompraItemDto dto)
    {
        if (dto == null) throw new ArgumentNullException(nameof(dto));

        CompraItemRecebimento? recebimento = null;

        await _unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            var compra = await ObterCompraComItemParaAtualizarAsync(compraId, itemId);
            var item = compra.Items.First(i => i.Id == itemId);

            item.ValidarRecebimento(dto.Quantidade);

            var movimentacao = new EstoqueMovimentacao(
                item.ProdutoId,
                dto.Quantidade,
                TipoMovimentacao.Entrada,
                compra.Id,
                null,
                item.CustoUnitario,
                dto.DataRecebimento,
                item.Id);

            recebimento = compra.RegistrarRecebimentoItem(
                item.Id,
                dto.Quantidade,
                dto.DataRecebimento,
                movimentacao.Id,
                dto.Observacao);

            await _recebimentoRepository.AdicionarSemSalvarAsync(recebimento);
            await _estoqueRepository.AdicionarSemSalvarAsync(movimentacao);
        });

        return CompraRecebimentoMapper.ToDto(recebimento!);
    }

    public async Task<PerdaCompraItemDto> RegistrarPerdaItemAsync(
        Guid compraId,
        Guid itemId,
        RegistrarPerdaCompraItemDto dto)
    {
        if (dto == null) throw new ArgumentNullException(nameof(dto));
        if (!Enum.TryParse<CompraItemPerdaMotivo>(dto.Motivo, true, out var motivo))
        {
            throw new ArgumentException("Motivo deve ser Perda, Extravio ou Avaria.", nameof(dto));
        }

        CompraItemPerda? perda = null;

        await _unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            var compra = await ObterCompraComItemParaAtualizarAsync(compraId, itemId);
            var item = compra.Items.First(i => i.Id == itemId);

            item.ValidarPerda(dto.Quantidade);
            perda = compra.RegistrarPerdaItem(item.Id, dto.Quantidade, motivo, dto.DataPerda, dto.Observacao);
            await _perdaRepository.AdicionarSemSalvarAsync(perda);
        });

        return CompraPerdaMapper.ToDto(perda!);
    }

    public async Task<IReadOnlyCollection<RecebimentoCompraItemDto>> ObterRecebimentosAsync(Guid compraId)
    {
        var recebimentos = await _recebimentoRepository.ObterPorCompraAsync(compraId);
        return recebimentos.Select(CompraRecebimentoMapper.ToDto).ToList().AsReadOnly();
    }

    public async Task<IReadOnlyCollection<PerdaCompraItemDto>> ObterPerdasAsync(Guid compraId)
    {
        var perdas = await _perdaRepository.ObterPorCompraAsync(compraId);
        return perdas.Select(CompraPerdaMapper.ToDto).ToList().AsReadOnly();
    }

    public async Task<IReadOnlyCollection<CompraEmTransitoDto>> ObterComprasEmTransitoAsync()
    {
        var compras = await _compraRepository.ObterTodasAsync();

        return compras
            .Where(c => CompraEstaEmTransito(c) && c.Items.Any(i => i.QuantidadePendente > 0))
            .Select(c => new CompraEmTransitoDto
            {
                CompraId = c.Id,
                FornecedorId = c.FornecedorId,
                DataCompra = c.DataCompra,
                Status = c.Status.ToString(),
                Itens = c.Items
                    .Where(i => i.QuantidadePendente > 0)
                    .Select(i => new CompraEmTransitoItemDto
                    {
                        ItemId = i.Id,
                        ProdutoId = i.ProdutoId,
                        QuantidadeComprada = i.Quantidade,
                        QuantidadeRecebida = i.QuantidadeRecebida,
                        QuantidadePerdida = i.QuantidadePerdida,
                        QuantidadePendente = i.QuantidadePendente
                    })
                    .ToList()
                    .AsReadOnly()
            })
            .ToList()
            .AsReadOnly();
    }

    public async Task<IReadOnlyCollection<ProdutoPendenteRecebimentoDto>> ObterProdutosPendentesRecebimentoAsync()
    {
        var compras = await _compraRepository.ObterTodasAsync();

        return compras
            .Where(CompraEstaEmTransito)
            .SelectMany(c => c.Items
                .Where(i => i.QuantidadePendente > 0)
                .Select(i => new ProdutoPendenteRecebimentoDto
                {
                    CompraId = c.Id,
                    ItemId = i.Id,
                    ProdutoId = i.ProdutoId,
                    FornecedorId = c.FornecedorId,
                    DataCompra = c.DataCompra,
                    StatusCompra = c.Status.ToString(),
                    QuantidadeComprada = i.Quantidade,
                    QuantidadeRecebida = i.QuantidadeRecebida,
                    QuantidadePerdida = i.QuantidadePerdida,
                    QuantidadePendente = i.QuantidadePendente
                }))
            .ToList()
            .AsReadOnly();
    }

    private async Task<Compra> ObterCompraComItemParaAtualizarAsync(Guid compraId, Guid itemId)
    {
        if (compraId == Guid.Empty) throw new ArgumentException("CompraId e obrigatorio", nameof(compraId));
        if (itemId == Guid.Empty) throw new ArgumentException("ItemId e obrigatorio", nameof(itemId));

        return await _compraRepository.ObterPorIdComItemParaAtualizarAsync(compraId, itemId)
            ?? throw new KeyNotFoundException("Compra ou item de compra nao encontrado");
    }

    private static bool CompraEstaEmTransito(Compra compra)
    {
        return compra.Status != CompraStatus.Recebida
            && compra.Status != CompraStatus.Finalizada
            && compra.Status != CompraStatus.Cancelada;
    }
}
