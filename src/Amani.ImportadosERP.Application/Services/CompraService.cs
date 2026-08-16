using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.DTOs.Devolucoes;
using Amani.ImportadosERP.Application.DTOs.Reembolsos;
using Amani.ImportadosERP.Application.DTOs.Response;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Application.Mappers;
using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Domain.Services;

namespace Amani.ImportadosERP.Application.Services;

public class CompraService
{
    private readonly ICompraRepository _compraRepository;
    private readonly IEstoqueMovimentacaoRepository _estoqueRepository;
    private readonly IEstoqueConsultaRepository _estoqueConsultaRepository;
    private readonly ICompraItemRecebimentoRepository _recebimentoRepository;
    private readonly ICompraItemPerdaRepository _perdaRepository;
    private readonly ICompraItemDevolucaoRepository _devolucaoRepository;
    private readonly ICompraReembolsoRepository _reembolsoRepository;
    private readonly IFeatureSettings _features;
    private readonly IUnitOfWork _unitOfWork;

    public CompraService(
        ICompraRepository compraRepository,
        IEstoqueMovimentacaoRepository estoqueRepository,
        IEstoqueConsultaRepository estoqueConsultaRepository,
        ICompraItemRecebimentoRepository recebimentoRepository,
        ICompraItemPerdaRepository perdaRepository,
        ICompraItemDevolucaoRepository devolucaoRepository,
        ICompraReembolsoRepository reembolsoRepository,
        IFeatureSettings features,
        IUnitOfWork unitOfWork)
    {
        _compraRepository = compraRepository;
        _estoqueRepository = estoqueRepository;
        _estoqueConsultaRepository = estoqueConsultaRepository;
        _recebimentoRepository = recebimentoRepository;
        _perdaRepository = perdaRepository;
        _devolucaoRepository = devolucaoRepository;
        _reembolsoRepository = reembolsoRepository;
        _features = features;
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
        if (compra == null) return null;

        var reembolsos = await _reembolsoRepository.ObterPorCompraAsync(id);
        var devolucoes = await _devolucaoRepository.ObterPorCompraAsync(id);
        var resumo = CompraCalculoFinanceiro.CalcularResumoReembolso(
            compra.Total(),
            reembolsos.Sum(r => r.Valor),
            reembolsos.Where(r => r.Cancelamento != null).Sum(r => r.Valor));
        var resumosDevolucao = CalcularResumosDevolucaoPorItem(devolucoes);

        return CompraMapper.ToResponse(compra, resumo, resumosDevolucao);
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

    public async Task<CompraReembolsoDto> RegistrarReembolsoAsync(Guid compraId, RegistrarCompraReembolsoDto dto)
    {
        if (dto == null) throw new ArgumentNullException(nameof(dto));
        if (!_features.DevolucoesReembolsosComprasEnabled)
        {
            throw new InvalidOperationException("FEATURE_DESABILITADA");
        }

        CompraReembolso? reembolso = await _reembolsoRepository.ObterPorOperacaoIdAsync(dto.OperacaoId);
        if (reembolso != null)
        {
            if (reembolso.CompraId != compraId
                || reembolso.Valor != decimal.Round(dto.Valor, 2, MidpointRounding.AwayFromZero)
                || reembolso.DataReembolso.Date != dto.DataReembolso.Date)
            {
                throw new InvalidOperationException("OPERACAO_ID_REUTILIZADA");
            }

            return CompraReembolsoMapper.ToDto(reembolso);
        }

        await _unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            var compra = await _compraRepository.ObterPorIdParaAtualizarAsync(compraId)
                ?? throw new KeyNotFoundException("COMPRA_NAO_ENCONTRADA");

            if (compra.Status == CompraStatus.Cancelada)
            {
                throw new InvalidOperationException("Compra cancelada nao aceita reembolso");
            }

            var dataReembolso = NormalizarDataEfetiva(dto.DataReembolso);
            if (dataReembolso > DateTime.UtcNow.Date || dataReembolso < compra.DataCompra.Date)
            {
                throw new ArgumentException("Data de reembolso invalida", nameof(dto));
            }

            if (!string.IsNullOrWhiteSpace(dto.ReferenciaExterna)
                && await _reembolsoRepository.ExisteReferenciaExternaAsync(compraId, dto.ReferenciaExterna))
            {
                throw new InvalidOperationException("REFERENCIA_EXTERNA_DUPLICADA");
            }

            var totalOriginal = compra.Total();
            var totalLiquidoAtual = await _reembolsoRepository.ObterTotalLiquidoPorCompraAsync(compraId);
            var resumoAtual = CompraCalculoFinanceiro.CalcularResumoReembolso(totalOriginal, totalLiquidoAtual, 0m);
            if (dto.Valor <= 0m || dto.Valor > resumoAtual.SaldoReembolsavel)
            {
                throw new InvalidOperationException("LIMITE_REEMBOLSO_EXCEDIDO");
            }

            reembolso = new CompraReembolso(
                compraId,
                dto.Valor,
                dataReembolso,
                dto.OperacaoId,
                dto.ReferenciaExterna,
                dto.Observacao);

            var alocacoes = dto.Alocacoes ?? Array.Empty<RegistrarCompraReembolsoAlocacaoDto>();
            if (alocacoes.Sum(a => a.Valor) > dto.Valor)
            {
                throw new InvalidOperationException("Soma das alocacoes nao pode exceder o valor do reembolso");
            }

            foreach (var alocacaoDto in alocacoes)
            {
                var itemAlocado = compra.Items.FirstOrDefault(i => i.Id == alocacaoDto.CompraItemId)
                    ?? throw new KeyNotFoundException("ITEM_NAO_ENCONTRADO");

                if (alocacaoDto.CompraItemPerdaId.HasValue)
                {
                    var perda = compra.Perdas.FirstOrDefault(p =>
                        p.Id == alocacaoDto.CompraItemPerdaId.Value
                        && p.CompraItemId == itemAlocado.Id);
                    if (perda == null)
                    {
                        throw new KeyNotFoundException("PERDA_NAO_ENCONTRADA");
                    }
                }

                if (alocacaoDto.CompraItemDevolucaoId.HasValue)
                {
                    var devolucao = await _devolucaoRepository.ObterPorIdAsync(alocacaoDto.CompraItemDevolucaoId.Value)
                        ?? throw new KeyNotFoundException("DEVOLUCAO_NAO_ENCONTRADA");
                    if (devolucao.CompraId != compra.Id || devolucao.CompraItemId != itemAlocado.Id)
                    {
                        throw new KeyNotFoundException("DEVOLUCAO_NAO_ENCONTRADA");
                    }

                    if (devolucao.Compensacao != null)
                    {
                        throw new InvalidOperationException("REGISTRO_JA_COMPENSADO");
                    }
                }

                reembolso.AdicionarAlocacao(new CompraReembolsoAlocacao(
                    reembolso.Id,
                    alocacaoDto.CompraItemId,
                    alocacaoDto.Valor,
                    alocacaoDto.CompraItemPerdaId,
                    alocacaoDto.CompraItemDevolucaoId));
            }

            await _reembolsoRepository.AdicionarSemSalvarAsync(reembolso);
        });

        return CompraReembolsoMapper.ToDto(reembolso!);
    }

    public async Task<CompraItemDevolucaoDto> RegistrarDevolucaoAsync(
        Guid compraId,
        Guid itemId,
        RegistrarCompraItemDevolucaoDto dto)
    {
        if (dto == null) throw new ArgumentNullException(nameof(dto));
        if (!_features.DevolucoesReembolsosComprasEnabled)
        {
            throw new InvalidOperationException("FEATURE_DESABILITADA");
        }

        if (!Enum.TryParse<CompraItemDevolucaoMotivo>(dto.Motivo, true, out var motivo))
        {
            throw new ArgumentException("Motivo de devolucao invalido", nameof(dto));
        }

        if (!Enum.TryParse<CompraItemDevolucaoMomento>(dto.Momento, true, out var momento))
        {
            throw new ArgumentException("Momento de devolucao invalido", nameof(dto));
        }

        var existente = await _devolucaoRepository.ObterPorOperacaoIdAsync(dto.OperacaoId);
        if (existente != null)
        {
            if (existente.CompraId != compraId
                || existente.CompraItemId != itemId
                || existente.Momento != momento
                || existente.CompraItemRecebimentoId != dto.CompraItemRecebimentoId
                || existente.Quantidade != dto.Quantidade
                || existente.DataDevolucao.Date != dto.DataDevolucao.Date)
            {
                throw new InvalidOperationException("OPERACAO_ID_REUTILIZADA");
            }

            return CompraDevolucaoMapper.ToDto(existente);
        }

        CompraItemDevolucao? devolucao = null;

        await _unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            var compra = await ObterCompraComItemParaAtualizarAsync(compraId, itemId);
            if (compra.Status == CompraStatus.Cancelada || compra.Status == CompraStatus.Finalizada)
            {
                throw new InvalidOperationException($"Compra {compra.Status} nao aceita registro de devolucao");
            }

            var item = compra.Items.First(i => i.Id == itemId);
            var dataDevolucao = NormalizarDataEfetiva(dto.DataDevolucao);
            if (dataDevolucao > DateTime.UtcNow.Date || dataDevolucao < compra.DataCompra.Date)
            {
                throw new ArgumentException("Data de devolucao invalida", nameof(dto));
            }

            Guid? estoqueMovimentacaoId = null;

            if (momento == CompraItemDevolucaoMomento.AntesDoRecebimento)
            {
                if (dto.CompraItemRecebimentoId.HasValue)
                {
                    throw new ArgumentException("Recebimento deve ser nulo antes do recebimento", nameof(dto));
                }

                var quantidadeDevolvidaAntes = await _devolucaoRepository
                    .ObterQuantidadeVigenteAntesRecebimentoAsync(itemId);
                item.ValidarDevolucaoAntesRecebimento(dto.Quantidade, quantidadeDevolvidaAntes);
            }
            else
            {
                var recebimentoId = dto.CompraItemRecebimentoId
                    ?? throw new ArgumentException("Recebimento e obrigatorio depois do recebimento", nameof(dto));
                var recebimento = item.Recebimentos.FirstOrDefault(r => r.Id == recebimentoId)
                    ?? throw new KeyNotFoundException("RECEBIMENTO_NAO_ENCONTRADO");

                if (dataDevolucao < recebimento.DataRecebimento.Date)
                {
                    throw new ArgumentException("Data de devolucao nao pode ser anterior ao recebimento", nameof(dto));
                }

                var quantidadeJaDevolvida = await _devolucaoRepository
                    .ObterQuantidadeVigenteDepoisRecebimentoAsync(recebimento.Id);
                var quantidadeElegivel = recebimento.Quantidade - quantidadeJaDevolvida;
                if (dto.Quantidade <= 0 || dto.Quantidade > quantidadeElegivel)
                {
                    throw new InvalidOperationException("QUANTIDADE_DEVOLUCAO_EXCEDIDA");
                }

                var saldoAtual = await _estoqueConsultaRepository.ObterSaldoAsync(item.ProdutoId);
                if (dto.Quantidade > saldoAtual)
                {
                    throw new InvalidOperationException("ESTOQUE_INSUFICIENTE");
                }

                var movimentacao = new EstoqueMovimentacao(
                    item.ProdutoId,
                    dto.Quantidade,
                    TipoMovimentacao.Saida,
                    valorUnitario: recebimento.ValorUnitario,
                    data: dataDevolucao);
                estoqueMovimentacaoId = movimentacao.Id;
                await _estoqueRepository.AdicionarSemSalvarAsync(movimentacao);
            }

            devolucao = new CompraItemDevolucao(
                compra.Id,
                item.Id,
                momento,
                dto.Quantidade,
                motivo,
                dataDevolucao,
                dto.OperacaoId,
                dto.CompraItemRecebimentoId,
                estoqueMovimentacaoId,
                observacao: dto.Observacao);

            await _devolucaoRepository.AdicionarSemSalvarAsync(devolucao);
        });

        return CompraDevolucaoMapper.ToDto(devolucao!);
    }

    public async Task<(CompraItemDevolucaoDto Devolucao, bool Criada)> CompensarDevolucaoAsync(
        Guid compraId,
        Guid devolucaoId,
        CompensarCompraItemDevolucaoDto dto)
    {
        if (dto == null) throw new ArgumentNullException(nameof(dto));
        if (!_features.DevolucoesReembolsosComprasEnabled)
        {
            throw new InvalidOperationException("FEATURE_DESABILITADA");
        }

        var compensacaoExistente = await _devolucaoRepository.ObterCompensacaoPorOperacaoIdAsync(dto.OperacaoId);
        if (compensacaoExistente != null)
        {
            if (compensacaoExistente.CompraItemDevolucaoId != devolucaoId
                || compensacaoExistente.DataCompensacao.Date != dto.DataCompensacao.Date)
            {
                throw new InvalidOperationException("OPERACAO_ID_REUTILIZADA");
            }

            var devolucaoExistente = await _devolucaoRepository.ObterPorIdAsync(devolucaoId)
                ?? throw new KeyNotFoundException("DEVOLUCAO_NAO_ENCONTRADA");
            if (devolucaoExistente.CompraId != compraId)
            {
                throw new InvalidOperationException("OPERACAO_ID_REUTILIZADA");
            }

            return (CompraDevolucaoMapper.ToDto(devolucaoExistente), false);
        }

        await _unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            var devolucao = await _devolucaoRepository.ObterPorIdParaAtualizarAsync(devolucaoId)
                ?? throw new KeyNotFoundException("DEVOLUCAO_NAO_ENCONTRADA");

            if (devolucao.CompraId != compraId)
            {
                throw new KeyNotFoundException("DEVOLUCAO_NAO_ENCONTRADA");
            }

            if (devolucao.Compensacao != null)
            {
                throw new InvalidOperationException("REGISTRO_JA_COMPENSADO");
            }

            var dataCompensacao = NormalizarDataEfetiva(dto.DataCompensacao);
            if (dataCompensacao > DateTime.UtcNow.Date || dataCompensacao < devolucao.DataDevolucao.Date)
            {
                throw new ArgumentException("Data de compensacao invalida", nameof(dto));
            }

            Guid? estoqueMovimentacaoId = null;
            var presencaFisicaConfirmada = false;

            if (devolucao.Momento == CompraItemDevolucaoMomento.DepoisDoRecebimento)
            {
                if (!dto.PresencaFisicaConfirmada)
                {
                    throw new InvalidOperationException("PRESENCA_FISICA_NAO_CONFIRMADA");
                }

                var item = devolucao.CompraItem
                    ?? throw new InvalidOperationException("ITEM_DEVOLUCAO_NAO_CARREGADO");
                var recebimento = devolucao.CompraItemRecebimento
                    ?? throw new InvalidOperationException("RECEBIMENTO_DEVOLUCAO_NAO_CARREGADO");

                var movimentacao = new EstoqueMovimentacao(
                    item.ProdutoId,
                    devolucao.Quantidade,
                    TipoMovimentacao.Entrada,
                    valorUnitario: recebimento.ValorUnitario,
                    data: dataCompensacao);

                estoqueMovimentacaoId = movimentacao.Id;
                presencaFisicaConfirmada = true;
                await _estoqueRepository.AdicionarSemSalvarAsync(movimentacao);
            }

            var compensacao = new CompraItemDevolucaoCompensacao(
                devolucao.Id,
                dataCompensacao,
                dto.Motivo,
                dto.OperacaoId,
                presencaFisicaConfirmada,
                estoqueMovimentacaoId);

            await _devolucaoRepository.AdicionarCompensacaoSemSalvarAsync(compensacao);
        });

        var devolucaoAtualizada = await _devolucaoRepository.ObterPorIdAsync(devolucaoId)
            ?? throw new KeyNotFoundException("DEVOLUCAO_NAO_ENCONTRADA");
        return (CompraDevolucaoMapper.ToDto(devolucaoAtualizada), true);
    }

    public async Task<(CompraReembolsoDto Reembolso, bool Criado)> CancelarReembolsoAsync(
        Guid compraId,
        Guid reembolsoId,
        CancelarCompraReembolsoDto dto)
    {
        if (dto == null) throw new ArgumentNullException(nameof(dto));
        if (!_features.DevolucoesReembolsosComprasEnabled)
        {
            throw new InvalidOperationException("FEATURE_DESABILITADA");
        }

        var cancelamentoExistente = await _reembolsoRepository.ObterCancelamentoPorOperacaoIdAsync(dto.OperacaoId);
        if (cancelamentoExistente != null)
        {
            if (cancelamentoExistente.CompraReembolsoId != reembolsoId
                || cancelamentoExistente.DataCancelamento.Date != dto.DataCancelamento.Date)
            {
                throw new InvalidOperationException("OPERACAO_ID_REUTILIZADA");
            }

            var reembolsoExistente = await _reembolsoRepository.ObterPorIdAsync(reembolsoId)
                ?? throw new KeyNotFoundException("REEMBOLSO_NAO_ENCONTRADO");
            if (reembolsoExistente.CompraId != compraId)
            {
                throw new InvalidOperationException("OPERACAO_ID_REUTILIZADA");
            }

            return (CompraReembolsoMapper.ToDto(reembolsoExistente), false);
        }

        await _unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            var reembolso = await _reembolsoRepository.ObterPorIdParaAtualizarAsync(reembolsoId)
                ?? throw new KeyNotFoundException("REEMBOLSO_NAO_ENCONTRADO");

            if (reembolso.CompraId != compraId)
            {
                throw new KeyNotFoundException("REEMBOLSO_NAO_ENCONTRADO");
            }

            if (reembolso.Cancelamento != null)
            {
                throw new InvalidOperationException("REGISTRO_JA_COMPENSADO");
            }

            var dataCancelamento = NormalizarDataEfetiva(dto.DataCancelamento);
            if (dataCancelamento > DateTime.UtcNow.Date || dataCancelamento < reembolso.DataReembolso.Date)
            {
                throw new ArgumentException("Data de cancelamento invalida", nameof(dto));
            }

            var cancelamento = new CompraReembolsoCancelamento(
                reembolso.Id,
                dataCancelamento,
                dto.Motivo,
                dto.OperacaoId);

            await _reembolsoRepository.AdicionarCancelamentoSemSalvarAsync(cancelamento);
        });

        var reembolsoAtualizado = await _reembolsoRepository.ObterPorIdAsync(reembolsoId)
            ?? throw new KeyNotFoundException("REEMBOLSO_NAO_ENCONTRADO");
        return (CompraReembolsoMapper.ToDto(reembolsoAtualizado), true);
    }

    public async Task<CompraReembolsoListDto> ObterReembolsosAsync(Guid compraId)
    {
        var compra = await _compraRepository.ObterPorIdAsync(compraId)
            ?? throw new KeyNotFoundException("COMPRA_NAO_ENCONTRADA");

        var reembolsos = await _reembolsoRepository.ObterPorCompraAsync(compraId);
        var totalCreditos = reembolsos.Sum(r => r.Valor);
        var totalCancelamentos = reembolsos
            .Where(r => r.Cancelamento != null)
            .Sum(r => r.Valor);
        var resumo = CompraCalculoFinanceiro.CalcularResumoReembolso(
            compra.Total(),
            totalCreditos,
            totalCancelamentos);

        return CompraReembolsoMapper.ToListDto(reembolsos, resumo);
    }

    public async Task<CompraItemDevolucaoListDto> ObterDevolucoesAsync(Guid compraId)
    {
        var compra = await _compraRepository.ObterPorIdAsync(compraId)
            ?? throw new KeyNotFoundException("COMPRA_NAO_ENCONTRADA");

        var devolucoes = await _devolucaoRepository.ObterPorCompraAsync(compraId);
        var quantidadeAntes = devolucoes
            .Where(d => d.Momento == CompraItemDevolucaoMomento.AntesDoRecebimento && d.Compensacao == null)
            .Sum(d => d.Quantidade);
        var quantidadeDepois = devolucoes
            .Where(d => d.Momento == CompraItemDevolucaoMomento.DepoisDoRecebimento && d.Compensacao == null)
            .Sum(d => d.Quantidade);

        return CompraDevolucaoMapper.ToListDto(devolucoes, quantidadeAntes, quantidadeDepois, 0m);
    }

    public async Task<IReadOnlyCollection<CompraEmTransitoDto>> ObterComprasEmTransitoAsync()
    {
        var compras = await _compraRepository.ObterTodasAsync();

        return compras
            .Where(c => CompraEstaEmTransito(c) && c.Items.Any(i => i.QuantidadePendente > 0))
            .Select(MapearCompraEmTransito)
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

    private static CompraEmTransitoDto MapearCompraEmTransito(Compra compra)
    {
        var calculo = CompraCalculoFinanceiro.Calcular(
            compra.Items.Select(CompraItemCalculoFinanceiro.FromEntity),
            compra.Desconto,
            compra.Acrescimo);

        return new CompraEmTransitoDto
        {
            CompraId = compra.Id,
            FornecedorId = compra.FornecedorId,
            DataCompra = compra.DataCompra,
            Status = compra.Status.ToString(),
            TotalCompra = calculo.TotalCompra,
            ValorPendenteCusto = calculo.ValorPendenteCusto,
            MotivoValorPendenteIndisponivel = calculo.MotivoValorPendenteIndisponivel,
            Itens = compra.Items
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
        };
    }

    private static DateTime NormalizarDataEfetiva(DateTime data)
    {
        var valor = data == default ? DateTime.UtcNow : data;
        return DateTime.SpecifyKind(valor.Date, DateTimeKind.Utc);
    }

    private static IReadOnlyDictionary<Guid, CompraItemResumoDevolucao> CalcularResumosDevolucaoPorItem(
        IEnumerable<CompraItemDevolucao> devolucoes)
    {
        return devolucoes
            .GroupBy(d => d.CompraItemId)
            .ToDictionary(
                g => g.Key,
                g => new CompraItemResumoDevolucao(
                    g.Where(d => d.Compensacao == null && d.Momento == CompraItemDevolucaoMomento.AntesDoRecebimento).Sum(d => d.Quantidade),
                    g.Where(d => d.Compensacao == null && d.Momento == CompraItemDevolucaoMomento.DepoisDoRecebimento).Sum(d => d.Quantidade),
                    g.Where(d => d.Compensacao == null
                            && d.Momento == CompraItemDevolucaoMomento.DepoisDoRecebimento
                            && d.CompraItemRecebimentoId.HasValue)
                        .GroupBy(d => d.CompraItemRecebimentoId!.Value)
                        .ToDictionary(r => r.Key, r => r.Sum(d => d.Quantidade)),
                    g.Where(d => d.Compensacao != null && d.Momento == CompraItemDevolucaoMomento.AntesDoRecebimento).Sum(d => d.Quantidade),
                    g.Where(d => d.Compensacao != null && d.Momento == CompraItemDevolucaoMomento.DepoisDoRecebimento).Sum(d => d.Quantidade),
                    g.Where(d => d.Compensacao != null
                            && d.Momento == CompraItemDevolucaoMomento.DepoisDoRecebimento
                            && d.CompraItemRecebimentoId.HasValue)
                        .GroupBy(d => d.CompraItemRecebimentoId!.Value)
                        .ToDictionary(r => r.Key, r => r.Sum(d => d.Quantidade))));
    }
}
