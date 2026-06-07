using Amani.ImportadosERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Amani.ImportadosERP.Infra.Data.EntityConfigurations;

public class EventoFinanceiroMapping : IEntityTypeConfiguration<EventoFinanceiro>
{
    public void Configure(EntityTypeBuilder<EventoFinanceiro> builder)
    {
        builder.ToTable("eventos_financeiros");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Tipo).IsRequired();
        builder.Property(e => e.Valor).IsRequired().HasPrecision(18,2);
        builder.Property(e => e.Data).IsRequired();
        builder.Property(e => e.Origem).IsRequired().HasMaxLength(50);
        builder.Property(e => e.Descricao).IsRequired().HasMaxLength(250);
    }
}
