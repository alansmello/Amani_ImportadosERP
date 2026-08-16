using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Amani.ImportadosERP.Infra.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddDevolucoesReembolsosCompras : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "compra_item_devolucoes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CompraId = table.Column<Guid>(type: "uuid", nullable: false),
                    CompraItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    CompraItemRecebimentoId = table.Column<Guid>(type: "uuid", nullable: true),
                    EstoqueMovimentacaoId = table.Column<Guid>(type: "uuid", nullable: true),
                    Momento = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Quantidade = table.Column<int>(type: "integer", nullable: false),
                    Motivo = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    DataDevolucao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Observacao = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    OperacaoId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_compra_item_devolucoes", x => x.Id);
                    table.CheckConstraint("CK_compra_item_devolucoes_MomentoReferencias", "(\"Momento\" = 'AntesDoRecebimento' AND \"CompraItemRecebimentoId\" IS NULL AND \"EstoqueMovimentacaoId\" IS NULL) OR (\"Momento\" = 'DepoisDoRecebimento' AND \"CompraItemRecebimentoId\" IS NOT NULL AND \"EstoqueMovimentacaoId\" IS NOT NULL)");
                    table.CheckConstraint("CK_compra_item_devolucoes_ObservacaoOutro", "\"Motivo\" <> 'Outro' OR (\"Observacao\" IS NOT NULL AND length(trim(\"Observacao\")) > 0)");
                    table.CheckConstraint("CK_compra_item_devolucoes_Quantidade", "\"Quantidade\" > 0");
                    table.ForeignKey(
                        name: "FK_compra_item_devolucoes_compra_item_recebimentos_CompraItemR~",
                        column: x => x.CompraItemRecebimentoId,
                        principalTable: "compra_item_recebimentos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_compra_item_devolucoes_compra_items_CompraItemId",
                        column: x => x.CompraItemId,
                        principalTable: "compra_items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_compra_item_devolucoes_compras_CompraId",
                        column: x => x.CompraId,
                        principalTable: "compras",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_compra_item_devolucoes_estoque_movimentacoes_EstoqueMovimen~",
                        column: x => x.EstoqueMovimentacaoId,
                        principalTable: "estoque_movimentacoes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "compra_reembolsos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CompraId = table.Column<Guid>(type: "uuid", nullable: false),
                    Valor = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    DataReembolso = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ReferenciaExterna = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Observacao = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    OperacaoId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_compra_reembolsos", x => x.Id);
                    table.CheckConstraint("CK_compra_reembolsos_Valor", "\"Valor\" > 0");
                    table.ForeignKey(
                        name: "FK_compra_reembolsos_compras_CompraId",
                        column: x => x.CompraId,
                        principalTable: "compras",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "compra_item_devolucao_compensacoes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CompraItemDevolucaoId = table.Column<Guid>(type: "uuid", nullable: false),
                    EstoqueMovimentacaoId = table.Column<Guid>(type: "uuid", nullable: true),
                    DataCompensacao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Motivo = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    PresencaFisicaConfirmada = table.Column<bool>(type: "boolean", nullable: false),
                    OperacaoId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_compra_item_devolucao_compensacoes", x => x.Id);
                    table.CheckConstraint("CK_compra_item_devolucao_compensacoes_Motivo", "length(trim(\"Motivo\")) > 0");
                    table.ForeignKey(
                        name: "FK_compra_item_devolucao_compensacoes_compra_item_devolucoes_C~",
                        column: x => x.CompraItemDevolucaoId,
                        principalTable: "compra_item_devolucoes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_compra_item_devolucao_compensacoes_estoque_movimentacoes_Es~",
                        column: x => x.EstoqueMovimentacaoId,
                        principalTable: "estoque_movimentacoes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "compra_reembolso_alocacoes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CompraReembolsoId = table.Column<Guid>(type: "uuid", nullable: false),
                    CompraItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    CompraItemPerdaId = table.Column<Guid>(type: "uuid", nullable: true),
                    CompraItemDevolucaoId = table.Column<Guid>(type: "uuid", nullable: true),
                    Valor = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_compra_reembolso_alocacoes", x => x.Id);
                    table.CheckConstraint("CK_compra_reembolso_alocacoes_OcorrenciaUnica", "NOT (\"CompraItemPerdaId\" IS NOT NULL AND \"CompraItemDevolucaoId\" IS NOT NULL)");
                    table.CheckConstraint("CK_compra_reembolso_alocacoes_Valor", "\"Valor\" > 0");
                    table.ForeignKey(
                        name: "FK_compra_reembolso_alocacoes_compra_item_devolucoes_CompraIte~",
                        column: x => x.CompraItemDevolucaoId,
                        principalTable: "compra_item_devolucoes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_compra_reembolso_alocacoes_compra_item_perdas_CompraItemPer~",
                        column: x => x.CompraItemPerdaId,
                        principalTable: "compra_item_perdas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_compra_reembolso_alocacoes_compra_items_CompraItemId",
                        column: x => x.CompraItemId,
                        principalTable: "compra_items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_compra_reembolso_alocacoes_compra_reembolsos_CompraReembols~",
                        column: x => x.CompraReembolsoId,
                        principalTable: "compra_reembolsos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "compra_reembolso_cancelamentos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CompraReembolsoId = table.Column<Guid>(type: "uuid", nullable: false),
                    DataCancelamento = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Motivo = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    OperacaoId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_compra_reembolso_cancelamentos", x => x.Id);
                    table.CheckConstraint("CK_compra_reembolso_cancelamentos_Motivo", "length(trim(\"Motivo\")) > 0");
                    table.ForeignKey(
                        name: "FK_compra_reembolso_cancelamentos_compra_reembolsos_CompraReem~",
                        column: x => x.CompraReembolsoId,
                        principalTable: "compra_reembolsos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_compra_item_devolucao_compensacoes_CompraItemDevolucaoId",
                table: "compra_item_devolucao_compensacoes",
                column: "CompraItemDevolucaoId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_compra_item_devolucao_compensacoes_EstoqueMovimentacaoId",
                table: "compra_item_devolucao_compensacoes",
                column: "EstoqueMovimentacaoId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_compra_item_devolucao_compensacoes_OperacaoId",
                table: "compra_item_devolucao_compensacoes",
                column: "OperacaoId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_compra_item_devolucoes_CompraId_DataDevolucao",
                table: "compra_item_devolucoes",
                columns: new[] { "CompraId", "DataDevolucao" });

            migrationBuilder.CreateIndex(
                name: "IX_compra_item_devolucoes_CompraItemId_Momento",
                table: "compra_item_devolucoes",
                columns: new[] { "CompraItemId", "Momento" });

            migrationBuilder.CreateIndex(
                name: "IX_compra_item_devolucoes_CompraItemRecebimentoId",
                table: "compra_item_devolucoes",
                column: "CompraItemRecebimentoId");

            migrationBuilder.CreateIndex(
                name: "IX_compra_item_devolucoes_EstoqueMovimentacaoId",
                table: "compra_item_devolucoes",
                column: "EstoqueMovimentacaoId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_compra_item_devolucoes_OperacaoId",
                table: "compra_item_devolucoes",
                column: "OperacaoId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_compra_reembolso_alocacoes_CompraItemDevolucaoId",
                table: "compra_reembolso_alocacoes",
                column: "CompraItemDevolucaoId");

            migrationBuilder.CreateIndex(
                name: "IX_compra_reembolso_alocacoes_CompraItemId",
                table: "compra_reembolso_alocacoes",
                column: "CompraItemId");

            migrationBuilder.CreateIndex(
                name: "IX_compra_reembolso_alocacoes_CompraItemPerdaId",
                table: "compra_reembolso_alocacoes",
                column: "CompraItemPerdaId");

            migrationBuilder.CreateIndex(
                name: "IX_compra_reembolso_alocacoes_CompraReembolsoId",
                table: "compra_reembolso_alocacoes",
                column: "CompraReembolsoId");

            migrationBuilder.CreateIndex(
                name: "IX_compra_reembolso_cancelamentos_CompraReembolsoId",
                table: "compra_reembolso_cancelamentos",
                column: "CompraReembolsoId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_compra_reembolso_cancelamentos_OperacaoId",
                table: "compra_reembolso_cancelamentos",
                column: "OperacaoId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_compra_reembolsos_CompraId_DataReembolso",
                table: "compra_reembolsos",
                columns: new[] { "CompraId", "DataReembolso" });

            migrationBuilder.CreateIndex(
                name: "IX_compra_reembolsos_CompraId_ReferenciaExterna",
                table: "compra_reembolsos",
                columns: new[] { "CompraId", "ReferenciaExterna" },
                unique: true,
                filter: "\"ReferenciaExterna\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_compra_reembolsos_OperacaoId",
                table: "compra_reembolsos",
                column: "OperacaoId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // F027 uses logical rollback only: disable the feature flag and
            // preserve append-only audit tables and events.
        }
    }
}
