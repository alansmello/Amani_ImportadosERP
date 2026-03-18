using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Infra.Data.EntityConfigurations;

public class VendaItemMapping : IEntityTypeConfiguration<VendaItem>
{
    public void Configure(EntityTypeBuilder<VendaItem> builder)
    {
        builder.ToTable("venda_items");
        builder.HasKey(vi => vi.Id);
        builder.Property(vi => vi.ProdutoId).IsRequired();
        builder.Property(vi => vi.Quantidade).IsRequired();
        builder.Property(vi => vi.PrecoUnitario).IsRequired().HasPrecision(18,2);
        builder.Property(vi => vi.Desconto).IsRequired().HasPrecision(18,2).HasDefaultValue(0m);
        builder.Property(vi => vi.Acrescimo).IsRequired().HasPrecision(18,2).HasDefaultValue(0m);
        builder.HasOne(vi => vi.Venda).WithMany(v => v.Items).HasForeignKey(vi => vi.VendaId).OnDelete(DeleteBehavior.Restrict);
    }
}
