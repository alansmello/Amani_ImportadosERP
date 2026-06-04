using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Amani.ImportadosERP.Infra.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPropCanceladaEmVenda : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Cancelada",
                table: "vendas",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DataCancelamento",
                table: "vendas",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Cancelada",
                table: "vendas");

            migrationBuilder.DropColumn(
                name: "DataCancelamento",
                table: "vendas");
        }
    }
}
