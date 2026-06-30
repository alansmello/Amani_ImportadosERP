using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Infra.Data.EntityConfigurations;

public class VendaMapping : IEntityTypeConfiguration<Venda>
{
    public void Configure(EntityTypeBuilder<Venda> builder)
    {
        builder.ToTable("vendas");
        builder.HasKey(v => v.Id);
        builder.Property(v => v.ClienteId).IsRequired();
        builder.Property(v => v.DataVenda).IsRequired();
        builder.Property(v => v.Desconto).IsRequired().HasPrecision(18,2).HasDefaultValue(0m);
        builder.Property(v => v.Acrescimo).IsRequired().HasPrecision(18,2).HasDefaultValue(0m);
        builder.Property(v => v.FormaPagamento).IsRequired().HasMaxLength(30).HasConversion<string>();
        builder.Property(v => v.PercentualTaxaAplicado).IsRequired(false).HasPrecision(9,4);
        builder.Property(v => v.Cancelada).IsRequired().HasDefaultValue(false);
        builder.Property(v => v.DataCancelamento).IsRequired(false);

        builder.HasMany(v => v.Items)
               .WithOne(vi => vi.Venda)
               .HasForeignKey(vi => vi.VendaId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(v => new { v.DataVenda, v.Cancelada })
            .HasDatabaseName("IX_vendas_DataVenda_Cancelada");
    }
}
