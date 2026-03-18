using Microsoft.EntityFrameworkCore;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Infra.Data.Context;

public class AmaniDbContext : DbContext
{
    public AmaniDbContext(DbContextOptions<AmaniDbContext> options) : base(options) { }

    public DbSet<Cliente> Clientes { get; set; } = null!;
    public DbSet<Fornecedor> Fornecedores { get; set; } = null!;
    public DbSet<Categoria> Categorias { get; set; } = null!;
    public DbSet<Produto> Produtos { get; set; } = null!;
    public DbSet<Compra> Compras { get; set; } = null!;
    public DbSet<CompraItem> CompraItems { get; set; } = null!;
    public DbSet<Venda> Vendas { get; set; } = null!;
    public DbSet<VendaItem> VendaItems { get; set; } = null!;
    public DbSet<EstoqueMovimentacao> EstoqueMovimentacoes { get; set; } = null!;
    public DbSet<Despesa> Despesas { get; set; } = null!;
    public DbSet<CategoriaDespesa> CategoriaDespesas { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all IEntityTypeConfiguration<> implementations from this assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AmaniDbContext).Assembly);
    }

}
