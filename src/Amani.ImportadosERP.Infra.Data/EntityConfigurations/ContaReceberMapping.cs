using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Infra.Data.EntityConfigurations;

public class ContaReceberMapping : IEntityTypeConfiguration<ContaReceber>
{
    public void Configure(EntityTypeBuilder<ContaReceber> builder)
    {
        builder.ToTable("contas_receber");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.VendaId)
            .IsRequired();

        builder.Property(x => x.Valor)
            .IsRequired()
            .HasPrecision(18, 2);

        builder.Property(x => x.DataVencimento)
            .IsRequired();

        builder.HasMany(x => x.Pagamentos)
            .WithOne()
            .HasForeignKey(p => p.ContaReceberId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<Venda>()
            .WithMany()
            .HasForeignKey(x => x.VendaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
