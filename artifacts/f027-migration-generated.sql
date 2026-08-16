START TRANSACTION;

CREATE TABLE compra_item_devolucoes (
    "Id" uuid NOT NULL,
    "CompraId" uuid NOT NULL,
    "CompraItemId" uuid NOT NULL,
    "CompraItemRecebimentoId" uuid,
    "EstoqueMovimentacaoId" uuid,
    "Momento" character varying(30) NOT NULL,
    "Quantidade" integer NOT NULL,
    "Motivo" character varying(40) NOT NULL,
    "DataDevolucao" timestamp with time zone NOT NULL,
    "Observacao" character varying(500),
    "OperacaoId" uuid NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    CONSTRAINT "PK_compra_item_devolucoes" PRIMARY KEY ("Id"),
    CONSTRAINT "CK_compra_item_devolucoes_MomentoReferencias" CHECK (("Momento" = 'AntesDoRecebimento' AND "CompraItemRecebimentoId" IS NULL AND "EstoqueMovimentacaoId" IS NULL) OR ("Momento" = 'DepoisDoRecebimento' AND "CompraItemRecebimentoId" IS NOT NULL AND "EstoqueMovimentacaoId" IS NOT NULL)),
    CONSTRAINT "CK_compra_item_devolucoes_ObservacaoOutro" CHECK ("Motivo" <> 'Outro' OR ("Observacao" IS NOT NULL AND length(trim("Observacao")) > 0)),
    CONSTRAINT "CK_compra_item_devolucoes_Quantidade" CHECK ("Quantidade" > 0),
    CONSTRAINT "FK_compra_item_devolucoes_compra_item_recebimentos_CompraItemR~" FOREIGN KEY ("CompraItemRecebimentoId") REFERENCES compra_item_recebimentos ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_compra_item_devolucoes_compra_items_CompraItemId" FOREIGN KEY ("CompraItemId") REFERENCES compra_items ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_compra_item_devolucoes_compras_CompraId" FOREIGN KEY ("CompraId") REFERENCES compras ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_compra_item_devolucoes_estoque_movimentacoes_EstoqueMovimen~" FOREIGN KEY ("EstoqueMovimentacaoId") REFERENCES estoque_movimentacoes ("Id") ON DELETE RESTRICT
);

CREATE TABLE compra_reembolsos (
    "Id" uuid NOT NULL,
    "CompraId" uuid NOT NULL,
    "Valor" numeric(18,2) NOT NULL,
    "DataReembolso" timestamp with time zone NOT NULL,
    "ReferenciaExterna" character varying(100),
    "Observacao" character varying(500),
    "OperacaoId" uuid NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    CONSTRAINT "PK_compra_reembolsos" PRIMARY KEY ("Id"),
    CONSTRAINT "CK_compra_reembolsos_Valor" CHECK ("Valor" > 0),
    CONSTRAINT "FK_compra_reembolsos_compras_CompraId" FOREIGN KEY ("CompraId") REFERENCES compras ("Id") ON DELETE RESTRICT
);

CREATE TABLE compra_item_devolucao_compensacoes (
    "Id" uuid NOT NULL,
    "CompraItemDevolucaoId" uuid NOT NULL,
    "EstoqueMovimentacaoId" uuid,
    "DataCompensacao" timestamp with time zone NOT NULL,
    "Motivo" character varying(500) NOT NULL,
    "PresencaFisicaConfirmada" boolean NOT NULL,
    "OperacaoId" uuid NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    CONSTRAINT "PK_compra_item_devolucao_compensacoes" PRIMARY KEY ("Id"),
    CONSTRAINT "CK_compra_item_devolucao_compensacoes_Motivo" CHECK (length(trim("Motivo")) > 0),
    CONSTRAINT "FK_compra_item_devolucao_compensacoes_compra_item_devolucoes_C~" FOREIGN KEY ("CompraItemDevolucaoId") REFERENCES compra_item_devolucoes ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_compra_item_devolucao_compensacoes_estoque_movimentacoes_Es~" FOREIGN KEY ("EstoqueMovimentacaoId") REFERENCES estoque_movimentacoes ("Id") ON DELETE RESTRICT
);

CREATE TABLE compra_reembolso_alocacoes (
    "Id" uuid NOT NULL,
    "CompraReembolsoId" uuid NOT NULL,
    "CompraItemId" uuid NOT NULL,
    "CompraItemPerdaId" uuid,
    "CompraItemDevolucaoId" uuid,
    "Valor" numeric(18,2) NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    CONSTRAINT "PK_compra_reembolso_alocacoes" PRIMARY KEY ("Id"),
    CONSTRAINT "CK_compra_reembolso_alocacoes_OcorrenciaUnica" CHECK (NOT ("CompraItemPerdaId" IS NOT NULL AND "CompraItemDevolucaoId" IS NOT NULL)),
    CONSTRAINT "CK_compra_reembolso_alocacoes_Valor" CHECK ("Valor" > 0),
    CONSTRAINT "FK_compra_reembolso_alocacoes_compra_item_devolucoes_CompraIte~" FOREIGN KEY ("CompraItemDevolucaoId") REFERENCES compra_item_devolucoes ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_compra_reembolso_alocacoes_compra_item_perdas_CompraItemPer~" FOREIGN KEY ("CompraItemPerdaId") REFERENCES compra_item_perdas ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_compra_reembolso_alocacoes_compra_items_CompraItemId" FOREIGN KEY ("CompraItemId") REFERENCES compra_items ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_compra_reembolso_alocacoes_compra_reembolsos_CompraReembols~" FOREIGN KEY ("CompraReembolsoId") REFERENCES compra_reembolsos ("Id") ON DELETE RESTRICT
);

CREATE TABLE compra_reembolso_cancelamentos (
    "Id" uuid NOT NULL,
    "CompraReembolsoId" uuid NOT NULL,
    "DataCancelamento" timestamp with time zone NOT NULL,
    "Motivo" character varying(500) NOT NULL,
    "OperacaoId" uuid NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    CONSTRAINT "PK_compra_reembolso_cancelamentos" PRIMARY KEY ("Id"),
    CONSTRAINT "CK_compra_reembolso_cancelamentos_Motivo" CHECK (length(trim("Motivo")) > 0),
    CONSTRAINT "FK_compra_reembolso_cancelamentos_compra_reembolsos_CompraReem~" FOREIGN KEY ("CompraReembolsoId") REFERENCES compra_reembolsos ("Id") ON DELETE RESTRICT
);

CREATE UNIQUE INDEX "IX_compra_item_devolucao_compensacoes_CompraItemDevolucaoId" ON compra_item_devolucao_compensacoes ("CompraItemDevolucaoId");

CREATE UNIQUE INDEX "IX_compra_item_devolucao_compensacoes_EstoqueMovimentacaoId" ON compra_item_devolucao_compensacoes ("EstoqueMovimentacaoId");

CREATE UNIQUE INDEX "IX_compra_item_devolucao_compensacoes_OperacaoId" ON compra_item_devolucao_compensacoes ("OperacaoId");

CREATE INDEX "IX_compra_item_devolucoes_CompraId_DataDevolucao" ON compra_item_devolucoes ("CompraId", "DataDevolucao");

CREATE INDEX "IX_compra_item_devolucoes_CompraItemId_Momento" ON compra_item_devolucoes ("CompraItemId", "Momento");

CREATE INDEX "IX_compra_item_devolucoes_CompraItemRecebimentoId" ON compra_item_devolucoes ("CompraItemRecebimentoId");

CREATE UNIQUE INDEX "IX_compra_item_devolucoes_EstoqueMovimentacaoId" ON compra_item_devolucoes ("EstoqueMovimentacaoId");

CREATE UNIQUE INDEX "IX_compra_item_devolucoes_OperacaoId" ON compra_item_devolucoes ("OperacaoId");

CREATE INDEX "IX_compra_reembolso_alocacoes_CompraItemDevolucaoId" ON compra_reembolso_alocacoes ("CompraItemDevolucaoId");

CREATE INDEX "IX_compra_reembolso_alocacoes_CompraItemId" ON compra_reembolso_alocacoes ("CompraItemId");

CREATE INDEX "IX_compra_reembolso_alocacoes_CompraItemPerdaId" ON compra_reembolso_alocacoes ("CompraItemPerdaId");

CREATE INDEX "IX_compra_reembolso_alocacoes_CompraReembolsoId" ON compra_reembolso_alocacoes ("CompraReembolsoId");

CREATE UNIQUE INDEX "IX_compra_reembolso_cancelamentos_CompraReembolsoId" ON compra_reembolso_cancelamentos ("CompraReembolsoId");

CREATE UNIQUE INDEX "IX_compra_reembolso_cancelamentos_OperacaoId" ON compra_reembolso_cancelamentos ("OperacaoId");

CREATE INDEX "IX_compra_reembolsos_CompraId_DataReembolso" ON compra_reembolsos ("CompraId", "DataReembolso");

CREATE UNIQUE INDEX "IX_compra_reembolsos_CompraId_ReferenciaExterna" ON compra_reembolsos ("CompraId", "ReferenciaExterna") WHERE "ReferenciaExterna" IS NOT NULL;

CREATE UNIQUE INDEX "IX_compra_reembolsos_OperacaoId" ON compra_reembolsos ("OperacaoId");

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260816163250_AddDevolucoesReembolsosCompras', '8.0.8');

COMMIT;

