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
            .IsRequired(false);

        builder.Property(x => x.ClienteId)
            .IsRequired(false);

        builder.Property(x => x.Origem)
            .IsRequired()
            .HasMaxLength(50);

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

        builder.HasOne<Cliente>()
            .WithMany()
            .HasForeignKey(x => x.ClienteId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.CreatedAt, x.DataVencimento })
            .HasDatabaseName("IX_contas_receber_CreatedAt_DataVencimento");
    }
}
