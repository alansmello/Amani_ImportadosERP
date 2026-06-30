using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Amani.ImportadosERP.Infra.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddDashboardGerencialIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_vendas_DataVenda_Cancelada",
                table: "vendas",
                columns: new[] { "DataVenda", "Cancelada" });

            migrationBuilder.CreateIndex(
                name: "IX_compras_DataCompra_Status",
                table: "compras",
                columns: new[] { "DataCompra", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_pagamentos_recebidos_DataPagamento",
                table: "pagamentos_recebidos",
                column: "DataPagamento");

            migrationBuilder.CreateIndex(
                name: "IX_contas_receber_CreatedAt_DataVencimento",
                table: "contas_receber",
                columns: new[] { "CreatedAt", "DataVencimento" });

            migrationBuilder.CreateIndex(
                name: "IX_eventos_financeiros_Tipo_Data",
                table: "eventos_financeiros",
                columns: new[] { "Tipo", "Data" });

            migrationBuilder.CreateIndex(
                name: "IX_estoque_movimentacoes_ProdutoId_Data_Tipo",
                table: "estoque_movimentacoes",
                columns: new[] { "ProdutoId", "Data", "Tipo" });

            migrationBuilder.CreateIndex(
                name: "IX_despesas_DataCompetencia",
                table: "despesas",
                column: "DataCompetencia");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_vendas_DataVenda_Cancelada",
                table: "vendas");

            migrationBuilder.DropIndex(
                name: "IX_compras_DataCompra_Status",
                table: "compras");

            migrationBuilder.DropIndex(
                name: "IX_pagamentos_recebidos_DataPagamento",
                table: "pagamentos_recebidos");

            migrationBuilder.DropIndex(
                name: "IX_contas_receber_CreatedAt_DataVencimento",
                table: "contas_receber");

            migrationBuilder.DropIndex(
                name: "IX_eventos_financeiros_Tipo_Data",
                table: "eventos_financeiros");

            migrationBuilder.DropIndex(
                name: "IX_estoque_movimentacoes_ProdutoId_Data_Tipo",
                table: "estoque_movimentacoes");

            migrationBuilder.DropIndex(
                name: "IX_despesas_DataCompetencia",
                table: "despesas");
        }
    }
}
