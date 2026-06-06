using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Amani.ImportadosERP.Infra.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddContaReceberInicialOrigemCliente : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Guid>(
                name: "VendaId",
                table: "contas_receber",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<Guid>(
                name: "ClienteId",
                table: "contas_receber",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Origem",
                table: "contas_receber",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "Venda");

            migrationBuilder.CreateIndex(
                name: "IX_contas_receber_ClienteId",
                table: "contas_receber",
                column: "ClienteId");

            migrationBuilder.AddForeignKey(
                name: "FK_contas_receber_clientes_ClienteId",
                table: "contas_receber",
                column: "ClienteId",
                principalTable: "clientes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_contas_receber_clientes_ClienteId",
                table: "contas_receber");

            migrationBuilder.DropIndex(
                name: "IX_contas_receber_ClienteId",
                table: "contas_receber");

            migrationBuilder.DropColumn(
                name: "ClienteId",
                table: "contas_receber");

            migrationBuilder.DropColumn(
                name: "Origem",
                table: "contas_receber");

            migrationBuilder.AlterColumn<Guid>(
                name: "VendaId",
                table: "contas_receber",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);
        }
    }
}
