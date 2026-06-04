using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Amani.ImportadosERP.Infra.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddContaReceberEPagamentoRecebido : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "contas_receber",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    VendaId = table.Column<Guid>(type: "uuid", nullable: false),
                    Valor = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    DataVencimento = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_contas_receber", x => x.Id);
                    table.ForeignKey(
                        name: "FK_contas_receber_vendas_VendaId",
                        column: x => x.VendaId,
                        principalTable: "vendas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "pagamentos_recebidos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ContaReceberId = table.Column<Guid>(type: "uuid", nullable: false),
                    Valor = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    DataPagamento = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_pagamentos_recebidos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_pagamentos_recebidos_contas_receber_ContaReceberId",
                        column: x => x.ContaReceberId,
                        principalTable: "contas_receber",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_contas_receber_VendaId",
                table: "contas_receber",
                column: "VendaId");

            migrationBuilder.CreateIndex(
                name: "IX_pagamentos_recebidos_ContaReceberId",
                table: "pagamentos_recebidos",
                column: "ContaReceberId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "pagamentos_recebidos");

            migrationBuilder.DropTable(
                name: "contas_receber");
        }
    }
}
