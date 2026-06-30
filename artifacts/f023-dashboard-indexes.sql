-- F023 Dashboard Gerencial — índices aditivos (PostgreSQL)
-- Migration: 20260630120000_AddDashboardGerencialIndexes
-- Gerado manualmente a partir de AddDashboardGerencialIndexes.Up()

CREATE INDEX "IX_vendas_DataVenda_Cancelada"
    ON vendas ("DataVenda", "Cancelada");

CREATE INDEX "IX_compras_DataCompra_Status"
    ON compras ("DataCompra", "Status");

CREATE INDEX "IX_pagamentos_recebidos_DataPagamento"
    ON pagamentos_recebidos ("DataPagamento");

CREATE INDEX "IX_contas_receber_CreatedAt_DataVencimento"
    ON contas_receber ("CreatedAt", "DataVencimento");

CREATE INDEX "IX_eventos_financeiros_Tipo_Data"
    ON eventos_financeiros ("Tipo", "Data");

CREATE INDEX "IX_estoque_movimentacoes_ProdutoId_Data_Tipo"
    ON estoque_movimentacoes ("ProdutoId", "Data", "Tipo");

CREATE INDEX "IX_despesas_DataCompetencia"
    ON despesas ("DataCompetencia");

-- Rollback (Down):
-- DROP INDEX IF EXISTS "IX_vendas_DataVenda_Cancelada";
-- DROP INDEX IF EXISTS "IX_compras_DataCompra_Status";
-- DROP INDEX IF EXISTS "IX_pagamentos_recebidos_DataPagamento";
-- DROP INDEX IF EXISTS "IX_contas_receber_CreatedAt_DataVencimento";
-- DROP INDEX IF EXISTS "IX_eventos_financeiros_Tipo_Data";
-- DROP INDEX IF EXISTS "IX_estoque_movimentacoes_ProdutoId_Data_Tipo";
-- DROP INDEX IF EXISTS "IX_despesas_DataCompetencia";
