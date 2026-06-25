using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Infra.Data.EntityConfigurations;

public class DespesaMapping : IEntityTypeConfiguration<Despesa>
{
    public void Configure(EntityTypeBuilder<Despesa> builder)
    {
        builder.ToTable("despesas");
        builder.HasKey(d => d.Id);
        builder.Property(d => d.Descricao).IsRequired().HasMaxLength(250);
        builder.Property(d => d.Valor).IsRequired().HasPrecision(18, 2);
        builder.Property(d => d.DataCompetencia).IsRequired();
        builder.Property(d => d.CategoriaDespesaId).IsRequired();
        builder.Property(d => d.FormaPagamento)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.HasOne(d => d.CategoriaDespesa)
            .WithMany()
            .HasForeignKey(d => d.CategoriaDespesaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
