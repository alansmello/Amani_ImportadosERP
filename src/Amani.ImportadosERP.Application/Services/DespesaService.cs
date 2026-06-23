using System;
using System.Threading.Tasks;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Services;

public class DespesaService
{
    private readonly IDespesaRepository _despesaRepository;

    public DespesaService(IDespesaRepository despesaRepository)
    {
        _despesaRepository = despesaRepository;
    }

    public async Task<Guid> CreateAsync(CriarDespesaDto dto)
    {
        var despesa = new Despesa(
            dto.Descricao,
            dto.Valor,
            dto.DataCompetencia ?? DateTime.UtcNow,
            dto.CategoriaDespesaId,
            dto.FormaPagamento
        );
        await _despesaRepository.AdicionarAsync(despesa);
        return despesa.Id;
    }

    public async Task<Despesa?> ObterPorIdAsync(Guid id)
    {
        return await _despesaRepository.ObterPorIdAsync(id);
    }
}
