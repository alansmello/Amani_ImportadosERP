using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Infra.Data.EntityConfigurations;

public class PagamentoRecebidoMapping : IEntityTypeConfiguration<PagamentoRecebido>
{
    public void Configure(EntityTypeBuilder<PagamentoRecebido> builder)
    {
        builder.ToTable("pagamentos_recebidos");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ContaReceberId)
            .IsRequired();

        builder.Property(x => x.Valor)
            .IsRequired()
            .HasPrecision(18, 2);

        builder.Property(x => x.Desconto)
            .IsRequired()
            .HasPrecision(18, 2)
            .HasDefaultValue(0m);

        builder.Property(x => x.ValorBrutoLiquidado)
            .IsRequired()
            .HasPrecision(18, 2);

        builder.Property(x => x.DataPagamento)
            .IsRequired();

        builder.HasIndex(x => x.DataPagamento)
            .HasDatabaseName("IX_pagamentos_recebidos_DataPagamento");
    }
}
