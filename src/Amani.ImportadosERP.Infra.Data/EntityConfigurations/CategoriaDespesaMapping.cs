using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Infra.Data.EntityConfigurations;

public class CategoriaDespesaMapping : IEntityTypeConfiguration<CategoriaDespesa>
{
    public void Configure(EntityTypeBuilder<CategoriaDespesa> builder)
    {
        builder.ToTable("categoria_despesas");
        builder.HasKey(cd => cd.Id);
        builder.Property(cd => cd.Nome).IsRequired().HasMaxLength(150);
    }
}
