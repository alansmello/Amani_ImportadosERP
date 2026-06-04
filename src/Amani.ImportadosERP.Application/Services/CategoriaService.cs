using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Services;

public class CategoriaService
{
    private readonly ICategoriaRepository _categoriaRepository;

    public CategoriaService(ICategoriaRepository categoriaRepository)
    {
        _categoriaRepository = categoriaRepository;
    }

    public async Task<CategoriaDto> CreateAsync(CriarCategoriaDto dto)
    {
        var categoria = new Categoria(dto.Nome);
        await _categoriaRepository.AdicionarAsync(categoria);
        return ToDto(categoria);
    }

    public async Task<CategoriaDto?> ObterPorIdAsync(Guid id)
    {
        var categoria = await _categoriaRepository.ObterPorIdAsync(id);
        return categoria == null ? null : ToDto(categoria);
    }

    public async Task<List<CategoriaDto>> ListarAsync()
    {
        var categorias = await _categoriaRepository.ListarAsync();
        return categorias.Select(ToDto).ToList();
    }

    public async Task<bool> AtualizarAsync(Guid id, AtualizarCategoriaDto dto)
    {
        var categoria = await _categoriaRepository.ObterPorIdParaAtualizarAsync(id);
        if (categoria == null) return false;

        categoria.AtualizarNome(dto.Nome);
        await _categoriaRepository.SalvarAsync();
        return true;
    }

    private static CategoriaDto ToDto(Categoria categoria)
    {
        return new CategoriaDto
        {
            Id = categoria.Id,
            Nome = categoria.Nome
        };
    }
}
