using Amani.ImportadosERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Amani.ImportadosERP.Infra.Data.EntityConfigurations;

public sealed class DespesaOperadoraMapping : IEntityTypeConfiguration<DespesaOperadora>
{
    public void Configure(EntityTypeBuilder<DespesaOperadora> builder)
    {
        builder.ToTable("despesas_operadora");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.VendaId)
            .IsRequired();

        builder.Property(x => x.FormaPagamento)
            .IsRequired()
            .HasMaxLength(30)
            .HasConversion<string>();

        builder.Property(x => x.ValorBruto)
            .IsRequired()
            .HasPrecision(18, 2);

        builder.Property(x => x.ValorLiquido)
            .IsRequired()
            .HasPrecision(18, 2);

        builder.Property(x => x.PercentualTaxa)
            .IsRequired()
            .HasPrecision(9, 4);

        builder.Property(x => x.DataRegistro)
            .IsRequired();

        builder.Ignore(x => x.ValorTaxa);

        builder.HasOne(x => x.Venda)
            .WithMany()
            .HasForeignKey(x => x.VendaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
