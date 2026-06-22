using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Amani.ImportadosERP.Infra.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddFormasPagamentoTaxas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FormaPagamento",
                table: "vendas",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "Fiado");

            migrationBuilder.AddColumn<decimal>(
                name: "PercentualTaxaAplicado",
                table: "vendas",
                type: "numeric(9,4)",
                precision: 9,
                scale: 4,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Desconto",
                table: "pagamentos_recebidos",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "ValorBrutoLiquidado",
                table: "pagamentos_recebidos",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.Sql("UPDATE pagamentos_recebidos SET \"ValorBrutoLiquidado\" = \"Valor\";");

            migrationBuilder.CreateTable(
                name: "configuracoes_formas_pagamento",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FormaPagamento = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    PercentualTaxa = table.Column<decimal>(type: "numeric(9,4)", precision: 9, scale: 4, nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_configuracoes_formas_pagamento", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "despesas_operadora",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    VendaId = table.Column<Guid>(type: "uuid", nullable: false),
                    FormaPagamento = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    ValorBruto = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    ValorLiquido = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    PercentualTaxa = table.Column<decimal>(type: "numeric(9,4)", precision: 9, scale: 4, nullable: false),
                    DataRegistro = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_despesas_operadora", x => x.Id);
                    table.ForeignKey(
                        name: "FK_despesas_operadora_vendas_VendaId",
                        column: x => x.VendaId,
                        principalTable: "vendas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_configuracoes_formas_pagamento_FormaPagamento",
                table: "configuracoes_formas_pagamento",
                column: "FormaPagamento",
                unique: true);

            migrationBuilder.InsertData(
                table: "configuracoes_formas_pagamento",
                columns: new[] { "Id", "FormaPagamento", "PercentualTaxa", "AtualizadoEm", "CreatedAt", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("5f5f7d1e-ef0f-4c7c-a451-6a3a8fd2b001"), "Dinheiro", 0.0000m, new DateTime(2026, 6, 22, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 6, 22, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("5f5f7d1e-ef0f-4c7c-a451-6a3a8fd2b002"), "PIX", 0.0000m, new DateTime(2026, 6, 22, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 6, 22, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("5f5f7d1e-ef0f-4c7c-a451-6a3a8fd2b003"), "CartaoDebito", 1.9900m, new DateTime(2026, 6, 22, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 6, 22, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("5f5f7d1e-ef0f-4c7c-a451-6a3a8fd2b004"), "CartaoCredito", 3.4900m, new DateTime(2026, 6, 22, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 6, 22, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("5f5f7d1e-ef0f-4c7c-a451-6a3a8fd2b005"), "Fiado", 0.0000m, new DateTime(2026, 6, 22, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 6, 22, 0, 0, 0, DateTimeKind.Utc), null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_despesas_operadora_VendaId",
                table: "despesas_operadora",
                column: "VendaId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "configuracoes_formas_pagamento");

            migrationBuilder.DropTable(
                name: "despesas_operadora");

            migrationBuilder.DropColumn(
                name: "FormaPagamento",
                table: "vendas");

            migrationBuilder.DropColumn(
                name: "PercentualTaxaAplicado",
                table: "vendas");

            migrationBuilder.DropColumn(
                name: "Desconto",
                table: "pagamentos_recebidos");

            migrationBuilder.DropColumn(
                name: "ValorBrutoLiquidado",
                table: "pagamentos_recebidos");
        }
    }
}
