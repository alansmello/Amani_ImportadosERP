using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Infra.Data.EntityConfigurations;

public class CompraItemMapping : IEntityTypeConfiguration<CompraItem>
{
    public void Configure(EntityTypeBuilder<CompraItem> builder)
    {
        builder.ToTable("compra_items");
        builder.HasKey(ci => ci.Id);
        builder.Property(ci => ci.ProdutoId).IsRequired();
        builder.Property(ci => ci.Quantidade).IsRequired();
        builder.Property(ci => ci.CustoUnitario).IsRequired().HasPrecision(18,2);
        builder.Property(ci => ci.Desconto).IsRequired().HasPrecision(18,2).HasDefaultValue(0m);
        builder.Property(ci => ci.Acrescimo).IsRequired().HasPrecision(18,2).HasDefaultValue(0m);
        builder.HasOne(ci => ci.Compra).WithMany(c => c.Items).HasForeignKey(ci => ci.CompraId).OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(ci => ci.Recebimentos)
               .WithOne(r => r.CompraItem)
               .HasForeignKey(r => r.CompraItemId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(ci => ci.Perdas)
               .WithOne(p => p.CompraItem)
               .HasForeignKey(p => p.CompraItemId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
