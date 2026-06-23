using Amani.ImportadosERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Amani.ImportadosERP.Infra.Data.EntityConfigurations;

public sealed class ConfiguracaoFormaPagamentoMapping : IEntityTypeConfiguration<ConfiguracaoFormaPagamento>
{
    public void Configure(EntityTypeBuilder<ConfiguracaoFormaPagamento> builder)
    {
        builder.ToTable("configuracoes_formas_pagamento");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.FormaPagamento)
            .IsRequired()
            .HasMaxLength(30)
            .HasConversion<string>();

        builder.Property(x => x.PercentualTaxa)
            .IsRequired()
            .HasPrecision(9, 4);

        builder.Property(x => x.AtualizadoEm)
            .IsRequired();

        builder.HasIndex(x => x.FormaPagamento)
            .IsUnique();
    }
}
