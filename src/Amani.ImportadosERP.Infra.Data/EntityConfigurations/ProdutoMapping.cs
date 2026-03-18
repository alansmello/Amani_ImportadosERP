using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Infra.Data.EntityConfigurations;

public class ProdutoMapping : IEntityTypeConfiguration<Produto>
{
    public void Configure(EntityTypeBuilder<Produto> builder)
    {
        builder.ToTable("produtos");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Nome).IsRequired().HasMaxLength(150);
        builder.Property(p => p.PrecoVenda).IsRequired().HasPrecision(18,2);
        builder.Property(p => p.Custo).IsRequired().HasPrecision(18,2);

        builder.HasOne<Categoria>().WithMany().HasForeignKey(p => p.CategoriaId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<Fornecedor>().WithMany().HasForeignKey(p => p.FornecedorId).OnDelete(DeleteBehavior.SetNull);
    }
}
