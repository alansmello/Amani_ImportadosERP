using System;
using System.Threading.Tasks;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Infra.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace Amani.ImportadosERP.Infra.Data.Repositories;

public class UsuarioRepository : IUsuarioRepository
{
    private readonly AmaniDbContext _db;

    public UsuarioRepository(AmaniDbContext db)
    {
        _db = db;
    }

    public async Task AdicionarAsync(Usuario usuario)
    {
        if (usuario == null) throw new ArgumentNullException(nameof(usuario));
        await _db.Usuarios.AddAsync(usuario);
        await _db.SaveChangesAsync();
    }

    public async Task<Usuario?> ObterPorIdAsync(Guid id)
    {
        if (id == Guid.Empty) return null;
        return await _db.Usuarios.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<Usuario?> ObterPorLoginNormalizadoAsync(string loginNormalizado)
    {
        if (string.IsNullOrWhiteSpace(loginNormalizado)) return null;
        return await _db.Usuarios.FirstOrDefaultAsync(u => u.LoginNormalizado == loginNormalizado.Trim());
    }

    public async Task SalvarAsync()
    {
        await _db.SaveChangesAsync();
    }
}
